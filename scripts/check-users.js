const { PrismaClient } = require('@prisma/client');

async function check() {
    const prisma = new PrismaClient();

    try {
        const users = await prisma.user.findMany({
            select: { email: true, role: true }
        });
        console.log('Registered Users:', JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
