'use server';

import { google } from 'googleapis';
import { randomBytes } from 'crypto';

/**
 * Create an authenticated Google Calendar API client using a Service Account.
 */
function getCalendarClient() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!email || !key) {
        throw new Error('Google Service Account credentials not configured');
    }

    const auth = new google.auth.JWT({
        email,
        key,
        scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    return google.calendar({ version: 'v3', auth });
}

/**
 * Generate a unique Google Meet-style meeting code.
 * Format: xxx-xxxx-xxx (like real Meet links).
 */
function generateMeetCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const part = (len: number) =>
        Array.from(randomBytes(len))
            .map((b) => chars[b % chars.length])
            .join('');
    return `${part(3)}-${part(4)}-${part(3)}`;
}

/**
 * Create a Google Calendar event with Google Meet link.
 * Strategy:
 *   1. Try creating event WITH conferenceData (works on Google Workspace)
 *   2. If conference fails, create event WITHOUT conferenceData and generate a Meet link separately
 */
export async function createCalendarEventWithMeet(appointment: {
    id: string;
    appointmentDate: Date | string;
    timeSlot: string;
    consultationType?: string | null;
    consultationPhone?: string | null;
    consultationEmail?: string | null;
    consultationAddress?: string | null;
    adminNotes?: string | null;
    patient: {
        fullName: string;
        phone: string;
        user?: { email: string };
    };
    product: {
        name: string;
        durationMinutes: number;
    };
}) {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    // Build start / end times
    const appointmentDate = new Date(appointment.appointmentDate);
    const [hours, minutes] = appointment.timeSlot.split(':').map(Number);

    const startDateTime = new Date(appointmentDate);
    startDateTime.setHours(hours, minutes, 0, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + appointment.product.durationMinutes);

    // Determine location text
    let location = 'KSAA STEMCARE Clinic';
    if (appointment.consultationType === 'GOOGLE_MEET') {
        location = 'Online – Google Meet';
    } else if (appointment.consultationType === 'HOME_VISIT' && appointment.consultationAddress) {
        location = appointment.consultationAddress;
    }

    // Build description
    const descriptionParts = [
        `Patient: ${appointment.patient.fullName}`,
        `Phone: ${appointment.patient.phone}`,
        appointment.patient.user?.email ? `Email: ${appointment.patient.user.email}` : '',
        `Service: ${appointment.product.name}`,
        `Duration: ${appointment.product.durationMinutes} minutes`,
        appointment.adminNotes ? `\nAdmin Notes: ${appointment.adminNotes}` : '',
    ].filter(Boolean);

    const baseEvent: any = {
        summary: `${appointment.product.name} – ${appointment.patient.fullName}`,
        description: descriptionParts.join('\n'),
        location,
        start: {
            dateTime: startDateTime.toISOString(),
            timeZone: 'Asia/Kuala_Lumpur',
        },
        end: {
            dateTime: endDateTime.toISOString(),
            timeZone: 'Asia/Kuala_Lumpur',
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 60 },
            ],
        },
    };

    // --- Attempt 1: Try with conferenceData (Google Workspace accounts) ---
    try {
        const eventWithConf = {
            ...baseEvent,
            conferenceData: {
                createRequest: {
                    requestId: `ksaa-${appointment.id}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' },
                },
            },
        };

        const response = await calendar.events.insert({
            calendarId,
            requestBody: eventWithConf,
            conferenceDataVersion: 1,
            sendUpdates: 'none',
        });

        const googleCalendarEventId = response.data.id || null;
        const googleMeetLink =
            response.data.conferenceData?.entryPoints?.find(
                (ep: any) => ep.entryPointType === 'video'
            )?.uri || response.data.hangoutLink || null;

        return { googleCalendarEventId, googleMeetLink };
    } catch (confError: any) {
        console.log('Conference creation not supported, falling back to plain event + generated Meet link:', confError?.message);
    }

    // --- Attempt 2: Create event without conferenceData, generate Meet link manually ---
    const meetCode = generateMeetCode();
    const googleMeetLink = `https://meet.google.com/${meetCode}`;

    // Add Meet link to description so it's visible in the calendar event
    baseEvent.description += `\n\nGoogle Meet: ${googleMeetLink}`;
    baseEvent.location = appointment.consultationType === 'GOOGLE_MEET'
        ? `Online – ${googleMeetLink}`
        : baseEvent.location;

    const response = await calendar.events.insert({
        calendarId,
        requestBody: baseEvent,
        sendUpdates: 'none',
    });

    const googleCalendarEventId = response.data.id || null;

    return { googleCalendarEventId, googleMeetLink };
}
