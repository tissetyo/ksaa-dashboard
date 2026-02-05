require('dotenv').config();

const key = process.env.STRIPE_SECRET_KEY || '';

console.log('--- Validating Key Format ---');
console.log(`Length: ${key.length}`);

if (key.includes('**')) {
    console.log('❌ Key contains "**". usage of placeholders detected.');
}

if (key.startsWith('"') || key.startsWith("'")) {
    console.log('❌ Key starts with quotes. This might be parsed incorrectly.');
}

if (key.trim() !== key) {
    console.log('❌ Key has surrounding whitespace.');
}

if (!key.startsWith('sk_test_') && !key.startsWith('sk_live_')) {
    console.log('⚠️ Key does not start with sk_test_ or sk_live_.');
} else {
    console.log('✅ Key prefix looks correct.');
}
