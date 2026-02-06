import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const head = await headers();
    const signature = head.get('stripe-signature')!;

    let event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle successful payment
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { userId, productId } = paymentIntent.metadata;

        // We can use webhooks to confirm payments or sync state
        // In our current flow, 'completeBooking' handles the DB update after client-side success.
        // However, in a production app, the webhook should be the source of truth.
        console.log(`Payment Intent ${paymentIntent.id} succeeded for user ${userId}`);

        // Update Payment record if it exists
        await db.payment.updateMany({
            where: { stripePaymentIntentId: paymentIntent.id },
            data: { status: 'SUCCEEDED' },
        });
    }

    return NextResponse.json({ received: true });
}
