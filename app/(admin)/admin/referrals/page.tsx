import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ReferralsPage() {
    const session = await auth();

    if (!session || session.user.role !== 'SUPERADMIN') {
        redirect('/');
    }

    // Get all staff with their referral stats
    const staffWithReferrals = await db.staff.findMany({
        include: {
            referredPatients: {
                select: {
                    id: true,
                    fullName: true,
                    phone: true,
                    createdAt: true,
                    user: {
                        select: {
                            email: true,
                        },
                    },
                    appointments: {
                        select: {
                            id: true,
                            product: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
            _count: {
                select: {
                    referredPatients: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const totalReferrals = staffWithReferrals.reduce((sum, staff) => sum + staff._count.referredPatients, 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Referral Analytics</h1>
                <p className="text-muted-foreground">Track staff referrals and patient signups</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalReferrals}</div>
                        <p className="text-xs text-muted-foreground">Across all staff members</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {staffWithReferrals.filter(s => s.isActive).length}
                        </div>
                        <p className="text-xs text-muted-foreground">With referral codes</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Staff Referral Breakdown</h2>
                {staffWithReferrals.map((staff) => (
                    <Card key={staff.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{staff.fullName}</CardTitle>
                                    <CardDescription>
                                        Code: <span className="font-mono font-bold text-[#008E7E]">{staff.staffCode}</span>
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold">{staff._count.referredPatients}</p>
                                    <p className="text-sm text-muted-foreground">Referrals</p>
                                </div>
                            </div>
                        </CardHeader>
                        {staff.referredPatients.length > 0 && (
                            <CardContent>
                                <div className="space-y-3">
                                    <p className="text-sm font-medium">Referred Patients:</p>
                                    <div className="space-y-2">
                                        {staff.referredPatients.map((patient) => (
                                            <div
                                                key={patient.id}
                                                className="flex justify-between items-start p-3 bg-muted rounded-lg text-sm"
                                            >
                                                <div>
                                                    <p className="font-medium">{patient.fullName}</p>
                                                    <p className="text-muted-foreground">{patient.user.email}</p>
                                                    <p className="text-muted-foreground">{patient.phone}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground">
                                                        Signed up: {new Date(patient.createdAt).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {patient.appointments.length} appointment(s)
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
