'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function isAdminOrStaff() {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== 'SUPERADMIN' && role !== 'STAFF') {
        throw new Error('Unauthorized');
    }
    return session;
}

export async function getPromotions() {
    await isAdminOrStaff();

    return db.promotion.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export async function createPromotion(data: {
    title: string;
    description: string;
    type: string; // EVENT, DISCOUNT, ANNOUNCEMENT
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    imageUrl?: string;
}) {
    await isAdminOrStaff();

    const promo = await db.promotion.create({
        data: {
            title: data.title,
            description: data.description,
            type: data.type,
            isActive: data.isActive,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            imageUrl: data.imageUrl || null,
        }
    });

    revalidatePath('/admin/promotions');
    return promo;
}

export async function togglePromotion(id: string, isActive: boolean) {
    await isAdminOrStaff();

    await db.promotion.update({
        where: { id },
        data: { isActive }
    });

    revalidatePath('/admin/promotions');
    return { success: true };
}

export async function deletePromotion(id: string) {
    await isAdminOrStaff();

    await db.promotion.delete({
        where: { id }
    });

    revalidatePath('/admin/promotions');
    return { success: true };
}

// Public: get active promotions for patient-facing page
export async function getActivePromotions() {
    return db.promotion.findMany({
        where: {
            isActive: true,
            OR: [
                { endDate: null },
                { endDate: { gte: new Date() } },
            ],
        },
        orderBy: { createdAt: 'desc' },
    });
}
