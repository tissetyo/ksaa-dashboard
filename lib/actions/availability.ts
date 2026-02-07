'use server';

import { db } from '@/lib/db';
import { startOfDay, endOfDay, format, addDays, startOfMonth, endOfMonth } from 'date-fns';

/**
 * OPTIMIZED: Get available slots for a specific date
 * Uses a single batch query approach
 */
export async function checkAvailabilityAction(productId: string, dateStr: string) {
    try {
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();
        const startOfSelectedDay = startOfDay(date);
        const endOfSelectedDay = endOfDay(date);

        // Parallel fetch all needed data in ONE round-trip
        const [product, override, baseSlots, bookedSlots, appointmentsCount] = await Promise.all([
            // 1. Product info
            db.product.findUnique({
                where: { id: productId },
                select: { id: true, isActive: true, quotaPerDay: true }
            }),
            // 2. Date override (closures/custom hours)
            db.dateOverride.findUnique({
                where: { specificDate: startOfSelectedDay },
                select: { isClosed: true, customTimeSlots: true }
            }),
            // 3. Base slots from schedule
            db.availabilitySlot.findMany({
                where: { dayOfWeek, isActive: true },
                select: { timeSlot: true },
                orderBy: { timeSlot: 'asc' }
            }),
            // 4. Already booked slots for this day
            db.appointment.findMany({
                where: {
                    appointmentDate: { gte: startOfSelectedDay, lte: endOfSelectedDay },
                    status: { notIn: ['CANCELLED'] }
                },
                select: { timeSlot: true }
            }),
            // 5. Total appointments count for quota
            db.appointment.count({
                where: {
                    productId,
                    appointmentDate: { gte: startOfSelectedDay, lte: endOfSelectedDay },
                    status: { notIn: ['CANCELLED'] }
                }
            })
        ]);

        // Quick checks
        if (!product?.isActive) return { success: true, slots: [] };
        if (override?.isClosed) return { success: true, slots: [] };
        if (appointmentsCount >= (product.quotaPerDay || 999)) return { success: true, slots: [] };

        // Use custom slots from override or base schedule
        let availableSlots: string[] = [];
        if (override?.customTimeSlots) {
            availableSlots = JSON.parse(override.customTimeSlots as string);
        } else {
            availableSlots = baseSlots.map(s => s.timeSlot);
        }

        // Filter out booked slots
        const bookedTimes = new Set(bookedSlots.map(s => s.timeSlot));
        const finalSlots = availableSlots.filter(slot => !bookedTimes.has(slot));

        return { success: true, slots: finalSlots };
    } catch (error) {
        console.error('CHECK_AVAILABILITY_ERROR', error);
        return { success: false, error: 'Failed to check availability', slots: [] };
    }
}

/**
 * OPTIMIZED: Check availability for entire month in ONE query
 * Returns dates that have at least one available slot
 */
export async function checkMonthAvailabilityAction(productId: string, year: number, month: number) {
    try {
        const startDate = startOfMonth(new Date(year, month, 1));
        const endDate = endOfMonth(new Date(year, month, 1));
        const today = startOfDay(new Date());

        // Fetch ALL data needed for the month in ONE round-trip
        const [product, closedDates, allSlots, bookedAppointments] = await Promise.all([
            // 1. Product info
            db.product.findUnique({
                where: { id: productId },
                select: { id: true, isActive: true, quotaPerDay: true }
            }),
            // 2. All closures for this month
            db.dateOverride.findMany({
                where: {
                    specificDate: { gte: startDate, lte: endDate },
                    isClosed: true
                },
                select: { specificDate: true }
            }),
            // 3. All availability slots by day of week
            db.availabilitySlot.findMany({
                where: { isActive: true },
                select: { dayOfWeek: true, timeSlot: true }
            }),
            // 4. All bookings for this month (not cancelled)
            db.appointment.findMany({
                where: {
                    appointmentDate: { gte: startDate, lte: endDate },
                    status: { notIn: ['CANCELLED'] }
                },
                select: { appointmentDate: true, timeSlot: true }
            })
        ]);

        if (!product?.isActive) {
            return { success: true, availableDates: [] };
        }

        // Create sets for fast lookup
        const closedDateSet = new Set(
            closedDates.map(d => format(d.specificDate, 'yyyy-MM-dd'))
        );

        // Group slots by day of week
        const slotsByDay: Map<number, string[]> = new Map();
        allSlots.forEach(slot => {
            if (!slotsByDay.has(slot.dayOfWeek)) {
                slotsByDay.set(slot.dayOfWeek, []);
            }
            slotsByDay.get(slot.dayOfWeek)!.push(slot.timeSlot);
        });

        // Group bookings by date
        const bookingsByDate: Map<string, Set<string>> = new Map();
        bookedAppointments.forEach(apt => {
            const dateKey = format(apt.appointmentDate, 'yyyy-MM-dd');
            if (!bookingsByDate.has(dateKey)) {
                bookingsByDate.set(dateKey, new Set());
            }
            bookingsByDate.get(dateKey)!.add(apt.timeSlot);
        });

        // Calculate available dates
        const availableDates: string[] = [];
        let currentDate = today > startDate ? today : startDate;

        while (currentDate <= endDate) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            const dayOfWeek = currentDate.getDay();

            // Skip Sundays
            if (dayOfWeek !== 0) {
                // Skip closed dates
                if (!closedDateSet.has(dateStr)) {
                    const slotsForDay = slotsByDay.get(dayOfWeek) || [];
                    const bookedForDay = bookingsByDate.get(dateStr) || new Set();

                    // Check if any slot is available
                    const hasAvailableSlot = slotsForDay.some(slot => !bookedForDay.has(slot));

                    if (hasAvailableSlot) {
                        availableDates.push(dateStr);
                    }
                }
            }

            currentDate = addDays(currentDate, 1);
        }

        return { success: true, availableDates };
    } catch (error) {
        console.error('CHECK_MONTH_AVAILABILITY_ERROR', error);
        return { success: false, error: 'Failed to check month availability', availableDates: [] };
    }
}
