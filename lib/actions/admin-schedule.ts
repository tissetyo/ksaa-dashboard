'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

async function isAdmin() {
    const session = await auth();
    if (session?.user?.role !== 'SUPERADMIN') {
        throw new Error('Unauthorized');
    }
}

export async function toggleScheduleSlot(dayOfWeek: number, timeSlot: string, isActive: boolean) {
    await isAdmin();

    await db.availabilitySlot.upsert({
        where: { dayOfWeek_timeSlot: { dayOfWeek, timeSlot } },
        update: { isActive },
        create: { dayOfWeek, timeSlot, isActive },
    });

    revalidatePath('/admin/schedule');
    revalidatePath('/book'); // Revalidate booking page when schedule changes
}

export async function addDateOverride(data: any) {
    await isAdmin();

    const { specificDate, isClosed, reason, customTimeSlots } = data;

    await db.dateOverride.upsert({
        where: { specificDate: new Date(specificDate) },
        update: {
            isClosed: isClosed === 'true' || isClosed === true,
            reason,
            customTimeSlots: customTimeSlots ? JSON.stringify(customTimeSlots) : null,
        },
        create: {
            specificDate: new Date(specificDate),
            isClosed: isClosed === 'true' || isClosed === true,
            reason,
            customTimeSlots: customTimeSlots ? JSON.stringify(customTimeSlots) : null,
        },
    });

    revalidatePath('/admin/schedule');
}

export async function deleteDateOverride(id: string) {
    await isAdmin();
    await db.dateOverride.delete({ where: { id } });
    revalidatePath('/admin/schedule');
}
