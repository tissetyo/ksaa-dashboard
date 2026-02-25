'use client';

import { useAdminData } from '@/components/providers/AdminDataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Calendar, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';

import { StaffQRCode } from './StaffQRCode';

interface AdminDashboardClientProps {
    staffCode?: string;
    staffName?: string;
}

export function AdminDashboardClient({ staffCode, staffName }: AdminDashboardClientProps) {
    const { data, isLoading } = useAdminData();

    if (isLoading || !data) {
        return <DashboardSkeleton />;
    }

    const { stats, appointments } = data;

    // Group appointments by status for recent activity
    const pendingApts = appointments.filter((a: any) => a.status === 'PENDING').slice(0, 5);
    const upcomingApts = appointments.filter((a: any) =>
        a.status === 'CONFIRMED' && new Date(a.appointmentDate) >= new Date()
    ).slice(0, 5);

    const statCards = [
        {
            title: 'Total Patients',
            value: stats.totalPatients,
            icon: Users,
            color: 'text-[#008E7E]',
            bgColor: 'bg-[#008E7E]/10'
        },
        {
            title: 'Total Appointments',
            value: stats.totalAppointments,
            icon: Calendar,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Pending',
            value: stats.pendingAppointments,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
        },
        {
            title: 'Confirmed',
            value: stats.confirmedAppointments,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Completed',
            value: stats.completedAppointments,
            icon: CheckCircle,
            color: 'text-[#008E7E]',
            bgColor: 'bg-[#008E7E]/10'
        },
        {
            title: 'Cancelled',
            value: stats.cancelledAppointments,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Overview of your KSAA clinic operations</p>
                </div>
            </div>

            {staffCode && staffName && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-1">
                        <StaffQRCode staffCode={staffCode} staffName={staffName} />
                    </div>
                    {/* Revenue Snapshot for Staff */}
                    <Card className="bg-gradient-to-r from-[#008E7E] to-[#0a4f47] text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Your Impact (Total Revenue)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">RM {stats.totalRevenue.toFixed(2)}</p>
                            <p className="text-sm opacity-80 mt-1">Keep up the good work!</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statCards.map((stat, index) => (
                    <Card key={index} className={stat.bgColor}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                {stat.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Revenue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-r from-[#008E7E] to-[#0a4f47] text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">RM {stats.totalRevenue.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-[#F37321] to-[#d9651d] text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            This Month
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">RM {stats.monthlyRevenue.toFixed(2)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Pending Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendingApts.length > 0 ? (
                            <div className="space-y-3">
                                {pendingApts.map((apt: any) => (
                                    <div key={apt.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{apt.patient?.fullName}</p>
                                            <p className="text-sm text-gray-500">{apt.product?.name}</p>
                                        </div>
                                        <div className="text-right text-sm">
                                            <p>{new Date(apt.appointmentDate).toLocaleDateString()}</p>
                                            <p className="text-gray-500">{apt.timeSlot}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No pending appointments</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Upcoming Confirmed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {upcomingApts.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingApts.map((apt: any) => (
                                    <div key={apt.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{apt.patient?.fullName}</p>
                                            <p className="text-sm text-gray-500">{apt.product?.name}</p>
                                        </div>
                                        <div className="text-right text-sm">
                                            <p>{new Date(apt.appointmentDate).toLocaleDateString()}</p>
                                            <p className="text-gray-500">{apt.timeSlot}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
                        <CardContent><Skeleton className="h-8 w-16" /></CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
            </div>
        </div>
    );
}
