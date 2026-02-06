import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Free Consultation product...');

    // Check if product already exists
    const existing = await prisma.product.findUnique({
        where: { name: 'Free Consultation' }
    });

    if (existing) {
        console.log('✅ Free Consultation product already exists');
        return;
    }

    // Create the free consultation product
    const product = await prisma.product.create({
        data: {
            name: 'Free Consultation',
            description: '30-minute free consultation via Google Meet or WhatsApp call. Discuss your health concerns and learn about our STEMCARE treatments.',
            priceMYR: 0,
            depositPercentage: 0,
            durationMinutes: 30,
            quotaPerDay: 20, // Allow up to 20 consultations per day
            isActive: true,
        },
    });

    console.log('✅ Created Free Consultation product:', product.id);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
