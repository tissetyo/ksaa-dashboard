import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { email, password, fullName, phone } = await req.json();

        console.log('[REGISTER_DEBUG] Attempting to register:', email);

        if (!email || !password || !fullName || !phone) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase();

        const existingUser = await db.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            console.log('[REGISTER_DEBUG] User already exists:', normalizedEmail);
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await db.user.create({
            data: {
                email: normalizedEmail,
                password: hashedPassword,
                role: 'PATIENT',
                patient: {
                    create: {
                        fullName,
                        phone,
                    },
                },
            },
        });

        return NextResponse.json({ message: 'User created' }, { status: 201 });
    } catch (error) {
        console.error('SIGNUP_ERROR', error);
        return NextResponse.json({ message: 'Internal error' }, { status: 500 });
    }
}
