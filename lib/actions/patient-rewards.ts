'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function getPatientCoupons() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const patient = await db.patient.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
    });

    if (!patient) return [];

    // Find all reviews by this patient, then their associated coupons
    const reviews = await db.review.findMany({
        where: { patientId: patient.id },
        include: {
            coupon: true,
            product: { select: { name: true } },
            appointment: { select: { appointmentDate: true, customerType: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return reviews
        .filter(r => r.coupon)
        .map(r => ({
            id: r.coupon!.id,
            code: r.coupon!.code,
            type: r.coupon!.type,
            description: r.coupon!.description,
            isRedeemed: r.coupon!.isRedeemed,
            redeemedAt: r.coupon!.redeemedAt,
            createdAt: r.coupon!.createdAt,
            serviceName: r.product?.name || 'Service',
            appointmentDate: r.appointment?.appointmentDate,
        }));
}
