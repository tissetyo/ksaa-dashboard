import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { sendReferralSignupNotification } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { salutation, email, password, fullName, phone, referralCode } = await req.json();

        console.log('[REGISTER_DEBUG] Attempting to register:', email);

        if (!email || !password || !fullName || !phone) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        // Validate referral code if provided
        let referredByStaffId = null;
        let referringStaff = null;
        if (referralCode) {
            const staff = await db.staff.findUnique({
                where: { staffCode: referralCode.toUpperCase() },
                select: {
                    id: true,
                    isActive: true,
                    fullName: true,
                    email: true,
                    staffCode: true,
                },
            });

            if (!staff) {
                return NextResponse.json({ message: 'Invalid referral code' }, { status: 400 });
            }

            if (!staff.isActive) {
                return NextResponse.json({ message: 'Referral code is no longer active' }, { status: 400 });
            }

            referredByStaffId = staff.id;
            referringStaff = staff;
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
                        salutation: salutation || undefined,
                        fullName,
                        phone,
                        referredByStaffId,
                    },
                },
            },
        });

        // Send email notification to staff if referred
        if (referringStaff) {
            await sendReferralSignupNotification({
                staffName: referringStaff.fullName,
                staffEmail: referringStaff.email,
                staffCode: referringStaff.staffCode,
                patientName: fullName,
                patientEmail: normalizedEmail,
                patientPhone: phone,
            });
        }

        return NextResponse.json({ message: 'User created' }, { status: 201 });
    } catch (error: any) {
        console.error('[SIGNUP_ERROR]', error);

        // Return a more descriptive error in development or if it's a known Prisma error
        if (error.code) {
            return NextResponse.json({
                message: `Database error: ${error.code}`,
                details: error.message
            }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Internal server error during registration',
            error: error?.message || 'Unknown error'
        }, { status: 500 });
    }
}
