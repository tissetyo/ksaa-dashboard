require('dotenv').config(); // Ensure dotenv is loaded if run directly

console.log('Checking Stripe Config...');
if (process.env.STRIPE_SECRET_KEY) {
    console.log('✅ STRIPE_SECRET_KEY is present');
    console.log('Key starts with:', process.env.STRIPE_SECRET_KEY.substring(0, 8) + '...');
} else {
    console.error('❌ STRIPE_SECRET_KEY is MISSING');
}
