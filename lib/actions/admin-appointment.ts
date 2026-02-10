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

// Confirm appointment and optionally set up Google Meet link
export async function confirmAppointment(appointmentId: string) {
    await isAdminOrStaff();

    try {
        await db.appointment.update({
            where: { id: appointmentId },
            data: {
                status: 'CONFIRMED',
            },
        });

        revalidatePath('/admin/appointments');
        revalidatePath('/dashboard');
        revalidatePath('/appointments');

        return { success: true };
    } catch (error) {
        console.error('Error confirming appointment:', error);
        return { success: false, error: 'Failed to confirm appointment' };
    }
}

// Complete appointment with treatment report
export async function completeAppointment(appointmentId: string, treatmentReport: string, staffId?: string) {
    await isAdminOrStaff();

    try {
        await db.appointment.update({
            where: { id: appointmentId },
            data: {
                status: 'COMPLETED',
                treatmentReport,
                completedAt: new Date(),
                staffId: staffId || undefined // Associate staff if provided
            },
        });

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
