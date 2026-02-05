'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getPatientProfile() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    const patient = await db.patient.findUnique({
        where: { userId: session.user.id },
    });

    return patient;
}

export async function updatePatientProfile(data: any) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    const {
        fullName,
        phone,
        address,
        age,
        heightCm,
        weightKg,
        bloodType,
        emergencyContactName,
        emergencyContactPhone,
        medicalAllergies,
        currentMedications,
        previousTreatments,
        additionalNotes,
    } = data;

    const patient = await db.patient.upsert({
        where: { userId: session.user.id },
        update: {
            fullName,
            phone,
            address,
            age: age ? parseInt(age) : null,
            heightCm: heightCm ? parseFloat(heightCm) : null,
            weightKg: weightKg ? parseFloat(weightKg) : null,
            bloodType,
            emergencyContactName,
            emergencyContactPhone,
            medicalAllergies,
            currentMedications,
            previousTreatments,
            additionalNotes,
        },
        create: {
            userId: session.user.id,
            fullName: fullName || 'Unknown', // Fallback if missing
            phone: phone || '',
            address,
            age: age ? parseInt(age) : null,
            heightCm: heightCm ? parseFloat(heightCm) : null,
            weightKg: weightKg ? parseFloat(weightKg) : null,
            bloodType,
            emergencyContactName,
            emergencyContactPhone,
            medicalAllergies,
            currentMedications,
            previousTreatments,
            additionalNotes,
        },
    });

    revalidatePath('/profile');
    return patient;
}
