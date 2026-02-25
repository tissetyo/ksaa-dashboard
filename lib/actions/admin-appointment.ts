'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { generateReviewToken } from '@/lib/actions/review';

async function isAdminOrStaff() {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== 'SUPERADMIN' && role !== 'STAFF') {
        throw new Error('Unauthorized');
    }
    return session;
}

export async function updateAppointmentStatus(id: string, status: string) {
    await isAdminOrStaff();

    await db.appointment.update({
        where: { id },
        data: { status: status as any },
    });

    revalidatePath('/admin/appointments');
    revalidatePath('/dashboard');
    revalidatePath('/appointments');
}

export async function addAdminNote(id: string, note: string) {
    await isAdminOrStaff();

    await db.appointment.update({
        where: { id },
        data: { adminNotes: note },
    });

    revalidatePath('/admin/appointments');
}

// Confirm appointment and create Google Calendar event with Meet link
export async function confirmAppointment(appointmentId: string) {
    const session = await isAdminOrStaff();

    try {
        // Fetch appointment with relations needed for calendar event
        const appointment = await db.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                patient: {
                    include: {
                        user: { select: { email: true } },
                    },
                },
                product: true,
            },
        });

        if (!appointment) {
            return { success: false, error: 'Appointment not found' };
        }

        // Try to create Google Calendar event with Meet link
        let googleCalendarEventId: string | null = null;
        let googleMeetLink: string | null = null;

        try {
            const { createCalendarEventWithMeet } = await import('@/lib/google-calendar');
            const result = await createCalendarEventWithMeet(appointment, session!.user!.id as string);
            googleCalendarEventId = result.googleCalendarEventId;
            googleMeetLink = result.googleMeetLink;
        } catch (calError: any) {
            console.error('Google Calendar event creation failed (continuing with confirmation):', calError?.message);
        }

        await db.appointment.update({
            where: { id: appointmentId },
            data: {
                status: 'CONFIRMED',
                ...(googleCalendarEventId && { googleCalendarEventId }),
                ...(googleMeetLink && { googleMeetLink }),
            },
        });

        revalidatePath('/admin/appointments');
        revalidatePath('/dashboard');
        revalidatePath('/appointments');

        return { success: true, googleMeetLink };
    } catch (error) {
        console.error('Error confirming appointment:', error);
        return { success: false, error: 'Failed to confirm appointment' };
    }
}

// Complete appointment with treatment report
export async function completeAppointment(
    appointmentId: string,
    treatmentReport: string,
    staffId?: string,
    attendingStaffOther?: string,
    recommendation?: {
        productId?: string;
        customServiceName?: string;
        scheduledDate?: string;
        staffNote?: string;
    }
) {
    await isAdminOrStaff();

    try {
        const appointment = await db.appointment.update({
            where: { id: appointmentId },
            data: {
                status: 'COMPLETED',
                treatmentReport,
                completedAt: new Date(),
                staffId: staffId || undefined,
                attendingStaffOther: attendingStaffOther || undefined,
            },
        });

        // Create service recommendation if provided
        if (recommendation && (recommendation.productId || recommendation.customServiceName)) {
            // For custom services without a productId, skip (no product link)
            if (recommendation.productId) {
                await db.serviceRecommendation.create({
                    data: {
                        appointmentId,
                        patientId: appointment.patientId,
                        productId: recommendation.productId,
                        staffNote: recommendation.staffNote || null,
                        scheduledDate: recommendation.scheduledDate ? new Date(recommendation.scheduledDate) : null,
                        status: 'PENDING',
                    },
                });
            }
            // TODO: handle custom service name (create custom product or store as text)
        }

        // Automatically generate review token
        const { token } = await generateReviewToken(appointmentId, staffId);

        revalidatePath('/admin/appointments');
        revalidatePath('/dashboard');
        revalidatePath('/appointments');

        return { success: true, reviewToken: token };
    } catch (error) {
        console.error('Error completing appointment:', error);
        return { success: false, error: 'Failed to complete appointment' };
    }
}

// Cancel appointment with reason
export async function cancelAppointment(appointmentId: string, cancellationReason: string) {
    await isAdminOrStaff();

    try {
        await db.appointment.update({
            where: { id: appointmentId },
            data: {
                status: 'CANCELLED',
                cancellationReason,
                cancelledAt: new Date(),
            },
        });

        revalidatePath('/admin/appointments');
        revalidatePath('/dashboard');
        revalidatePath('/appointments');

        return { success: true };
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        return { success: false, error: 'Failed to cancel appointment' };
    }
}

// Get patient history with all appointments
export async function getPatientHistory(patientId: string) {
    await isAdminOrStaff();

    try {
        const patient = await db.patient.findUnique({
            where: { id: patientId },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
        });

        const appointments = await db.appointment.findMany({
            where: { patientId },
            include: {
                product: true,
            },
            orderBy: {
                appointmentDate: 'desc',
            },
        });

        return {
            success: true,
            patient,
            appointments,
        };
    } catch (error) {
        console.error('Error fetching patient history:', error);
        return { success: false, error: 'Failed to fetch patient history' };
    }
}

// Create Google Calendar event with Meet link for an existing appointment
export async function createGoogleCalendarEvent(appointmentId: string) {
    const session = await isAdminOrStaff();

    try {
        const appointment = await db.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                patient: {
                    include: {
                        user: { select: { email: true } },
                    },
                },
                product: true,
            },
        });

        if (!appointment) {
            return { success: false, error: 'Appointment not found' };
        }

        if (appointment.googleMeetLink) {
            return { success: false, error: 'Appointment already has a Google Meet link' };
        }

        const { createCalendarEventWithMeet } = await import('@/lib/google-calendar');
        const result = await createCalendarEventWithMeet(appointment, session!.user!.id as string);

        await db.appointment.update({
            where: { id: appointmentId },
            data: {
                ...(result.googleCalendarEventId && { googleCalendarEventId: result.googleCalendarEventId }),
                ...(result.googleMeetLink && { googleMeetLink: result.googleMeetLink }),
            },
        });

        revalidatePath('/admin/appointments');
        revalidatePath(`/appointments/${appointmentId}`);

        return { success: true, googleMeetLink: result.googleMeetLink };
    } catch (error: any) {
        console.error('Error creating Google Calendar event:', error);
        const detail = error?.message || error?.errors?.[0]?.message || 'Unknown error';
        return { success: false, error: `Failed to create Google Calendar event: ${detail}` };
    }
}

// Create an appointment on behalf of a patient (Admin functionality)
export async function createAppointmentFromAdmin(data: {
    patientId: string;
    productId: string;
    appointmentDate: string;
    timeSlot: string;
    consultationType?: 'GOOGLE_MEET' | 'WHATSAPP_CALL' | 'IN_PERSON' | 'HOME_VISIT';
    adminNotes?: string;
}) {
    await isAdminOrStaff();

    try {
        const product = await db.product.findUnique({ where: { id: data.productId } });
        if (!product) throw new Error('Product not found');

        const totalAmount = product.priceMYR || 0;

        const appointment = await db.appointment.create({
            data: {
                patientId: data.patientId,
                productId: data.productId,
                appointmentDate: new Date(data.appointmentDate.split('T')[0] + 'T12:00:00'),
                timeSlot: data.timeSlot,
                status: 'PENDING',
                paymentStatus: 'UNPAID',
                totalAmountMYR: totalAmount,
                paidAmountMYR: 0,
                balanceAmountMYR: totalAmount,
                consultationType: data.consultationType,
                adminNotes: data.adminNotes,
            },
        });

        // Update Daily Quota
        const bookingDate = new Date(data.appointmentDate);
        bookingDate.setHours(0, 0, 0, 0);

        await db.dailyQuota.upsert({
            where: {
                productId_bookingDate: {
                    productId: data.productId,
                    bookingDate: bookingDate,
                },
            },
            update: {
                bookedCount: { increment: 1 },
            },
            create: {
                productId: data.productId,
                bookingDate: bookingDate,
                bookedCount: 1,
                maxQuota: product.quotaPerDay,
            },
        });

        revalidatePath('/admin/appointments');
        revalidatePath('/admin/schedule');
        revalidatePath('/dashboard');

        return { success: true, appointmentId: appointment.id };
    } catch (error: any) {
        console.error('Failed to create appointment from admin:', error);
        return { success: false, error: error.message || 'Failed to create appointment' };
    }
}
