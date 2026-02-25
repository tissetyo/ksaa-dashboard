import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StaffForm } from '@/components/admin/StaffForm';

export const dynamic = 'force-dynamic';

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();

    if (!session || session.user.role !== 'SUPERADMIN') {
        redirect('/');
    }

    const staff = await db.staff.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    email: true,
                },
            },
        },
    });

    if (!staff) {
        redirect('/admin/staff');
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Staff Member</h1>
                <p className="text-muted-foreground">Update staff information</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Staff Information</CardTitle>
                    <CardDescription>
                        Referral code cannot be changed
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <StaffForm initialData={staff} />
                </CardContent>
            </Card>
        </div>
    );
}
