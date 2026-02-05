const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function testAuth() {
    const prisma = new PrismaClient();
    const headers = { 'Content-Type': 'application/json' };

    console.log('--- Starting Auth Test ---');

    // 1. Define Test User
    const email = 'testuser_' + Date.now() + '@example.com';
    const password = 'TestPassword123!';

    console.log(`Testing with user: ${email} / ${password}`);

    // 2. Simulate Registration Hashing
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Generated Hash:', hashedPassword);

    try {
        // 3. Create User in DB directly
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'PATIENT',
                patient: {
                    create: {
                        fullName: 'Test User',
                        phone: '1234567890'
                    }
                }
            }
        });
        console.log('User created in DB:', user.id);

        // 4. Simulate Login / Verification

        // 4a. Retrieve user
        const retrievedUser = await prisma.user.findUnique({
            where: { email }
        });

        if (!retrievedUser) {
            console.error('ERROR: User not found in DB!');
            return;
        }

        console.log('User retrieved. Stored Password:', retrievedUser.password);

        // 4b. Compare Password
        const isValid = await bcrypt.compare(password, retrievedUser.password);
        console.log('Password Comparison Result:', isValid); // Should be true

        if (isValid) {
            console.log('SUCCESS: Auth logic is sound.');
        } else {
            console.error('FAILURE: Password comparison failed.');
        }

    } catch (e) {
        console.error('Test Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

testAuth();
