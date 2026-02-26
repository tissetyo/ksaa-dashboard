'use server';

import { google } from 'googleapis';
import { db } from '@/lib/db';

/**
 * Get the Google Calendar client authenticated as the specific user.
 * This looks up their OAuth tokens in the database and automatically handles
 * token refresh if the access token has expired.
 */
async function getCalendarClientForUser(userId: string) {
    // 1. Find the user's Google connected account
    const account = await db.account.findFirst({
        where: {
            userId: userId,
            provider: 'google',
        },
    });

    if (!account) {
        throw new Error('User has not connected a Google account');
    }

    if (!account.access_token) {
        throw new Error('Google account connected but no access token is available');
    }

    // 2. Set up the OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        // The redirect URI doesn't matter for token use, only for the initial flow
    );

    oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        // Some adapters store expires_at as Unix timestamp in seconds
        expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
    });

    // 3. Listen for automatic token refreshes and save the new tokens
    oauth2Client.on('tokens', async (tokens) => {
        try {
            if (tokens.access_token) {
                await db.account.update({
                    where: { id: account.id },
                    data: {
                        access_token: tokens.access_token,
                        ...(tokens.refresh_token && { refresh_token: tokens.refresh_token }),
                        ...(tokens.expiry_date && { expires_at: Math.floor(tokens.expiry_date / 1000) }),
                    },
                });
                console.log(`[Google Calendar] Refreshed access token for user ${userId}`);
            }
        } catch (error) {
            console.error('[Google Calendar] Failed to save refreshed token in DB:', error);
        }
    });

    return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Create a Google Calendar event with a real Google Meet link.
 * 
 * Uses the staff/admin's connected Google account via OAuth. This ensures
 * they are the meeting organizer and the event appears on their personal calendar.
 */
export async function createCalendarEventWithMeet(
    appointment: {
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
    },
    userId: string
) {
    if (!userId) {
        throw new Error('A logged-in userId is required to create a calendar event');
    }

    const calendar = await getCalendarClientForUser(userId);
    const calendarId = 'primary'; // Create the event on their primary calendar

    // Extract time explicitly for local usage
    const [hours, minutes] = appointment.timeSlot.split(':').map(Number);

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

    // Calculate dates treating it as local time, format correctly for Google
    // Google API requires YYYY-MM-DDTHH:mm:SS without the 'Z' if timeZone is specified separately.
    const pad = (n: number) => String(n).padStart(2, '0');

    // E.g., appointmentDate is '2026-02-26T12:00:00.000Z' or Date object
    const dStr = typeof appointment.appointmentDate === 'string'
        ? appointment.appointmentDate.split('T')[0]
        : appointment.appointmentDate.toISOString().split('T')[0];
    // Construct local ISO-like string without Z
    const startIsoLocal = `${dStr}T${pad(hours)}:${pad(minutes)}:00`;

    // Calculate end time
    const startObj = new Date(`${dStr}T${pad(hours)}:${pad(minutes)}:00`);
    const endObj = new Date(startObj.getTime() + appointment.product.durationMinutes * 60000);

    const endIsoLocal = `${endObj.getFullYear()}-${pad(endObj.getMonth() + 1)}-${pad(endObj.getDate())}T${pad(endObj.getHours())}:${pad(endObj.getMinutes())}:00`;

    const event: any = {
        summary: `${appointment.product.name} – ${appointment.patient.fullName}`,
        description: descriptionParts.join('\n'),
        location,
        start: {
            dateTime: startIsoLocal,
            timeZone: 'Asia/Kuala_Lumpur',
        },
        end: {
            dateTime: endIsoLocal,
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

    // Add patient as guest so they can join Google Meet directly without approval
    if (appointment.patient.user?.email) {
        event.guestsCanInviteOthers = false;
        event.guestsCanModify = false;
        event.guestsCanSeeOtherGuests = true;
        event.attendees = [
            {
                email: appointment.patient.user.email,
                displayName: appointment.patient.fullName,
            },
        ];
    }

    // Request automatic Google Meet conferencing
    // Since this uses a real user's OAuth token, it works natively!
    event.conferenceData = {
        createRequest: {
            requestId: `ksaa-${appointment.id}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
    };

    const response = await calendar.events.insert({
        calendarId,
        requestBody: event,
        conferenceDataVersion: 1, // Must be 1 to enable conferenceData
        sendUpdates: appointment.patient.user?.email ? 'all' : 'none', // Send invite email if patient email is present
    });

    const googleCalendarEventId = response.data.id || null;
    const googleMeetLink =
        response.data.conferenceData?.entryPoints?.find(
            (ep: any) => ep.entryPointType === 'video'
        )?.uri || response.data.hangoutLink || null;

    return { googleCalendarEventId, googleMeetLink };
}
