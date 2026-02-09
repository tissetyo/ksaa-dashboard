'use server';

import { db } from '@/lib/db';

export async function getServices() {
    try {
        const services = await db.product.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
            },
        });
        return services;
    } catch (error) {
        console.error('Failed to fetch services:', error);
        return [];
    }
}
