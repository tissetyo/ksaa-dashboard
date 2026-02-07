import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/patient/ProfileForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default async function CompleteProfilePage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    const patient = await db.patient.findUnique({
        where: { userId: session.user.id },
    });

    // If already has physical data or medical data, maybe just redirect?
    // But for simple flow, we let them complete it.

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-[#0F665C]">Complete Your Profile</h1>
                <p className="text-gray-600">Please provide your medical details to help us serve you better.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Medical Information</CardTitle>
                    <CardDescription>
                        This information is private and will only be used by STEMCARE staff to provide better service.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm initialData={patient} />
                </CardContent>
            </Card>
        </div>
    );
}
