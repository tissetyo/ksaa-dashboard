import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Package, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { CancelAppointmentButton } from '@/components/patient/CancelAppointmentButton';

export default async function PatientAppointmentsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const patient = await db.patient.findUnique({
        where: { userId: session.user.id }
    });

    if (!patient) redirect('/profile/complete');

    const appointments = await db.appointment.findMany({
        where: { patientId: patient.id },
        include: { product: true },
        orderBy: { appointmentDate: 'desc' },
    });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'PENDING': return 'secondary';
            case 'CONFIRMED': return 'default';
            case 'COMPLETED': return 'outline';
            case 'CANCELLED': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
                    <p className="text-muted-foreground">Track your upcoming treatments and treatment history.</p>
                </div>
                <Button asChild>
                    <Link href="/services">Book New Treatment</Link>
                </Button>
            </div>

            <div className="space-y-4">
                {appointments.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-20 text-center">
                            <p className="text-gray-500 mb-6 font-semibold italic">KSA A STEMCARE | You have not booked any appointments yet.</p>
                            <Button asChild size="lg">
                                <Link href="/services">Browse Services</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    appointments.map((apt) => (
                        <Card key={apt.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row">
                                <div className="bg-[#008E7E] text-white p-6 flex flex-col justify-center items-center min-w-[150px]">
                                    <span className="text-3xl font-bold">{format(new Date(apt.appointmentDate), 'dd')}</span>
                                    <span className="text-sm font-medium uppercase">{format(new Date(apt.appointmentDate), 'MMMM')}</span>
                                    <span className="mt-2 font-mono text-sm bg-[#0a4f47]/50 px-2 py-0.5 rounded">{apt.timeSlot}</span>
                                </div>
                                <div className="flex-1 p-6 flex flex-col md:flex-row justify-between gap-6">
                                    <div className="space-y-2">
                                        <Badge variant={getStatusVariant(apt.status) as any}>{apt.status}</Badge>
                                        <h3 className="text-xl font-bold">{apt.product.name}</h3>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Clock className="w-4 h-4 mr-2" />
                                            Duration: {apt.product.durationMinutes} mins
                                        </div>
                                        {apt.status === 'CONFIRMED' && (
                                            <div className="flex items-center text-sm text-[#008E7E] font-medium pt-2">
                                                <MapPin className="w-4 h-4 mr-1 ml-[-2px]" />
                                                KSAA Center, Kuala Lumpur
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col justify-between items-end border-l-0 md:border-l pl-0 md:pl-6">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Payment Status</p>
                                            <p className="font-bold text-lg">
                                                {apt.balanceAmountMYR > 0 ? `Paid: RM ${apt.paidAmountMYR.toFixed(2)}` : `Full: RM ${apt.totalAmountMYR.toFixed(2)}`}
                                            </p>
                                            {apt.balanceAmountMYR > 0 && (
                                                <p className="text-xs text-[#008E7E] italic">Balance RM {apt.balanceAmountMYR.toFixed(2)} due at clinic</p>
                                            )}
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/appointments/${apt.id}`}>Details</Link>
                                            </Button>
                                            {apt.status === 'PENDING' && (
                                                <CancelAppointmentButton
                                                    appointmentId={apt.id}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
