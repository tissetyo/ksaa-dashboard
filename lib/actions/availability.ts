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
