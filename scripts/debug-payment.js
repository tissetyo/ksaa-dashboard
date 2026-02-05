require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');

async function debugPayment() {
    const prisma = new PrismaClient();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

    const productId = 'cml5jvu1l0002k73e9mx8npux'; // ID from user request
    console.log(`--- Debugging Payment for Product: ${productId} ---`);

    try {
        // 1. Fetch Product
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            console.error('❌ Product NOT found in DB');
            return;
        }
        console.log('✅ Product found:', product.name);
        console.log('Price (MYR):', product.priceMYR);
        console.log('Deposit %:', product.depositPercentage);

        // 2. Calculate Amount (Deposit Logic)
        const amount = product.priceMYR * (product.depositPercentage / 100);
        const amountInCents = Math.round(amount * 100);
        console.log(`Calculated Amount (cents): ${amountInCents} (from RM ${amount.toFixed(2)})`);

        if (isNaN(amountInCents) || amountInCents <= 0) {
            console.error('❌ Invalid Amount Calculated');
            return;
        }

        // 3. Test Stripe Call
        console.log('Attempting Stripe PaymentIntent...');
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'myr',
            metadata: {
                userId: 'test-user-id',
                productId: productId,
            },
        });

        console.log('✅ Stripe PaymentIntent Created:', paymentIntent.id);

    } catch (e) {
        console.error('❌ Error during debug:', e);
    } finally {
        await prisma.$disconnect();
    }
}

debugPayment();
