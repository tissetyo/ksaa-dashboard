import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET patient's saved addresses
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const patient = await db.patient.findUnique({ where: { userId: session.user.id } });
    if (!patient) return NextResponse.json({ addresses: [] });
    const addresses = await db.patientAddress.findMany({
        where: { patientId: patient.id },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    return NextResponse.json({ addresses });
}

// POST create a new saved address
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const patient = await db.patient.findUnique({ where: { userId: session.user.id } });
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    const body = await req.json();
    const { label, address, city, state, postcode, isDefault } = body;
    if (!address || !city) return NextResponse.json({ error: 'address and city are required' }, { status: 400 });

    // If setting as default, unset all others first
    if (isDefault) {
        await db.patientAddress.updateMany({ where: { patientId: patient.id }, data: { isDefault: false } });
    }
    const newAddress = await db.patientAddress.create({
        data: { patientId: patient.id, label: label || 'Home', address, city, state, postcode, isDefault: isDefault ?? false },
    });
    return NextResponse.json({ address: newAddress });
}

// DELETE a saved address
export async function DELETE(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const patient = await db.patient.findUnique({ where: { userId: session.user.id } });
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    // Verify ownership
    const addr = await db.patientAddress.findFirst({ where: { id, patientId: patient.id } });
    if (!addr) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.patientAddress.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
