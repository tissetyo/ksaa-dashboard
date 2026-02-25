import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

async function isAdminOrStaff() {
    const session = await auth();
    if (!session?.user?.id) return false;
    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    return user && ['SUPERADMIN', 'STAFF'].includes(user.role);
}

export async function POST(req: Request) {
    if (!await isAdminOrStaff()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { base64 } = body;
    if (!base64) return NextResponse.json({ error: 'base64 required' }, { status: 400 });

    // Validate base64 format
    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches) return NextResponse.json({ error: 'Invalid base64 format' }, { status: 400 });

    // Check size (2MB limit)
    const buffer = Buffer.from(matches[2], 'base64');
    if (buffer.length > 2 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image exceeds 2MB limit' }, { status: 400 });
    }

    // On Vercel, filesystem is read-only. Store the base64 data URL directly.
    // The client already compressed the image, so this is safe.
    return NextResponse.json({ url: base64 });
}
