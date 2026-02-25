import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const patient = await db.patient.findUnique({ where: { userId: session.user.id } });
    if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Ensure this recommendation belongs to this patient
    const rec = await db.serviceRecommendation.findFirst({
        where: { id, patientId: patient.id },
    });
    if (!rec) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await db.serviceRecommendation.update({
        where: { id },
        data: { status: 'DECLINED' },
    });

    return NextResponse.json({ success: true });
}
