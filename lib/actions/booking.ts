'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { sendServiceBookingNotification, sendReferralServiceBookingNotification } from '@/lib/email';
// Enum imports might fail if client not generated yet, using string literals in code where needed
// import { AppointmentStatus, PaymentStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function createBookingIntent(productId: string, amount: number) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    try {
        const product = await db.product.findUnique({ where: { id: productId } });
        if (!product) throw new Error('Product not found');

        console.log('[PAYMENT_DEBUG] Creating intent for:', { productId, amount, userId: session.user.id });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // convert to cents
            currency: 'myr',
            metadata: {
                userId: session.user.id || '',
                productId: productId,
            },
        });

        console.log('[PAYMENT_DEBUG] Intent created:', paymentIntent.id);
        return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
        console.error('[PAYMENT_ERROR] Failed to create intent:', error);
        throw error;
    }
}

export async function completeBooking(data: {
    productId: string;
    appointmentDate: string;
    timeSlot: string;
    paymentAmount: number;
    paymentType: 'FULL' | 'DEPOSIT';
    stripePaymentIntentId?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const patient = await db.patient.findUnique({
        where: { userId: session.user.id },
        include: {
            user: { select: { email: true } },
            referredByStaff: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
        },
    });

    if (!patient) throw new Error('Patient profile not found');

    const product = await db.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new Error('Product not found');

    const totalAmount = product.priceMYR || 0;
    const paidAmount = data.paymentAmount;
    const balanceAmount = totalAmount - paidAmount;

    // Determine payment status
    const paymentStatus = totalAmount === 0
        ? 'FULL_PAID'  // Free appointments are considered fully paid
        : balanceAmount === 0
            ? 'FULL_PAID'
            : 'DEPOSIT_PAID';

    // Create Appointment and Payment record in a transaction
    const result = await db.$transaction(async (tx: any) => {
        const appointment = await tx.appointment.create({
            data: {
                patientId: patient.id,
                productId: data.productId,
                appointmentDate: new Date(data.appointmentDate),
                timeSlot: data.timeSlot,
                status: 'PENDING',
                paymentStatus: paymentStatus,
                totalAmountMYR: totalAmount,
                paidAmountMYR: paidAmount,
                balanceAmountMYR: balanceAmount,
            },
        });

        const payment = await tx.payment.create({
            data: {
                appointmentId: appointment.id,
                amountMYR: paidAmount,
                stripePaymentIntentId: data.stripePaymentIntentId,
                status: 'SUCCEEDED',
            },
        });

        // Update Daily Quota
        const bookingDate = new Date(data.appointmentDate);
        bookingDate.setHours(0, 0, 0, 0);

        await tx.dailyQuota.upsert({
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

        return { appointment, payment };
    });

    // Send email notifications
    const appointmentDate = new Date(data.appointmentDate);
    const formattedDate = appointmentDate.toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Send notification to admin
    await sendServiceBookingNotification({
        patientName: patient.fullName,
        patientEmail: patient.user.email,
        patientPhone: patient.phone,
        serviceName: product.name,
        appointmentDate: formattedDate,
        appointmentTime: data.timeSlot,
    });

    // Send notification to referring staff if applicable
    if (patient.referredByStaff) {
        await sendReferralServiceBookingNotification({
            staffName: patient.referredByStaff.fullName,
            staffEmail: patient.referredByStaff.email,
            patientName: patient.fullName,
            serviceName: product.name,
            appointmentDate: formattedDate,
            appointmentTime: data.timeSlot,
        });
    }

    revalidatePath('/dashboard');
    revalidatePath('/appointments');
    return { success: true, appointmentId: result.appointment.id };
}
