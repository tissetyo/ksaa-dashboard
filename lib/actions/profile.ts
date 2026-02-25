'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Not authenticated' };

    const get = (key: string) => formData.get(key)?.toString() || undefined;

    const data: any = {
        fullName: get('fullName'),
        phone: get('phone'),
        dateOfBirth: get('dateOfBirth') ? new Date(get('dateOfBirth')!) : undefined,
        gender: get('gender'),
        nationality: get('nationality'),
        icNumber: get('icNumber'),
        height: get('height') ? parseFloat(get('height')!) : undefined,
        weight: get('weight') ? parseFloat(get('weight')!) : undefined,
        bloodType: get('bloodType'),
        emergencyContactName: get('emergencyContactName'),
        emergencyContactPhone: get('emergencyContactPhone'),
        emergencyContactRelationship: get('emergencyContactRelationship'),
        homeAddress: get('homeAddress'),
        homeCity: get('homeCity'),
        homeState: get('homeState'),
        homePostcode: get('homePostcode'),
        allergies: get('allergies'),
        medicalConditions: get('medicalConditions'),
        currentMedications: get('currentMedications'),
    };

    // Remove undefined fields
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);

    await db.patient.upsert({
        where: { userId: session.user.id },
        update: data,
        create: { userId: session.user.id, ...data },
    });

    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true };
}
