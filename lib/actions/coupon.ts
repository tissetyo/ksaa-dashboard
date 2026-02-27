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

export async function lookupCoupon(code: string) {
    await isAdminOrStaff();

    const coupon = await db.rewardCoupon.findUnique({
        where: { code },
        include: {
            review: {
                include: {
                    appointment: {
                        include: {
                            patient: {
                                select: { fullName: true, phone: true }
                            },
                            product: {
                                select: { name: true }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!coupon) {
        return { success: false, error: 'Coupon not found' };
    }

    return {
        success: true,
        coupon: {
            id: coupon.id,
            code: coupon.code,
            type: coupon.type,
            description: coupon.description,
            isRedeemed: coupon.isRedeemed,
            redeemedAt: coupon.redeemedAt,
            createdAt: coupon.createdAt,
            patientName: coupon.review.appointment?.patient?.fullName || 'Unknown',
            patientPhone: coupon.review.appointment?.patient?.phone || '',
            serviceName: coupon.review.appointment?.product?.name || 'Unknown',
            rating: coupon.review.rating,
        }
    };
}

export async function redeemCoupon(couponId: string) {
    const session = await auth();
    if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'STAFF')) {
        return { success: false, error: 'Unauthorized' };
    }

    const coupon = await db.rewardCoupon.findUnique({
        where: { id: couponId }
    });

    if (!coupon) {
        return { success: false, error: 'Coupon not found' };
    }

    if (coupon.isRedeemed) {
        return { success: false, error: 'Coupon has already been redeemed' };
    }

    await db.rewardCoupon.update({
        where: { id: couponId },
        data: {
            isRedeemed: true,
            redeemedAt: new Date(),
            redeemedBy: session.user.id,
        }
    });

    revalidatePath('/admin/reviews');

    return { success: true };
}

export async function getAllCoupons() {
    await isAdminOrStaff();

    const coupons = await db.rewardCoupon.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            review: {
                include: {
                    appointment: {
                        include: {
                            patient: {
                                select: { fullName: true }
                            },
                            product: {
                                select: { name: true }
                            }
                        }
                    }
                }
            }
        }
    });

    return coupons.map(c => ({
        id: c.id,
        code: c.code,
        type: c.type,
        description: c.description,
        isRedeemed: c.isRedeemed,
        redeemedAt: c.redeemedAt,
        createdAt: c.createdAt,
        patientName: c.review.appointment?.patient?.fullName || 'Unknown',
        serviceName: c.review.appointment?.product?.name || 'Unknown',
    }));
}
