import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { ProfileWizard } from '@/components/patient/ProfileWizard';

export const dynamic = 'force-dynamic';

export default async function CompleteProfilePage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const patient = await db.patient.findUnique({
        where: { userId: session.user.id },
    });

    return <ProfileWizard initialData={patient} />;
}
