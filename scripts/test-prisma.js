require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function test() {
    console.log('Testing Prisma 7 constructors...');

    try {
        console.log('1. Trying: new PrismaClient()');
        const p1 = new PrismaClient();
        console.log('Success (Constructor)');
        await p1.$connect();
        console.log('Success (Connect)');
    } catch (e) {
        console.log('Fail 1:', e.message);
    }

    try {
        console.log('2. Trying: new PrismaClient({ accelerateUrl: process.env.DATABASE_URL })');
        const p2 = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });
        console.log('Success (Constructor)');
        await p2.$connect();
        console.log('Success (Connect)');
    } catch (e) {
        console.log('Fail 2:', e.message);
    }
}

test().catch(console.error);
