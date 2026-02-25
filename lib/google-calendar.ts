'use server';

/**
 * Google Calendar + Meet integration via Google Apps Script.
 * 
 * The Apps Script runs as a regular Google user (not a service account),
 * so it can create Google Meet links on consumer/free Google accounts.
 * 
 * Requires env var: GOOGLE_APPS_SCRIPT_URL
 */

/**
 * Create a Google Calendar event with a real Google Meet link
 * by calling the deployed Google Apps Script web app.
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
    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

    if (!scriptUrl) {
        throw new Error('GOOGLE_APPS_SCRIPT_URL is not configured');
    }

    // Build start / end times
    const appointmentDate = new Date(appointment.appointmentDate);
    const [hours, minutes] = appointment.timeSlot.split(':').map(Number);

    const startDateTime = new Date(appointmentDate);
    startDateTime.setHours(hours, minutes, 0, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + appointment.product.durationMinutes);

    // Determine location
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

    // Call the Google Apps Script web app
    const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            summary: `${appointment.product.name} – ${appointment.patient.fullName}`,
            description: descriptionParts.join('\n'),
            location,
            startDateTime: startDateTime.toISOString(),
            endDateTime: endDateTime.toISOString(),
            requestId: `ksaa-${appointment.id}`,
            patientEmail: appointment.patient.user?.email || '',
        }),
    });

    // Apps Script redirects on POST, follow the redirect
    const result = await response.json();

    if (!result.success) {
        throw new Error(result.error || 'Apps Script returned an error');
    }

    return {
        googleCalendarEventId: result.eventId || null,
        googleMeetLink: result.meetLink || null,
    };
}
