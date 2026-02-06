'use server';

import { getAvailableSlots } from '@/lib/availability/check-availability';

export async function checkAvailabilityAction(productId: string, dateStr: string) {
    try {
        const date = new Date(dateStr);
        const slots = await getAvailableSlots(productId, date);
        return { success: true, slots };
    } catch (error) {
        console.error('CHECK_AVAILABILITY_ERROR', error);
        return { success: false, error: 'Failed to check availability' };
    }
}

// Check availability for a month (returns dates with available slots)
export async function checkMonthAvailabilityAction(productId: string, year: number, month: number) {
    try {
        const availableDates: string[] = [];
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0); // Last day of month

        // Check each day in the month
        for (let day = 1; day <= endDate.getDate(); day++) {
            const date = new Date(year, month, day);

            // Skip past dates and Sundays
            if (date < new Date(new Date().setHours(0, 0, 0, 0)) || date.getDay() === 0) {
                continue;
            }

            const slots = await getAvailableSlots(productId, date);
            if (slots.length > 0) {
                // Format as YYYY-MM-DD
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                availableDates.push(dateStr);
            }
        }

        return { success: true, availableDates };
    } catch (error) {
        console.error('CHECK_MONTH_AVAILABILITY_ERROR', error);
        return { success: false, error: 'Failed to check month availability' };
    }
}
