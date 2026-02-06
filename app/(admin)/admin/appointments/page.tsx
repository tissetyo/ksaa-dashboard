import { db } from '@/lib/db';
import { AppointmentTable } from '@/components/admin/AppointmentTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const dynamic = 'force-dynamic';

export default async function AdminAppointmentsPage() {
    const appointments = await db.appointment.findMany({
        include: {
            patient: true,
            product: true,
        },
        orderBy: {
            appointmentDate: 'desc',
        },
    });

    const pending = appointments.filter(a => a.status === 'PENDING');
    const upcoming = appointments.filter(a => a.status === 'CONFIRMED');
    const historical = appointments.filter(a => ['COMPLETED', 'CANCELLED'].includes(a.status));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Appointment Management</h1>
                <p className="text-muted-foreground">Track and manage student bookings and treatment statuses.</p>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="pending">
                        Pending {pending.length > 0 && `(${pending.length})`}
                    </TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="historical">History</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6">
                    <AppointmentTable appointments={pending} />
                </TabsContent>

                <TabsContent value="upcoming" className="mt-6">
                    <AppointmentTable appointments={upcoming} />
                </TabsContent>

                <TabsContent value="historical" className="mt-6">
                    <AppointmentTable appointments={historical} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
