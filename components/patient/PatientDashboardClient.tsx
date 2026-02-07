'use client';

import { useUserData } from '@/components/providers/UserDataProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Calendar, Package, User, ArrowRight, Sparkles } from 'lucide-react';
import { OnboardingTrigger } from '@/components/onboarding/OnboardingTrigger';
import { format } from 'date-fns';

export function PatientDashboardClient() {
    const { data, isLoading } = useUserData();

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (!data?.patient) {
        return (
            <div className="text-center py-10">
                <p>Please complete your profile to continue.</p>
                <Button asChild className="mt-4">
                    <Link href="/profile/complete">Complete Profile</Link>
                </Button>
            </div>
        );
    }

    const { patient, services, upcomingAppointments } = data;
    const nextAppointment = upcomingAppointments[0];

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
                <Card className="md:col-span-2 border-[#0F665C]/20 bg-[#0F665C]/5">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center">
                            <Calendar className="mr-2 h-5 w-5 text-[#0F665C]" />
                            Next Appointment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {nextAppointment ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-lg">{nextAppointment.product?.name}</p>
                                    <p className="text-gray-600">
                                        {format(new Date(nextAppointment.appointmentDate), 'EEEE, MMMM d, yyyy')}
                                    </p>
                                    <p className="text-[#0F665C] font-medium">{nextAppointment.timeSlot}</p>
                                </div>
                                <Button asChild>
                                    <Link href={`/appointments/${nextAppointment.id}`}>
                                        View Details
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-gray-500 mb-4">No upcoming appointments</p>
                                <Button asChild>
                                    <Link href="/book">
                                        Book Now
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button asChild className="w-full justify-start" variant="outline">
                            <Link href="/appointments">
                                <Calendar className="h-4 w-4 mr-2 text-[#0F665C]" />
                                My Appointments
                            </Link>
                        </Button>
                        <Button asChild className="w-full justify-start" variant="outline">
                            <Link href="/profile">
                                <User className="h-4 w-4 mr-2 text-[#0F665C]" />
                                My Profile
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Services */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Sparkles className="mr-2 h-5 w-5 text-[#F37321]" />
                        Available Services
                    </h2>
                    <Link href="/services" className="text-[#0F665C] hover:underline text-sm">
                        View all →
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.slice(0, 3).map((service: any) => (
                        <Card key={service.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">{service.name}</CardTitle>
                                <CardDescription className="line-clamp-2 text-sm">
                                    {service.description || 'Premium healthcare service'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    {service.priceMYR != null && service.priceMYR > 0 ? (
                                        <span className="font-semibold text-[#0F665C]">
                                            RM {service.priceMYR.toFixed(2)}
                                        </span>
                                    ) : (
                                        <Badge className="bg-green-100 text-green-700 border-none">FREE</Badge>
                                    )}
                                    <Button asChild size="sm">
                                        <Link href={`/book?service=${service.id}`}>
                                            Book
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <OnboardingTrigger />
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div>
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-96 mt-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                    <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                </Card>
                <Card>
                    <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
