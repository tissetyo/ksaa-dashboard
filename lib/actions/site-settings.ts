'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

async function isAdminOrStaff() {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== 'SUPERADMIN' && role !== 'STAFF') {
        throw new Error('Unauthorized');
    }
    return session;
}

export async function getSiteSettings() {
    const settings = await db.siteSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
        map[s.key] = s.value;
    }
    return map;
}

export async function getSiteSetting(key: string) {
    const setting = await db.siteSetting.findUnique({ where: { key } });
    return setting?.value || null;
}

export async function updateSiteSetting(key: string, value: string) {
    await isAdminOrStaff();

    await db.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    });

    return { success: true };
}
