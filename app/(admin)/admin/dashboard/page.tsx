import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getAdminDashboardStats } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users,
    Calendar,
    TrendingUp,
    AlertCircle,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const stats = await getAdminDashboardStats();
    const { patientCount, appointmentCount, pendingAppointments, revenue, recentAppointments, dailyQuotas } = stats;

    const dashboardStats = [
        {
            title: 'Total Patients',
            value: patientCount.toString(),
            icon: Users,
            description: 'Registered patients',
            color: 'text-[#0F665C]',
            bg: 'bg-[#0F665C]/20',
        },
        {
            title: 'Total Appointments',
            value: appointmentCount.toString(),
            icon: Calendar,
            description: 'All time bookings',
            color: 'text-purple-600',
            bg: 'bg-purple-100',
        },
        {
            title: 'Pending Review',
            value: pendingAppointments.toString(),
            icon: AlertCircle,
            description: 'Needs confirmation',
            color: 'text-yellow-600',
            bg: 'bg-yellow-100',
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(revenue || 0),
            icon: TrendingUp,
            description: 'Succeeded payments',
            color: 'text-green-600',
            bg: 'bg-green-100',
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground">Real-time statistics and clinic performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardStats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <div className={`${stat.bg} p-2 rounded-full`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentAppointments.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-10 text-center">No recent appointments.</p>
                            ) : (
                                recentAppointments.map((apt) => (
                                    <div key={apt.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div>
                                            <p className="text-sm font-medium">{apt.patient.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{apt.product.name} • {apt.timeSlot}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-mono">{new Date(apt.appointmentDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Daily Quota Usage (Today onwards)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {dailyQuotas.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-10 text-center">No quota data for upcoming dates.</p>
                            ) : (
                                dailyQuotas.map((quota) => (
                                    <div key={quota.id} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>{quota.product.name} ({new Date(quota.bookingDate).toLocaleDateString()})</span>
                                            <span className="font-bold">{quota.bookedCount} / {quota.maxQuota}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-[#0F665C] h-2 rounded-full transition-all"
                                                style={{ width: `${Math.min((quota.bookedCount / quota.maxQuota) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
