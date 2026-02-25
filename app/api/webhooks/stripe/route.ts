import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { db } from '@/lib/db';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-01-27.acacia' as any,
    })
    : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    if (!stripe) {
        return NextResponse.json({ message: 'Stripe is not configured' }, { status: 500 });
    }

    const body = await req.text();
    const head = await headers();
    const signature = head.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle successful payment
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, productId } = paymentIntent.metadata;

        console.log(`Payment Intent ${paymentIntent.id} succeeded for user ${userId}`);

        // Update Payment record if it exists
        await db.payment.updateMany({
            where: { stripePaymentIntentId: paymentIntent.id },
            data: { status: 'SUCCEEDED' },
        });
    }

    return NextResponse.json({ received: true });
}
