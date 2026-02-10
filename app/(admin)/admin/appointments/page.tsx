import { AdminAppointmentsClient } from '@/components/admin/AdminAppointmentsClient';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

export default async function AdminAppointmentsPage() {
    // Quick auth check only
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/admin-login');
    }

    // Verify admin role
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    });

    if (!user || !['SUPERADMIN', 'STAFF'].includes(user.role)) {
        redirect('/admin-login');
    }

    // Fetch active staff members for dropdowns
    const staffMembers = await db.staff.findMany({
        where: { isActive: true },
        select: { id: true, fullName: true, staffCode: true },
        orderBy: { fullName: 'asc' }
    });

    // All data comes from AdminDataProvider in layout, but we pass staff list as prop to client component
    // We need to update AdminAppointmentsClient to accept staffMembers
    return <AdminAppointmentsClient staffMembers={staffMembers} />;
}
