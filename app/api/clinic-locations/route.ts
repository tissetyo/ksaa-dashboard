import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Public: get active clinic locations for booking flow
export async function GET() {
    const locations = await db.clinicLocation.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: { id: true, name: true, address: true, city: true, state: true, postcode: true, mapLink: true },
    });
    return NextResponse.json({ locations });
}
