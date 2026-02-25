'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export interface AdminPrefetchedData {
    // Dashboard stats
    stats: {
        totalPatients: number;
        totalAppointments: number;
        pendingAppointments: number;
        confirmedAppointments: number;
        completedAppointments: number;
        cancelledAppointments: number;
        totalRevenue: number;
        monthlyRevenue: number;
    };
    // All appointments (with relations)
    appointments: any[];
    // All patients
    patients: any[];
    // All staff
    staff: any[];
    // All products/services
    products: any[];
    // Recent payments
    payments: any[];
    // Schedule/slots
    availabilitySlots: any[];
    dateOverrides: any[];
}

export async function prefetchAdminData(): Promise<AdminPrefetchedData | null> {
    const session = await auth();

    if (!session?.user?.id) {
        return null;
    }

    // Check if user is admin/staff
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    });

    if (!user || !['SUPERADMIN', 'STAFF'].includes(user.role)) {
        return null;
    }

    const now = new Date();
    const startOfToday = startOfDay(now);
    const endOfToday = endOfDay(now);
    const startOfThisMonth = startOfMonth(now);
    const endOfThisMonth = endOfMonth(now);

    // Fetch ALL data in parallel for maximum speed
    const [
        // Stats counts
        totalPatients,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        totalRevenue,
        monthlyRevenue,
        // Full data
        appointments,
        patients,
        staff,
        products,
        payments,
        availabilitySlots,
        dateOverrides
    ] = await Promise.all([
        // Stats
        db.patient.count(),
        db.appointment.count(),
        db.appointment.count({ where: { status: 'PENDING' } }),
        db.appointment.count({ where: { status: 'CONFIRMED' } }),
        db.appointment.count({ where: { status: 'COMPLETED' } }),
        db.appointment.count({ where: { status: 'CANCELLED' } }),
        db.payment.aggregate({
            _sum: { amountMYR: true },
            where: { status: 'SUCCEEDED' }
        }),
        db.payment.aggregate({
            _sum: { amountMYR: true },
            where: {
                status: 'SUCCEEDED',
                createdAt: { gte: startOfThisMonth, lte: endOfThisMonth }
            }
        }),
        // Appointments with relations
        db.appointment.findMany({
            include: {
                patient: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                        userId: true,
                        user: { select: { email: true } },
                    }
                },
                product: { select: { id: true, name: true, priceMYR: true, durationMinutes: true } },
                reviewToken: { select: { token: true, isUsed: true } }
            },
            orderBy: { appointmentDate: 'desc' },
            take: 30 // Reduced from 200 for faster loading
        }),
        // Patients
        db.patient.findMany({
            select: {
                id: true,
                fullName: true,
                phone: true,
                age: true,
                bloodType: true,
                createdAt: true,
                userId: true,
                _count: { select: { appointments: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 30 // Reduced from 200 for faster loading
        }),
        // Staff
        db.staff.findMany({
            include: {
                user: { select: { id: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        }),
        // Products
        db.product.findMany({
            orderBy: { name: 'asc' }
        }),
        // Payments
        db.payment.findMany({
            include: {
                appointment: {
                    select: {
                        id: true,
                        patient: { select: { fullName: true } },
                        product: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20 // Reduced from 100 for faster loading
        }),
        // Schedule
        db.availabilitySlot.findMany({
            orderBy: [{ dayOfWeek: 'asc' }, { timeSlot: 'asc' }]
        }),
        // Date overrides (next 60 days)
        db.dateOverride.findMany({
            where: {
                specificDate: { gte: startOfToday }
            },
            orderBy: { specificDate: 'asc' }
        })
    ]);

    return {
        stats: {
            totalPatients,
            totalAppointments,
            pendingAppointments,
            confirmedAppointments,
            completedAppointments,
            cancelledAppointments,
            totalRevenue: totalRevenue._sum?.amountMYR || 0,
            monthlyRevenue: monthlyRevenue._sum?.amountMYR || 0
        },
        appointments,
        patients,
        staff,
        products,
        payments,
        availabilitySlots,
        dateOverrides
    };
}
