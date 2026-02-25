'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { sendPatientWelcomeEmail } from '@/lib/email';
import { randomBytes } from 'crypto';

export async function createPatientFromAdmin(data: {
    fullName: string;
    email: string;
    phone: string;
}) {
    const session = await auth();

    if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'STAFF')) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const { fullName, email, phone } = data;
        const normalizedEmail = email.toLowerCase();

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email: normalizedEmail },
            include: { patient: true }
        });

        if (existingUser) {
            return { success: false, error: 'A user with this email already exists' };
        }

        // Generate a random temporary password
        const temporaryPassword = randomBytes(4).toString('hex'); // 8 character password
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        // Create the user and patient
        const newPatient = await db.user.create({
            data: {
                email: normalizedEmail,
                password: hashedPassword,
                role: 'PATIENT',
                patient: {
                    create: {
                        fullName: fullName,
                        phone: phone,
                    }
                }
            },
            include: {
                patient: true
            }
        });

        // Send welcome email
        await sendPatientWelcomeEmail({
            patientName: fullName,
            email: normalizedEmail,
            temporaryPassword: temporaryPassword
        });

        revalidatePath('/admin/patients');
        revalidatePath('/admin/schedule');
        revalidatePath('/admin/appointments');

        return { success: true, patient: newPatient.patient };

    } catch (error: any) {
        console.error('[CREATE_PATIENT_ERROR]', error);
        return { success: false, error: error.message || 'Failed to create patient' };
    }
}
