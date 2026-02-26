import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey && process.env.NODE_ENV === 'production') {
    console.warn('RESEND_API_KEY is missing in production build');
}

const resend = new Resend(resendApiKey || 're_123456789');

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
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

/**
 * Send welcome email to a patient created by an admin
 */
export async function sendPatientWelcomeEmail(data: {
    patientName: string;
    email: string;
    temporaryPassword?: string;
}) {
    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: data.email,
            subject: 'Welcome to KSAA Clinic - Your Account is Ready',
            html: `
                <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
                    <h2 style="color: #008E7E;">Welcome to KSAA Clinic!</h2>
                    <p>Hi ${data.patientName},</p>
                    <p>An account has been created for you at KSAA Clinic to manage your appointments and health records.</p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #334155;">Your Login Details</h3>
                        <p><strong>Email:</strong> ${data.email}</p>
                        ${data.temporaryPassword ? `<p><strong>Temporary Password:</strong> ${data.temporaryPassword}</p>` : ''}
                    </div>
                    
                    <p>Please log in to our portal to complete your profile and view your upcoming appointments.</p>
                    
                    <a href="${process.env.NEXTAUTH_URL || 'https://ksaa-dashboard.vercel.app'}/login" 
                       style="display: inline-block; background-color: #008E7E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
                        Access Portal
                    </a>
                    
                    ${data.temporaryPassword ? `<p style="font-size: 12px; color: #64748b; margin-top: 30px;">For your security, we recommend changing your password after you log in.</p>` : ''}
                    <p style="color: #64748b;">If you prefer, you can also log in securely using your Google account if it uses the same email address.</p>
                </div>
            `,
        });
        console.log('[EMAIL] Patient welcome email sent');
    } catch (error) {
        console.error('[EMAIL_ERROR] Failed to send patient welcome email:', error);
    }
}
