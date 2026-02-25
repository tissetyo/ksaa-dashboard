import { db } from './db';

/**
 * Generate a unique staff referral code
 * Format: STAFF-XXXXX (e.g., STAFF-A1B2C)
 */
export async function generateStaffCode(): Promise<string> {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
    let code: string;
    let isUnique = false;

    while (!isUnique) {
        // Generate 5-character code
        code = 'STAFF-';
        for (let i = 0; i < 5; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Check if code already exists
        const existing = await db.staff.findUnique({
            where: { staffCode: code },
        });

        if (!existing) {
            isUnique = true;
            return code;
        }
    }

    throw new Error('Failed to generate unique staff code');
}

/**
 * Validate a referral code
 */
export async function validateReferralCode(code: string) {
    if (!code) return null;

    const staff = await db.staff.findUnique({
        where: { staffCode: code.toUpperCase() },
        select: {
            id: true,
            staffCode: true,
            fullName: true,
            isActive: true,
        },
    });

    if (!staff || !staff.isActive) {
        return null;
    }

    return staff;
}
