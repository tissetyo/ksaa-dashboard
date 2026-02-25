'use client';

import { useUserData } from '@/components/providers/UserDataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
    Calendar, User, ArrowRight, Sparkles, Clock, MapPin,
    PhoneCall, Video, Building2, Home, CheckCircle2, Bell, ExternalLink,
} from 'lucide-react';
import { OnboardingTrigger } from '@/components/onboarding/OnboardingTrigger';
import { format } from 'date-fns';
import { BannerCarousel } from './BannerCarousel';
import { ProfileCompletionBar } from './ProfileCompletionBar';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const CONSULTATION_ICON: Record<string, any> = {
    WHATSAPP_CALL: PhoneCall,
    GOOGLE_MEET: Video,
    IN_PERSON: Building2,
    HOME_VISIT: Home,
};
const CONSULTATION_LABEL: Record<string, string> = {
    WHATSAPP_CALL: 'WhatsApp Call',
    GOOGLE_MEET: 'Online (Google Meet)',
    IN_PERSON: 'Visit Office',
    HOME_VISIT: 'Home Visit',
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    CONFIRMED: { label: 'Confirmed', className: 'bg-green-100 text-green-700 border-green-200' },
    COMPLETED: { label: 'Completed', className: 'bg-[#008E7E]/10 text-[#008E7E] border-[#008E7E]/20' },
    CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500 border-gray-200' },
};

export function PatientDashboardClient() {
    const { data, isLoading } = useUserData();
    const [banners, setBanners] = useState<any[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/banners').then(r => r.json()).then(d => setBanners(d.banners || []));
        if (data?.patient?.id) {
            fetch('/api/recommendations').then(r => r.json()).then(d => setRecommendations(d.recommendations || []));
        }
    }, [data?.patient?.id]);

    const handleDecline = async (recId: string) => {
        // Optimistically remove from UI immediately
        setRecommendations(prev => prev.filter((r: any) => r.id !== recId));
        await fetch(`/api/recommendations/${recId}/decline`, { method: 'POST' });
    };

    if (isLoading) return <DashboardSkeleton />;

    if (!data?.patient) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="bg-[#008E7E]/10 rounded-full p-6">
                    <User className="h-12 w-12 text-[#008E7E]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Complete Your Profile</h2>
                <p className="text-gray-500 text-sm text-center max-w-xs">
                    Please complete your profile to access all KSAA Stemcare services.
                </p>
                <Button asChild className="bg-[#008E7E] hover:bg-[#008E7E]/90">
                    <Link href="/profile/complete">Get Started →</Link>
                </Button>
            </div>
        );
    }

    const { patient, services, upcomingAppointments } = data;
    const nextAppointment = upcomingAppointments?.[0];
    const firstName = patient.fullName?.split(' ')[0] || 'there';

    return (
        <div className="space-y-6 pb-10">
            {/* ── Banners ─────────────────── */}
            {banners.length > 0 && <BannerCarousel banners={banners} />}

            {/* ── Welcome header ──────────── */}
            <div className="bg-gradient-to-r from-[#008E7E] to-emerald-500 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white/80 text-sm mb-1">Good to see you 👋</p>
                        <h1 className="text-2xl sm:text-3xl font-bold">{firstName}!</h1>
                        <p className="text-white/80 text-sm mt-1">Manage your STEMCARE journey here.</p>
                    </div>
                    <div className="bg-white/20 rounded-2xl p-3 hidden sm:block">
                        <Sparkles className="h-8 w-8 text-white" />
                    </div>
                </div>
            </div>

            {/* ── Profile Completion ──────── */}
            <ProfileCompletionBar patient={patient} compact />

            {/* ── Recommendations (if any) ─ */}
            {recommendations.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-orange-500" />
                        <h2 className="text-base font-bold text-gray-900">Recommendations from Your Doctor</h2>
                    </div>
                    {recommendations.map((rec: any) => (
                        <Card key={rec.id} className="border-orange-200 bg-orange-50">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{rec.product?.name}</p>
                                        {rec.staffNote && (
                                            <p className="text-sm text-gray-600 mt-0.5">"{rec.staffNote}"</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            Recommended {format(new Date(rec.createdAt), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="bg-[#008E7E] hover:bg-[#008E7E]/90 text-xs"
                                            asChild
                                        >
                                            <Link href={`/book?service=${rec.productId}&rec=${rec.id}`}>
                                                Accept & Book
                                            </Link>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-xs border-orange-300 text-orange-700 hover:bg-orange-100"
                                            onClick={() => handleDecline(rec.id)}
                                        >
                                            Decline
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* ── Next Appointment + Quick Actions ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Next Appointment */}
                <Card className="sm:col-span-2 border-[#008E7E]/20 rounded-2xl shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-800">
                            <Calendar className="h-4 w-4 text-[#008E7E]" />
                            Next Appointment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {nextAppointment ? (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="font-bold text-gray-900 text-lg">{nextAppointment.product?.name}</p>
                                    <p className="text-gray-500 text-sm">
                                        {format(new Date(nextAppointment.appointmentDate), 'EEEE, MMMM d, yyyy')}
                                    </p>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="flex items-center gap-1 text-[#008E7E] font-semibold text-sm">
                                            <Clock className="h-3.5 w-3.5" /> {nextAppointment.timeSlot}
                                        </span>
                                        {nextAppointment.consultationType && (() => {
                                            const Icon = CONSULTATION_ICON[nextAppointment.consultationType] || Calendar;
                                            return (
                                                <span className="flex items-center gap-1 text-gray-500 text-xs">
                                                    <Icon className="h-3.5 w-3.5" />
                                                    {CONSULTATION_LABEL[nextAppointment.consultationType]}
                                                </span>
                                            );
                                        })()}
                                        <Badge className={STATUS_BADGE[nextAppointment.status]?.className || ''} variant="outline">
                                            {STATUS_BADGE[nextAppointment.status]?.label || nextAppointment.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {/* Action buttons based on consultation type */}
                                    {nextAppointment.consultationType === 'WHATSAPP_CALL' && nextAppointment.consultationPhone && (
                                        <Button asChild size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                                            <a href={`https://wa.me/${nextAppointment.consultationPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">
                                                <PhoneCall className="mr-1 h-3.5 w-3.5" /> Start Call
                                            </a>
                                        </Button>
                                    )}
                                    {nextAppointment.consultationType === 'GOOGLE_MEET' && nextAppointment.googleMeetLink && nextAppointment.status === 'CONFIRMED' && (
                                        <>
                                            <Button asChild size="sm" variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                                                <a href={nextAppointment.googleMeetLink} target="_blank" rel="noreferrer">
                                                    <Video className="mr-1 h-3.5 w-3.5" /> Join Meeting
                                                </a>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(nextAppointment.googleMeetLink);
                                                    toast.success('Link copied to clipboard');
                                                }}
                                            >
                                                <ExternalLink className="mr-1 h-3.5 w-3.5" /> Copy Link
                                            </Button>
                                        </>
                                    )}
                                    <Button asChild size="sm" className="bg-[#008E7E] hover:bg-[#008E7E]/90 flex-shrink-0">
                                        <Link href={`/appointments/${nextAppointment.id}`}>
                                            View <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-6 gap-3 text-center">
                                <CheckCircle2 className="h-10 w-10 text-gray-200" />
                                <p className="text-gray-400 text-sm">No upcoming appointments.</p>
                                <Button asChild size="sm" className="bg-[#008E7E] hover:bg-[#008E7E]/90">
                                    <Link href="/services">
                                        Book a Service <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="rounded-2xl shadow-sm border-gray-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-gray-800">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button asChild className="w-full justify-start bg-[#008E7E] hover:bg-[#008E7E]/90" size="sm">
                            <Link href="/services">
                                <Sparkles className="h-4 w-4 mr-2" /> Book a Service
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start" size="sm">
                            <Link href="/appointments">
                                <Calendar className="h-4 w-4 mr-2 text-[#008E7E]" /> My Appointments
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start" size="sm">
                            <Link href="/profile">
                                <User className="h-4 w-4 mr-2 text-[#008E7E]" /> My Profile
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* ── Services Grid ──────────── */}
            {services && services.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-orange-500" />
                            Our Services
                        </h2>
                        <Link href="/services" className="text-sm text-[#008E7E] font-medium hover:underline">
                            View all →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.slice(0, 6).map((service: any) => (
                            <Link
                                key={service.id}
                                href={`/book?service=${service.id}`}
                                className="group block rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-[#008E7E]/30 transition-all duration-200 overflow-hidden"
                            >
                                {service.imageUrl && (
                                    <div className="h-32 overflow-hidden bg-gray-100">
                                        <img
                                            src={service.imageUrl}
                                            alt={service.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 text-sm">{service.name}</h3>
                                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{service.description}</p>
                                    <div className="flex items-center justify-between mt-3">
                                        {service.showPrice !== false && service.priceMYR != null && service.priceMYR > 0 ? (
                                            <span className="text-sm font-bold text-[#008E7E]">
                                                RM {service.priceMYR.toFixed(2)}
                                            </span>
                                        ) : service.showPrice !== false ? (
                                            <Badge className="bg-[#008E7E]/10 text-[#008E7E] border-none text-xs">FREE</Badge>
                                        ) : (
                                            <span />
                                        )}
                                        <span className="text-xs text-[#008E7E] font-medium group-hover:underline">
                                            Book →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <OnboardingTrigger />
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <Skeleton className="w-full rounded-2xl h-32" />
            <Skeleton className="w-full h-20 rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Skeleton className="sm:col-span-2 h-36 rounded-2xl" />
                <Skeleton className="h-36 rounded-2xl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
        </div>
    );
}
