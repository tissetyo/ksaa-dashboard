'use server';

import { google } from 'googleapis';

/**
 * Create an authenticated client for Google APIs using a Service Account.
 */
function getAuthClient() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!email || !key) {
        throw new Error('Google Service Account credentials not configured');
    }

    return new google.auth.JWT({
        email,
        key,
        scopes: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/meetings.space.created',
        ],
    });
}

/**
 * Create a Google Meet meeting space using the Meet REST API.
 * Returns the meeting URI (e.g. https://meet.google.com/xxx-xxxx-xxx).
 */
async function createMeetSpace(auth: any): Promise<string> {
    const res = await google.meet({ version: 'v2', auth }).spaces.create({
        requestBody: {},
    });
    return res.data.meetingUri!;
}

/**
 * Create a Google Calendar event and a real Google Meet link.
 * 
 * Steps:
 *   1. Create a Google Meet space (real, working link)
 *   2. Create a Google Calendar event with the Meet link in description
 * 
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
    const auth = getAuthClient();
    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    // Step 1: Create a real Google Meet space
    const googleMeetLink = await createMeetSpace(auth);

    // Step 2: Build the calendar event
    const appointmentDate = new Date(appointment.appointmentDate);
    const [hours, minutes] = appointment.timeSlot.split(':').map(Number);

    const startDateTime = new Date(appointmentDate);
    startDateTime.setHours(hours, minutes, 0, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + appointment.product.durationMinutes);

    // Determine location text
    let location = 'KSAA STEMCARE Clinic';
    if (appointment.consultationType === 'GOOGLE_MEET') {
        location = `Online – ${googleMeetLink}`;
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
        `\nGoogle Meet: ${googleMeetLink}`,
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

    const response = await calendar.events.insert({
        calendarId,
        requestBody: event,
        sendUpdates: 'none',
    });

    const googleCalendarEventId = response.data.id || null;

    return { googleCalendarEventId, googleMeetLink };
}
