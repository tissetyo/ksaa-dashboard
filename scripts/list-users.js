const { PrismaClient } = require('@prisma/client');

async function listUsers() {
    const prisma = new PrismaClient();
    try {
        const users = await prisma.user.findMany({
            select: { email: true, role: true }
        });
        console.log('Users:', JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
