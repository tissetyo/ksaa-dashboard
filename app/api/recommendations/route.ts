import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/recommendations — patient's pending recommendations
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ recommendations: [] });

    const patient = await db.patient.findUnique({
        where: { userId: session.user.id },
    });
    if (!patient) return NextResponse.json({ recommendations: [] });

    const recommendations = await db.serviceRecommendation.findMany({
        where: { patientId: patient.id, status: 'PENDING' },
        include: { product: { select: { id: true, name: true, imageUrl: true } } },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ recommendations });
}
