'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { AppointmentStatus } from '@prisma/client';

async function isAdmin() {
    const session = await auth();
    if (session?.user?.role !== 'SUPERADMIN') {
        throw new Error('Unauthorized');
    }
}

export async function updateAppointmentStatus(id: string, status: string) {
    await isAdmin();

    await db.appointment.update({
        where: { id },
        data: { status: status as any },
    });

    revalidatePath('/admin/appointments');
    revalidatePath('/dashboard');
    revalidatePath('/appointments');
}

export async function addAdminNote(id: string, note: string) {
    await isAdmin();

    await db.appointment.update({
        where: { id },
        data: { adminNotes: note },
    });

    revalidatePath('/admin/appointments');
}
