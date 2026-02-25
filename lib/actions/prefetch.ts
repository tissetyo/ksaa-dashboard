'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export interface PrefetchedData {
    patient: any;
    appointments: any[];
    services: any[];
    upcomingAppointments: any[];
}

export async function prefetchUserData(): Promise<PrefetchedData | null> {
    const session = await auth();

    if (!session?.user?.id) {
        return null;
    }

    const userId = session.user.id;

    // Fetch all data in parallel for maximum speed
    const [patient, services] = await Promise.all([
        db.patient.findUnique({
            where: { userId },
            select: {
                id: true,
                userId: true,
                fullName: true,
                phone: true,
                address: true,
                age: true,
                heightCm: true,
                weightKg: true,
                bloodType: true,
                emergencyContactName: true,
                emergencyContactPhone: true,
                medicalAllergies: true,
                currentMedications: true,
                previousTreatments: true,
                additionalNotes: true,
                createdAt: true,
                updatedAt: true,
            },
        }),
        db.product.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                description: true,
                priceMYR: true,
                depositPercentage: true,
                durationMinutes: true,
                quotaPerDay: true,
                isActive: true,
                showPrice: true,
            },
            orderBy: { name: 'asc' },
        }),
    ]);

    if (!patient) {
        return { patient: null, appointments: [], services, upcomingAppointments: [] };
    }

    // Fetch appointments now that we have patient ID
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [appointments, upcomingAppointments] = await Promise.all([
        db.appointment.findMany({
            where: { patientId: patient.id },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        priceMYR: true,
                        durationMinutes: true,
                    },
                },
            },
            orderBy: { appointmentDate: 'desc' },
            take: 20, // Limit for faster loading
        }),
        db.appointment.findMany({
            where: {
                patientId: patient.id,
                appointmentDate: { gte: startOfToday },
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
            select: {
                id: true,
                appointmentDate: true,
                timeSlot: true,
                status: true,
                consultationType: true,
                consultationPhone: true,
                googleMeetLink: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                        priceMYR: true,
                        durationMinutes: true,
                    },
                },
            },
            orderBy: { appointmentDate: 'asc' },
            take: 5,
        }),
    ]);

    return {
        patient,
        appointments,
        services,
        upcomingAppointments,
    };
}
