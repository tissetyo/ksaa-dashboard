import { db } from '@/lib/db';
import { PatientDirectoryClient } from '@/components/admin/PatientDirectoryClient';

export const dynamic = 'force-dynamic';

export default async function AdminPatientsPage() {
    const patients = await db.patient.findMany({
        select: {
            id: true,
            fullName: true,
            phone: true,
            createdAt: true,
            user: { select: { email: true } },
            _count: { select: { appointments: true } },
        },
        orderBy: { fullName: 'asc' },
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
                <p className="text-muted-foreground">View and manage all registered patient records.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <PatientDirectoryClient patients={patients as any} />
            </div>
        </div>
    );
}
