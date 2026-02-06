import { cache } from 'react';
import { db } from './db';

/**
 * Cached query functions to optimize database performance
 * These functions use React's cache() to deduplicate and memoize queries within a single request
 */

// ============================================================================
// PATIENT QUERIES
// ============================================================================

export const getPatientByUserId = cache(async (userId: string) => {
    return await db.patient.findUnique({
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
    });
});

export const getPatientAppointments = cache(async (patientId: string) => {
    return await db.appointment.findMany({
        where: { patientId },
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
    });
});

export const getPatientUpcomingAppointments = cache(async (patientId: string) => {
    const now = new Date();
    // Set to start of today to include all appointments today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return await db.appointment.findMany({
        where: {
            patientId,
            appointmentDate: { gte: startOfToday },
            status: { in: ['PENDING', 'CONFIRMED'] },
        },
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
        orderBy: { appointmentDate: 'asc' },
        take: 5,
    });
});

// ============================================================================
// PRODUCT/SERVICE QUERIES
// ============================================================================

export const getActiveProducts = cache(async () => {
    return await db.product.findMany({
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
        },
        orderBy: { name: 'asc' },
    });
});

export const getProductById = cache(async (productId: string) => {
    return await db.product.findUnique({
        where: { id: productId },
        select: {
            id: true,
            name: true,
            description: true,
            priceMYR: true,
            depositPercentage: true,
            durationMinutes: true,
            quotaPerDay: true,
            isActive: true,
        },
    });
});

// ============================================================================
// ADMIN DASHBOARD QUERIES
// ============================================================================

export const getAdminDashboardStats = cache(async () => {
    const [
        patientCount,
        appointmentCount,
        pendingAppointments,
        revenue,
        recentAppointments,
        dailyQuotas,
    ] = await Promise.all([
        db.patient.count(),
        db.appointment.count(),
        db.appointment.count({
            where: { status: 'PENDING' },
        }),
        db.appointment.aggregate({
            where: { paymentStatus: 'FULL_PAID' },
            _sum: { paidAmountMYR: true },
        }),
        db.appointment.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                patient: {
                    select: {
                        fullName: true,
                        phone: true,
                    },
                },
                product: {
                    select: {
                        name: true,
                    },
                },
            },
        }),
        db.dailyQuota.findMany({
            where: {
                bookingDate: {
                    gte: new Date(),
                },
            },
            include: {
                product: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: { bookingDate: 'asc' },
            take: 7,
        }),
    ]);

    return {
        patientCount,
        appointmentCount,
        pendingAppointments,
        revenue: revenue._sum.paidAmountMYR || 0,
        recentAppointments,
        dailyQuotas,
    };
});

export const getAllAppointments = cache(async () => {
    return await db.appointment.findMany({
        include: {
            patient: {
                select: {
                    fullName: true,
                    phone: true,
                },
            },
            product: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: { appointmentDate: 'desc' },
    });
});

// ============================================================================
// APPOINTMENT QUERIES
// ============================================================================

export const getAppointmentById = cache(async (appointmentId: string) => {
    return await db.appointment.findUnique({
        where: { id: appointmentId },
        include: {
            patient: {
                select: {
                    fullName: true,
                    phone: true,
                },
            },
            product: {
                select: {
                    name: true,
                    priceMYR: true,
                    durationMinutes: true,
                },
            },
        },
    });
});
