'use client';

import { useAdminData } from '@/components/providers/AdminDataProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppointmentTable } from '@/components/admin/AppointmentTable';

export function AdminAppointmentsClient({ staffMembers = [], products = [] }: { staffMembers?: any[]; products?: any[] }) {
    const { data, isLoading } = useAdminData();

    if (isLoading || !data) {
        return <AppointmentsSkeleton />;
    }

    const { appointments } = data;

    // Filter appointments by status
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const pendingAppointments = appointments.filter((apt: any) => apt.status === 'PENDING');
    const upcomingAppointments = appointments.filter((apt: any) =>
        ['PENDING', 'CONFIRMED'].includes(apt.status) &&
        new Date(apt.appointmentDate) >= startOfToday
    );
    const historicalAppointments = appointments.filter((apt: any) =>
        ['COMPLETED', 'CANCELLED'].includes(apt.status) ||
        (new Date(apt.appointmentDate) < startOfToday && apt.status !== 'PENDING')
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList>
                    <TabsTrigger value="pending">
                        Pending ({pendingAppointments.length})
                    </TabsTrigger>
                    <TabsTrigger value="upcoming">
                        Upcoming ({upcomingAppointments.length})
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        History ({historicalAppointments.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-4">
                    <AppointmentTable appointments={pendingAppointments} staffMembers={staffMembers} products={products} />
                </TabsContent>

                <TabsContent value="upcoming" className="mt-4">
                    <AppointmentTable appointments={upcomingAppointments} staffMembers={staffMembers} products={products} />
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                    <AppointmentTable appointments={historicalAppointments} staffMembers={staffMembers} products={products} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function AppointmentsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="flex gap-2 mb-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-9 w-24 rounded-md" />
                ))}
            </div>
            <div className="bg-white rounded-lg border">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 border-b flex gap-4">
                        <Skeleton className="h-12 w-24" />
                        <Skeleton className="h-12 w-32" />
                        <Skeleton className="h-12 w-40" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                ))}
            </div>
        </div>
    );
}
