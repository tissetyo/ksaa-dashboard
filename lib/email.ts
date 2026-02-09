import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey && process.env.NODE_ENV === 'production') {
    console.warn('RESEND_API_KEY is missing in production build');
}

const resend = new Resend(resendApiKey || 're_123456789');

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'admin@ksaa.com';

/**
 * Send email notification when a service is booked
 */
export async function sendServiceBookingNotification(data: {
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    serviceName: string;
    appointmentDate: string;
    appointmentTime: string;
}) {
    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: NOTIFICATION_EMAIL,
            subject: `New Service Booking: ${data.serviceName}`,
            html: `
                <h2>New Service Booking</h2>
                <p>A new appointment has been booked.</p>
                
                <h3>Patient Information:</h3>
                <ul>
                    <li><strong>Name:</strong> ${data.patientName}</li>
                    <li><strong>Email:</strong> ${data.patientEmail}</li>
                    <li><strong>Phone:</strong> ${data.patientPhone}</li>
                </ul>
                
                <h3>Appointment Details:</h3>
                <ul>
                    <li><strong>Service:</strong> ${data.serviceName}</li>
                    <li><strong>Date:</strong> ${data.appointmentDate}</li>
                    <li><strong>Time:</strong> ${data.appointmentTime}</li>
                </ul>
            `,
        });
        console.log('[EMAIL] Service booking notification sent');
    } catch (error) {
        console.error('[EMAIL_ERROR] Failed to send service booking notification:', error);
    }
}

/**
 * Send email to staff when a new patient signs up with their referral code
 */
export async function sendReferralSignupNotification(data: {
    staffName: string;
    staffEmail: string;
    staffCode: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
}) {
    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: data.staffEmail,
            subject: `New Referral Signup - ${data.patientName}`,
            html: `
                <h2>New Patient Referral!</h2>
                <p>Hi ${data.staffName},</p>
                <p>A new patient has signed up using your referral code <strong>${data.staffCode}</strong>.</p>
                
                <h3>Patient Information:</h3>
                <ul>
                    <li><strong>Name:</strong> ${data.patientName}</li>
                    <li><strong>Email:</strong> ${data.patientEmail}</li>
                    <li><strong>Phone:</strong> ${data.patientPhone}</li>
                </ul>
                
                <p>Thank you for referring new patients to our clinic!</p>
            `,
        });
        console.log('[EMAIL] Referral signup notification sent to staff');
    } catch (error) {
        console.error('[EMAIL_ERROR] Failed to send referral signup notification:', error);
    }
}

/**
 * Send email to staff when a referred patient books a service
 */
export async function sendReferralServiceBookingNotification(data: {
    staffName: string;
    staffEmail: string;
    patientName: string;
    serviceName: string;
    appointmentDate: string;
    appointmentTime: string;
}) {
    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: data.staffEmail,
            subject: `Your Referral Booked a Service - ${data.patientName}`,
            html: `
                <h2>Referral Service Booking</h2>
                <p>Hi ${data.staffName},</p>
                <p>Great news! A patient you referred has booked a service.</p>
                
                <h3>Patient:</h3>
                <p><strong>${data.patientName}</strong></p>
                
                <h3>Service Details:</h3>
                <ul>
                    <li><strong>Service:</strong> ${data.serviceName}</li>
                    <li><strong>Date:</strong> ${data.appointmentDate}</li>
                    <li><strong>Time:</strong> ${data.appointmentTime}</li>
                </ul>
                
                <p>Thank you for your continued support!</p>
            `,
        });
        console.log('[EMAIL] Referral service booking notification sent to staff');
    } catch (error) {
        console.error('[EMAIL_ERROR] Failed to send referral service booking notification:', error);
    }
}
