import { auth } from '@/lib/auth';
import { getPatientByUserId, getPatientUpcomingAppointments } from '@/lib/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Calendar, Package, User, ArrowRight, Sparkles } from 'lucide-react';
import { db } from '@/lib/db';
import { Product } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function PatientDashboard() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    const patient = await getPatientByUserId(session.user.id);

    if (!patient) {
        redirect('/profile/complete');
    }

    const upcomingAppointments = await getPatientUpcomingAppointments(patient.id);
    const nextAppointment = upcomingAppointments[0];

    // Fetch all active products/services
    const services = await db.product.findMany({
        where: { isActive: true },
        orderBy: { priceMYR: 'asc' } // Free services first
    });

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
                                <p className="text-sm text-gray-400">Browse our services below to book your first treatment!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <div className="space-y-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <Link href="/appointments" className="block p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Calendar className="h-6 w-6 text-blue-600 mr-3" />
                                    <span className="font-medium">My Appointments</span>
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

            {/* Available Services Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Available Treatments</h2>
                        <p className="text-gray-600 text-sm">Book your next STEMCARE session</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <Card key={service.id} className="hover:shadow-lg transition-all border-gray-200 hover:border-blue-300">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">{service.name}</CardTitle>
                                    {service.priceMYR === 0 && (
                                        <Badge className="bg-green-500 hover:bg-green-600">
                                            <Sparkles className="h-3 w-3 mr-1" />
                                            FREE
                                        </Badge>
                                    )}
                                </div>
                                {service.description && (
                                    <CardDescription className="line-clamp-2">
                                        {service.description}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {service.priceMYR === 0 ? 'FREE' : `RM ${service.priceMYR.toFixed(2)}`}
                                        </p>
                                        {service.priceMYR > 0 && service.depositPercentage > 0 && (
                                            <p className="text-sm text-gray-500">
                                                or RM {(service.priceMYR * (service.depositPercentage / 100)).toFixed(2)} deposit
                                            </p>
                                        )}
                                    </div>
                                    <Button asChild className="w-full">
                                        <Link href={`/book?service=${service.id}`}>
                                            Book Now
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {services.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No services available at the moment.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
