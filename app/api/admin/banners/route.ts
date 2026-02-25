import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET all banners (admin)
export async function GET() {
    const session = await auth();
    if (!session?.user || !['STAFF', 'SUPERADMIN'].includes(session.user.role as string)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const banners = await db.banner.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json({ banners });
}

// POST create banner
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user || !['STAFF', 'SUPERADMIN'].includes(session.user.role as string)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const banner = await db.banner.create({
        data: {
            title: body.title || null,
            imageUrl: body.imageUrl,
            linkType: body.linkType || 'custom',
            linkUrl: body.linkType === 'custom' ? body.linkUrl : null,
            serviceId: body.linkType === 'service' ? body.serviceId : null,
            isActive: body.isActive ?? true,
            order: body.order ?? 0,
        },
    });
    return NextResponse.json({ banner });
}

// PATCH update banner
export async function PATCH(req: Request) {
    const session = await auth();
    if (!session?.user || !['STAFF', 'SUPERADMIN'].includes(session.user.role as string)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { id, ...data } = body;
    const banner = await db.banner.update({ where: { id }, data });
    return NextResponse.json({ banner });
}

// DELETE banner
export async function DELETE(req: Request) {
    const session = await auth();
    if (!session?.user || !['STAFF', 'SUPERADMIN'].includes(session.user.role as string)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await db.banner.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
