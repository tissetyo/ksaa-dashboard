import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, Package, User, ArrowRight } from 'lucide-react';

export default async function PatientDashboard() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    const patient = await db.patient.findUnique({
        where: { userId: session.user.id },
        include: {
            appointments: {
                where: {
                    appointmentDate: {
                        gte: new Date(),
                    },
                    status: 'CONFIRMED',
                },
                include: {
                    product: true,
                },
                orderBy: {
                    appointmentDate: 'asc',
                },
                take: 1,
            },
        },
    });

    if (!patient) {
        redirect('/profile/complete');
    }

    const nextAppointment = patient.appointments[0];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {patient.fullName.split(' ')[0]}!
                </h1>
                <p className="text-gray-600 mt-2">Manage your STEMCARE journey and upcoming treatments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quick Stats / Next Appointment */}
                <Card className="md:col-span-2 border-blue-100 bg-blue-50/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center">
                            <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                            Next Appointment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {nextAppointment ? (
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <p className="font-bold text-xl">{nextAppointment.product.name}</p>
                                    <p className="text-gray-600">
                                        {new Date(nextAppointment.appointmentDate).toLocaleDateString('en-MY', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                    <p className="text-blue-600 font-medium">{nextAppointment.timeSlot}</p>
                                </div>
                                <Button asChild>
                                    <Link href={`/appointments/${nextAppointment.id}`}>
                                        View Details
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-gray-500 mb-4">You have no upcoming appointments.</p>
                                <Button asChild>
                                    <Link href="/services">Book Treatment</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <div className="space-y-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <Link href="/services" className="block p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Package className="h-6 w-6 text-blue-600 mr-3" />
                                    <span className="font-medium">Browse Services</span>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400" />
                            </div>
                        </Link>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow">
                        <Link href="/profile" className="block p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <User className="h-6 w-6 text-blue-600 mr-3" />
                                    <span className="font-medium">My Profile</span>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400" />
                            </div>
                        </Link>
                    </Card>
                </div>
            </div>
        </div>
    );
}
