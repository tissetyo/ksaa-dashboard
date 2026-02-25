'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function cancelAppointment(appointmentId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const appointment = await db.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: true }
    });

    if (!appointment) {
        throw new Error('Appointment not found');
    }

    // Verify ownership
    if (appointment.patient.userId !== session.user.id) {
        throw new Error('Unauthorized');
    }

    if (appointment.status === 'CANCELLED') {
        throw new Error('Appointment is already cancelled');
    }

    if (appointment.status === 'COMPLETED') {
        throw new Error('Cannot cancel a completed appointment');
    }

    await db.appointment.update({
        where: { id: appointmentId },
        data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            cancellationReason: 'Cancelled by patient',
        },
    });

    // If there was a hold or quota, we might want to release it here
    // For now, simpler implementation just marks as cancelled

    revalidatePath('/dashboard');
    revalidatePath('/appointments');
    revalidatePath(`/appointments/${appointmentId}`);

    return { success: true };
}
