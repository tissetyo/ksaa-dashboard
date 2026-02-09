import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

export default async function AdminDashboardPage() {
    // Quick auth check only
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/admin-login');
    }

    // Verify admin role
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
            staff: true
        }
    });

    if (!user || !['SUPERADMIN', 'STAFF'].includes(user.role)) {
        redirect('/admin-login');
    }

    // All data comes from AdminDataProvider in layout
    return <AdminDashboardClient staffCode={user.staff?.staffCode} staffName={user.staff?.fullName} />;
}
