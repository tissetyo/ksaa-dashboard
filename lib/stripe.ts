import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY || '';

if (!secretKey && process.env.NODE_ENV === 'production') {
    throw new Error('STRIPE_SECRET_KEY is missing in production');
}

export const stripe = new Stripe(secretKey, {
    apiVersion: '2023-10-16' as any,
});
