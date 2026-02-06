import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StaffForm } from '@/components/admin/StaffForm';

export const dynamic = 'force-dynamic';

export default async function CreateStaffPage() {
    const session = await auth();

    if (!session || session.user.role !== 'SUPERADMIN') {
        redirect('/');
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create Staff Member</h1>
                <p className="text-muted-foreground">Add a new staff member with referral code</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Staff Information</CardTitle>
                    <CardDescription>
                        A unique referral code will be automatically generated
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <StaffForm />
                </CardContent>
            </Card>
        </div>
    );
}
