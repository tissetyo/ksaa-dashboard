'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Check if the currently logged-in user has connected a Google account
 */
export async function getGoogleConnectionStatus() {
    const session = await auth();
    if (!session?.user?.id) {
        return { connected: false, email: null };
    }

    const googleAccount = await db.account.findFirst({
        where: {
            userId: session.user.id,
            provider: 'google',
        },
    });

    return {
        connected: !!googleAccount,
        // NextAuth doesn't strictly store the Google email in the Account table by default,
        // but we can infer connection status.
        email: googleAccount ? 'Connected' : null,
    };
}

/**
 * Disconnect the Google account from the currently logged-in user
 */
export async function disconnectGoogleAccount() {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        await db.account.deleteMany({
            where: {
                userId: session.user.id,
                provider: 'google',
            },
        });

        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        console.error('Failed to disconnect Google account:', error);
        return { success: false, error: 'Failed to disconnect account' };
    }
}
