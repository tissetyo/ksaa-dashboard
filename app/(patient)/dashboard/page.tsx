import { PatientDashboardClient } from '@/components/patient/PatientDashboardClient';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getPatientByUserId } from '@/lib/queries';

export default async function PatientDashboard() {
    // Quick auth check - just verify session exists
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Quick check if patient profile exists (needed for redirect)
    const patient = await getPatientByUserId(session.user.id);

    if (!patient) {
        redirect('/profile/complete');
    }

    // All actual data is loaded by UserDataProvider in layout
    return <PatientDashboardClient />;
}
