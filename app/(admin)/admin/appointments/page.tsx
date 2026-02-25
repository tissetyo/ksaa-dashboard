import { AdminAppointmentsClient } from '@/components/admin/AdminAppointmentsClient';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

export default async function AdminAppointmentsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/admin-login');

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    });
    if (!user || !['SUPERADMIN', 'STAFF'].includes(user.role)) redirect('/admin-login');

    const [staffMembers, products, patients] = await Promise.all([
        db.staff.findMany({
            where: { isActive: true },
            select: { id: true, fullName: true, staffCode: true },
            orderBy: { fullName: 'asc' }
        }),
        db.product.findMany({
            where: { isActive: true },
            select: { id: true, name: true, durationMinutes: true },
            orderBy: { name: 'asc' }
        }),
        db.patient.findMany({
            select: {
                id: true,
                fullName: true,
                phone: true,
                user: { select: { email: true } }
            },
            orderBy: { fullName: 'asc' },
            // Limit to 100 for perf, in a real app would use async search
            take: 100
        }),
    ]);

    return <AdminAppointmentsClient staffMembers={staffMembers} products={products} patients={patients} />;
}

