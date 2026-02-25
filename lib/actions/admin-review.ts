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

export async function getAdminReviews() {
    await isAdminOrStaff();

    const reviews = await db.review.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            appointment: {
                select: {
                    appointmentDate: true,
                    timeSlot: true,
                }
            },
            product: {
                select: { name: true }
            },
            staff: {
                select: { fullName: true }
            },
            patient: {
                select: { fullName: true, phone: true }
            }
        }
    });

    return { success: true, reviews };
}

export async function toggleReviewApproval(reviewId: string, isApproved: boolean) {
    await isAdminOrStaff();

    await db.review.update({
        where: { id: reviewId },
        data: { isApproved }
    });

    revalidatePath('/admin/reviews');
    return { success: true };
}

export async function deleteReview(reviewId: string) {
    await isAdminOrStaff();

    await db.review.delete({
        where: { id: reviewId }
    });

    revalidatePath('/admin/reviews');
    return { success: true };
}
