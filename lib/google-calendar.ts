'use server';

import { google } from 'googleapis';

/**
 * Create an authenticated Google Calendar API client using a Service Account.
 * Requires env vars:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
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
 * Create a Google Calendar event with an auto-generated Google Meet link.
 * Returns the calendar event ID and Meet link URL.
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

    const event: any = {
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

    // Note: Service accounts cannot add attendees without Domain-Wide Delegation.
    // The Meet link is shared with patients via the app UI instead.

    // Request automatic Google Meet conferencing
    event.conferenceData = {
        createRequest: {
            requestId: `ksaa-${appointment.id}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
    };

    const response = await calendar.events.insert({
        calendarId,
        requestBody: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all',
    });

    const googleCalendarEventId = response.data.id || null;
    const googleMeetLink =
        response.data.conferenceData?.entryPoints?.find(
            (ep: any) => ep.entryPointType === 'video'
        )?.uri || response.data.hangoutLink || null;

    return { googleCalendarEventId, googleMeetLink };
}
