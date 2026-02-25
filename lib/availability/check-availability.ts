import { db } from '@/lib/db';
import { addDays, format, startOfDay, endOfDay } from 'date-fns';

export async function getAvailableSlots(productId: string, date: Date) {
    const dayOfWeek = date.getDay(); // 0-6 (Sun-Sat)
    const dateString = format(date, 'yyyy-MM-dd');
    const startOfSelectedDay = startOfDay(date);
    const endOfSelectedDay = endOfDay(date);

    // 1. Fetch Product rules
    const product = await db.product.findUnique({
        where: { id: productId },
    });

    if (!product || !product.isActive) {
        return [];
    }

    // 2. Check for Date Override (Closure or Custom Hours)
    const override = await db.dateOverride.findUnique({
        where: { specificDate: startOfSelectedDay },
    });

    if (override?.isClosed) {
        return [];
    }

    // 3. Get Base Availability from Weekly Schedule (or custom slots from override)
    let baseSlots: any[] = [];

    if (override?.customTimeSlots) {
        baseSlots = JSON.parse(override.customTimeSlots as string).map((time: string) => ({
            timeSlot: time,
            isActive: true
        }));
    } else {
        baseSlots = await db.availabilitySlot.findMany({
            where: { dayOfWeek, isActive: true },
            orderBy: { timeSlot: 'asc' },
        });
    }

    if (baseSlots.length === 0) {
        return [];
    }

    // 4. Check Current Bookings for this specific Day & Product (Daily Quota)
    const appointmentsOnDay = await db.appointment.count({
        where: {
            productId,
            appointmentDate: {
                gte: startOfSelectedDay,
                lte: endOfSelectedDay,
            },
            status: { notIn: ['CANCELLED'] },
        },
    });

    if (appointmentsOnDay >= product.quotaPerDay) {
        // Total product quota for the day reached
        return [];
    }

    // 5. Filter Slots by specific existing bookings (Slot-level blocking)
    // Note: One slot can have multiple appointments if product quota allows, 
    // but for STEMCARE we might want to check if the staff is busy or if slots are unique per appointment.
    // The requirement says "Daily Quota per Product", but also "Time Slot selection".
    // If product quota is 5, and we have 5 slots, then 1 appointment per slot is logical.

    const bookedSlots = await db.appointment.findMany({
        where: {
            appointmentDate: {
                gte: startOfSelectedDay,
                lte: endOfSelectedDay,
            },
            status: { notIn: ['CANCELLED'] },
        },
        select: { timeSlot: true },
    });

    const bookedSlotTimes = bookedSlots.map((s: { timeSlot: string }) => s.timeSlot);

    // Return available slots
    return baseSlots
        .filter(slot => !bookedSlotTimes.includes(slot.timeSlot))
        .map(slot => slot.timeSlot);
}
