import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServices } from '@/lib/actions/services';

export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/patient/ProfileForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function EditProfilePage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    const patient = await db.patient.findUnique({
        where: { userId: session.user.id },
    });

    if (!patient) {
        redirect('/profile/complete');
    }

    const services = await getServices();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Update Your Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProfileForm initialData={patient} services={services} />
                </CardContent>
            </Card>
        </div>
    );
}
