const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ksaa.com';
    const adminPassword = 'adminpassword123';

    console.log('Seeding database...');

    // Create Super Admin
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: hashedPassword,
            role: 'SUPERADMIN',
        },
    });

    // Create Demo Patient
    const patientEmail = 'patient@ksaa.com';
    const patientPassword = 'patient123';
    const hashedPatientPassword = await bcrypt.hash(patientPassword, 10);

    await prisma.user.upsert({
        where: { email: patientEmail },
        update: {},
        create: {
            email: patientEmail,
            password: hashedPatientPassword,
            role: 'PATIENT',
            patient: {
                create: {
                    fullName: 'Demo Patient',
                    phone: '0123456789',
                    address: 'Kuala Lumpur, Malaysia'
                }
            }
        },
    });
    console.log(`Demo patient created: ${patientEmail}`);

    console.log(`Admin user created: ${admin.email}`);

    const products = [
        {
            name: 'STEMCARE Facial Therapy',
            description: 'Advanced stem cell rejuvenation for your skin.',
            priceMYR: 500.0,
            durationMinutes: 60,
            quotaPerDay: 5,
        },
        {
            name: 'STEMCARE Joint Care',
            description: 'Regenerative therapy for joint health and mobility.',
            priceMYR: 1200.0,
            durationMinutes: 90,
            quotaPerDay: 3,
        },
    ];

    for (const product of products) {
        await prisma.product.upsert({
            where: { name: product.name },
            update: {},
            create: product,
        });
    }

    console.log('Sample products created.');

    const timeSlots = [
        '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'
    ];

    for (let day = 1; day <= 5; day++) {
        for (const slot of timeSlots) {
            await prisma.availabilitySlot.upsert({
                where: { dayOfWeek_timeSlot: { dayOfWeek: day, timeSlot: slot } },
                update: {},
                create: {
                    dayOfWeek: day,
                    timeSlot: slot,
                },
            });
        }
    }

    console.log('Weekly availability slots created.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
