import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StaffListPage() {
    const session = await auth();

    if (!session || session.user.role !== 'SUPERADMIN') {
        redirect('/');
    }

    const staff = await db.staff.findMany({
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
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
                    <p className="text-muted-foreground">Manage staff accounts and referral codes</p>
                </div>
                <Button asChild>
                    <Link href="/admin/staff/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Staff Member
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4">
                {staff.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Users className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No staff members yet</p>
                            <Button asChild className="mt-4">
                                <Link href="/admin/staff/create">Create First Staff Member</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    staff.map((member) => (
                        <Card key={member.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {member.fullName}
                                            {!member.isActive && (
                                                <span className="text-sm font-normal text-muted-foreground">(Inactive)</span>
                                            )}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/admin/staff/${member.id}/edit`}>Edit</Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Referral Code</p>
                                        <p className="font-mono font-bold text-blue-600">{member.staffCode}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Phone</p>
                                        <p>{member.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Referrals</p>
                                        <p className="font-semibold">{member._count.referredPatients}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Status</p>
                                        <p className={member.isActive ? 'text-green-600' : 'text-red-600'}>
                                            {member.isActive ? 'Active' : 'Inactive'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
