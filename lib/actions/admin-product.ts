'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function isAdmin() {
    const session = await auth();
    if (session?.user?.role !== 'SUPERADMIN') {
        throw new Error('Unauthorized');
    }
}

export async function createProduct(data: any) {
    await isAdmin();

    const { name, description, imageUrl, priceMYR, depositPercentage, durationMinutes, quotaPerDay, showPrice } = data;

    const product = await db.product.create({
        data: {
            name,
            description,
            imageUrl,
            priceMYR: parseFloat(priceMYR),
            depositPercentage: parseInt(depositPercentage),
            durationMinutes: parseInt(durationMinutes),
            quotaPerDay: parseInt(quotaPerDay),
            showPrice: showPrice === 'true' || showPrice === true,
        },
    });

    revalidatePath('/admin/products');
    revalidatePath('/services');
    return product;
}

export async function updateProduct(id: string, data: any) {
    await isAdmin();

    const { name, description, imageUrl, priceMYR, depositPercentage, durationMinutes, quotaPerDay, isActive, showPrice } = data;

    const product = await db.product.update({
        where: { id },
        data: {
            name,
            description,
            imageUrl,
            priceMYR: parseFloat(priceMYR),
            depositPercentage: parseInt(depositPercentage),
            durationMinutes: parseInt(durationMinutes),
            quotaPerDay: parseInt(quotaPerDay),
            isActive: isActive === 'true' || isActive === true,
            showPrice: showPrice === 'true' || showPrice === true,
        },
    });

    revalidatePath('/admin/products');
    revalidatePath('/services');
    return product;
}

export async function deleteProduct(id: string) {
    await isAdmin();

    // Check if product has appointments
    const appointmentCount = await db.appointment.count({
        where: { productId: id },
    });

    if (appointmentCount > 0) {
        // Soft delete or just deactivate
        return await db.product.update({
            where: { id },
            data: { isActive: false },
        });
    }

    await db.product.delete({
        where: { id },
    });

    revalidatePath('/admin/products');
    revalidatePath('/services');
}
