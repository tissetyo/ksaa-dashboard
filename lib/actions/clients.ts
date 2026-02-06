'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function getClients(filters?: {
    search?: string;
    status?: string;
}) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'SUPERADMIN') {
        throw new Error('Unauthorized');
    }

    const where: any = {};

    if (filters?.search) {
        where.OR = [
            { fullName: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
            { phone: { contains: filters.search, mode: 'insensitive' } },
        ];
    }

    const patients = await db.patient.findMany({
        where,
        include: {
            user: {
                select: { email: true }
            },
            _count: {
                select: { appointments: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return patients;
}

export async function getClientById(patientId: string) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'SUPERADMIN') {
        throw new Error('Unauthorized');
    }

    const patient = await db.patient.findUnique({
        where: { id: patientId },
        include: {
            user: {
                select: { email: true }
            },
            appointments: {
                include: {
                    product: true,
                    payments: true
                },
                orderBy: { appointmentDate: 'desc' }
            },
            referredByStaff: {
                select: {
                    fullName: true,
                    staffCode: true
                }
            }
        }
    });

    return patient;
}

export async function updateClientNotes(patientId: string, notes: string) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'SUPERADMIN') {
        throw new Error('Unauthorized');
    }

    // For now, we'll add notes to the most recent appointment
    // In a real app, you might want a separate notes table
    const latestAppointment = await db.appointment.findFirst({
        where: { patientId },
        orderBy: { createdAt: 'desc' }
    });

    if (latestAppointment) {
        await db.appointment.update({
            where: { id: latestAppointment.id },
            data: { adminNotes: notes }
        });
    }

    return { success: true };
}
