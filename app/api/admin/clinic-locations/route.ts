import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

async function isAdminOrStaff() {
    const session = await auth();
    if (!session?.user?.id) return false;
    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    return user && ['SUPERADMIN', 'STAFF'].includes(user.role);
}

// GET all clinic locations (admin)
export async function GET() {
    if (!await isAdminOrStaff()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const locations = await db.clinicLocation.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json({ locations });
}

// POST create new clinic location
export async function POST(req: Request) {
    if (!await isAdminOrStaff()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { name, address, city, state, postcode, mapLink, order } = body;
    if (!name || !address || !city) return NextResponse.json({ error: 'name, address and city are required' }, { status: 400 });
    const location = await db.clinicLocation.create({
        data: { name, address, city, state, postcode, mapLink, order: order ?? 0 }
    });
    return NextResponse.json({ location });
}

// PATCH update clinic location
export async function PATCH(req: Request) {
    if (!await isAdminOrStaff()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const location = await db.clinicLocation.update({ where: { id }, data });
    return NextResponse.json({ location });
}

// DELETE clinic location
export async function DELETE(req: Request) {
    if (!await isAdminOrStaff()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await db.clinicLocation.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
