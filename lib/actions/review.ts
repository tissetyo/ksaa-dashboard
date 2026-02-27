'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

// Generate a review token for an appointment
export async function generateReviewToken(appointmentId: string, staffId?: string) {
    const session = await auth();
    // Allow admins and staff to generate tokens
    if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'STAFF')) {
        throw new Error('Unauthorized');
    }

    // Check if appointment exists and is completed
    const appointment = await db.appointment.findUnique({
        where: { id: appointmentId },
        include: {
            reviewToken: true,
            review: true
        }
    });

    if (!appointment) {
        throw new Error('Appointment not found');
    }

    if (appointment.status !== 'COMPLETED') {
        throw new Error('Appointment must be completed to generate a review link');
    }

    // Return existing token if valid
    if (appointment.reviewToken) {
        if (!appointment.reviewToken.isUsed && new Date(appointment.reviewToken.expiresAt) > new Date()) {
            return { token: appointment.reviewToken.token };
        }
        // If expired or used, we might want to generate a new one or returned used status
        // For now, let's create a new one if expired
        if (new Date(appointment.reviewToken.expiresAt) <= new Date()) {
            await db.reviewToken.delete({
                where: { id: appointment.reviewToken.id }
            });
        } else if (appointment.reviewToken.isUsed) {
            return { error: 'Review already submitted for this appointment' };
        }
    }

    // Create new token
    // Expires in 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const reviewToken = await db.reviewToken.create({
        data: {
            appointmentId,
            productId: appointment.productId,
            staffId: staffId || appointment.staffId, // Use passed staffId or existing one on appointment
            expiresAt,
        }
    });

    return { token: reviewToken.token };
}

// Get review data by token
export async function getReviewByToken(token: string) {
    const reviewToken = await db.reviewToken.findUnique({
        where: { token },
        include: {
            appointment: {
                include: {
                    product: true,
                    patient: {
                        select: {
                            userId: true,
                            fullName: true
                        }
                    }
                }
            },
            review: {
                select: {
                    createdAt: true
                }
            }
        }
    });

    if (!reviewToken) {
        return { error: 'Invalid token' };
    }

    if (reviewToken.isUsed) {
        // Check if it was used very recently (e.g., within last 5 minutes)
        // This likely means the user just submitted it and the page refreshed
        if (reviewToken.review) {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            if (reviewToken.review.createdAt > fiveMinutesAgo) {
                return { error: 'ReviewSubmitted', recent: true };
            }
        }
        return { error: 'This review link has already been used' };
    }

    if (new Date(reviewToken.expiresAt) < new Date()) {
        return { error: 'This review link has expired' };
    }

    return {
        success: true,
        data: {
            token: reviewToken.token,
            serviceName: reviewToken.appointment.product.name,
            productId: reviewToken.appointment.productId,
            appointmentDate: reviewToken.appointment.appointmentDate,
            timeSlot: reviewToken.appointment.timeSlot,
            consultationType: reviewToken.appointment.consultationType,
            consultationAddress: reviewToken.appointment.consultationAddress,
            durationMinutes: reviewToken.appointment.product.durationMinutes,
            patientName: reviewToken.appointment.patient.fullName,
            patientUserId: reviewToken.appointment.patient.userId,
            customerType: reviewToken.appointment.customerType,
        }
    };
}

// Submit a review
export async function submitReview(data: {
    token: string;
    rating: number;
    comment: string;
    staffId?: string; // Optional, selected by user
    reviewerName?: string; // If guest
    reviewerEmail?: string; // If guest
}) {
    // 1. Validate Token
    const reviewToken = await db.reviewToken.findUnique({
        where: { token: data.token },
        include: {
            appointment: {
                include: {
                    patient: true
                }
            }
        }
    });

    if (!reviewToken || reviewToken.isUsed || new Date(reviewToken.expiresAt) < new Date()) {
        throw new Error('Invalid or expired review token');
    }

    // 2. Identify Reviewer
    const session = await auth();
    let reviewerName = data.reviewerName;
    let reviewerEmail = data.reviewerEmail;

    // If logged in, verify identity matches appointment patient (optional security check)
    // Or just use logged in user's details
    if (session?.user) {
        // We could enforce that session.user.id === reviewToken.appointment.patient.userId
        // But for flexibility (maybe parent booking for child), we just allow it but record connection
    }

    // 3. Create Review
    // We need to fetch patientId from appointment if not available
    const patientId = reviewToken.appointment.patientId;
    const staffId = reviewToken.staffId || data.staffId;  // If token has staffId, use it

    const review = await db.review.create({
        data: {
            rating: data.rating,
            comment: data.comment,
            // Connect using ID fields
            appointment: { connect: { id: reviewToken.appointmentId } },
            product: { connect: { id: reviewToken.productId } },
            // Optional connections
            ...(staffId ? { staff: { connect: { id: staffId } } } : {}),
            ...(patientId ? { patient: { connect: { id: patientId } } } : {}),

            token: { connect: { id: reviewToken.id } },

            reviewerName: reviewerName || reviewToken.appointment.patient.fullName,
            reviewerEmail: reviewerEmail,
            isApproved: false, // Requires admin approval
            isPublic: true
        }
    });

    // 4. Mark token as used
    await db.reviewToken.update({
        where: { id: reviewToken.id },
        data: { isUsed: true }
    });

    // 5. Generate reward coupon based on customerType
    let coupon = null;
    const customerType = reviewToken.appointment.customerType;
    if (customerType) {
        const couponType = customerType === 'POTENTIAL_CUSTOMER' ? 'FREE_STEMCELLS' : 'FREE_ITEM';
        const couponDescription = customerType === 'POTENTIAL_CUSTOMER'
            ? 'Free 5 Million Stemcells - Pre-Treatment Reward'
            : 'Free Health Drink / Voucher - Thank You Reward';

        coupon = await db.rewardCoupon.create({
            data: {
                reviewId: review.id,
                type: couponType,
                description: couponDescription,
            }
        });
    }

    // 6. Revalidate paths
    revalidatePath('/admin/reviews');

    return {
        success: true,
        reviewId: review.id,
        coupon: coupon ? {
            code: coupon.code,
            type: coupon.type,
            description: coupon.description,
        } : null,
    };
}

// Get public reviews (for API)
export async function getPublicReviews({ limit = 10, offset = 0, staffId, productId }: {
    limit?: number;
    offset?: number;
    staffId?: string;
    productId?: string;
}) {
    const whereClause: any = {
        isApproved: true,
        isPublic: true
    };

    if (staffId) whereClause.staffId = staffId;
    if (productId) whereClause.productId = productId;

    const reviews = await db.review.findMany({
        where: whereClause,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
            product: { select: { name: true } },
            staff: { select: { fullName: true } }
        }
    });

    // Transform for public consumption
    return reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        reviewerName: review.reviewerName || 'Anonymous',
        createdAt: review.createdAt,
        serviceName: review.product.name,
        // @ts-ignore - staff might be null but included in query
        staffName: review.staff?.fullName || null,
        response: null // Future: Admin response
    }));
}
