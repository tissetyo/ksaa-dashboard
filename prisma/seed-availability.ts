import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding availability slots...');

    // Define time slots (9 AM to 5 PM, hourly)
    const timeSlots = [
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '14:00', // Skip 1 PM (lunch)
        '15:00',
        '16:00',
        '17:00',
    ];

    // Create slots for Mon-Sat (1-6, skip Sunday 0)
    for (let dayOfWeek = 1; dayOfWeek <= 6; dayOfWeek++) {
        for (const timeSlot of timeSlots) {
            await prisma.availabilitySlot.upsert({
                where: {
                    dayOfWeek_timeSlot: {
                        dayOfWeek,
                        timeSlot,
                    },
                },
                update: {},
                create: {
                    dayOfWeek,
                    timeSlot,
                    isActive: true,
                },
            });
        }
    }

    console.log('Created availability slots for Mon-Sat, 9 AM - 5 PM');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
