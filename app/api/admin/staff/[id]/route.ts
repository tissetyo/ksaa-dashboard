import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session || session.user.role !== 'SUPERADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const staff = await db.staff.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        referredPatients: true,
                    },
                },
            },
        });

        if (!staff) {
            return NextResponse.json({ message: 'Staff not found' }, { status: 404 });
        }

        return NextResponse.json(staff);

    } catch (error: any) {
        console.error('[GET_STAFF_ERROR]', error);
        return NextResponse.json(
            { message: 'Failed to fetch staff member' },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session || session.user.role !== 'SUPERADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { fullName, email, phone, isActive } = await req.json();

        const staff = await db.staff.update({
            where: { id },
            data: {
                fullName,
                email: email.toLowerCase(),
                phone: phone || null,
                isActive,
            },
        });

        return NextResponse.json({
            message: 'Staff member updated successfully',
            staff,
        });

    } catch (error: any) {
        console.error('[UPDATE_STAFF_ERROR]', error);
        return NextResponse.json(
            { message: 'Failed to update staff member' },
            { status: 500 }
        );
    }
}
