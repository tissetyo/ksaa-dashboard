import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateStaffCode } from '@/lib/staff-utils';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== 'SUPERADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { fullName, email, phone, password, isActive } = await req.json();

        if (!fullName || !email || !password) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Check if email already exists
        const existingUser = await db.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json({ message: 'Email already in use' }, { status: 400 });
        }

        // Generate unique staff code
        const staffCode = await generateStaffCode();

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and staff in a transaction
        const staff = await db.staff.create({
            data: {
                fullName,
                email: email.toLowerCase(),
                phone: phone || null,
                staffCode,
                isActive: isActive ?? true,
                user: {
                    create: {
                        email: email.toLowerCase(),
                        password: hashedPassword,
                        role: 'STAFF',
                    },
                },
            },
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: 'Staff member created successfully',
            staffCode: staff.staffCode,
            staff,
        }, { status: 201 });

    } catch (error: any) {
        console.error('[CREATE_STAFF_ERROR]', error);
        return NextResponse.json(
            { message: error.message || 'Failed to create staff member' },
            { status: 500 }
        );
    }
}
