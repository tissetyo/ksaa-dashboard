import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getReviewByToken } from '@/lib/actions/review';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { Metadata } from 'next';
import { getSiteSetting } from '@/lib/actions/site-settings';
import {
    Calendar,
    Clock,
    MapPin,
    MessageCircle,
    Video,
    Building2,
    Home,
    ArrowLeft,
    CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Write a Review | KSAA',
    description: 'Share your feedback with us.',
    robots: {
        index: false,
        follow: false,
    },
};

const CONSULTATION_INFO: Record<string, { label: string; icon: any; color: string }> = {
    WHATSAPP_CALL: { label: 'WhatsApp Call', icon: MessageCircle, color: 'text-green-600' },
    GOOGLE_MEET: { label: 'Online (Google Meet)', icon: Video, color: 'text-blue-600' },
    IN_PERSON: { label: 'Visit Our Office', icon: Building2, color: 'text-[#008E7E]' },
    HOME_VISIT: { label: 'Home Visit', icon: Home, color: 'text-orange-600' },
};

interface ReviewPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
    const { token } = await searchParams;

    if (!token || typeof token !== 'string') {
        return notFound();
    }

    const { success, data, error, recent } = await getReviewByToken(token) as any;

    if (!success || !data) {
        if (error === 'ReviewSubmitted' && recent) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg mx-auto shadow-lg border-2 border-green-100 bg-white p-10 rounded-xl text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
                        <p className="text-gray-600">
                            Your review has been submitted successfully. We appreciate your feedback!
                        </p>
                        <a href="/" className="mt-6 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                            Return Home
                        </a>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow max-w-md text-center">
                    <h1 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h1>
                    <p className="text-gray-600">{error || 'Invalid review link.'}</p>
                </div>
            </div>
        );
    }

    const session = await auth();

    // Login gate: redirect to login if not authenticated
    if (!session?.user) {
        redirect(`/login?callbackUrl=${encodeURIComponent(`/review?token=${token}`)}`);
    }

    const logoUrl = await getSiteSetting('logo_url') || '/ksaa-logo.png';
    const consultInfo = data.consultationType ? CONSULTATION_INFO[data.consultationType] : null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard">
                            <img src={logoUrl} alt="KSAA STEMCARE" className="object-contain h-12 max-w-[160px]" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <Link href="/appointments" className="inline-flex items-center text-sm text-gray-500 hover:text-[#008E7E] transition-colors mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Appointments
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Rate Your Experience</h1>
                    <p className="text-gray-600 mt-1">We&apos;d love to hear about your experience with us.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Appointment Details (Left Side) */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{data.serviceName}</h2>
                                {data.staffName && (
                                    <p className="text-sm text-gray-500 mt-1">with {data.staffName}</p>
                                )}
                            </div>

                            {/* Date & Time */}
                            <div className="flex items-start gap-4">
                                <Calendar className="h-5 w-5 text-[#008E7E] mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Date & Time</p>
                                    <p className="text-gray-600 text-sm">
                                        {format(new Date(data.appointmentDate), 'EEEE, MMMM d, yyyy')}
                                    </p>
                                    {data.timeSlot && (
                                        <p className="text-[#008E7E] font-medium flex items-center gap-1 mt-1 text-sm">
                                            <Clock className="h-3.5 w-3.5" />
                                            {data.timeSlot}
                                            {data.durationMinutes ? ` (${data.durationMinutes} min)` : ''}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Consultation Type */}
                            {consultInfo && (
                                <div className="flex items-start gap-4">
                                    <consultInfo.icon className={`h-5 w-5 mt-0.5 ${consultInfo.color}`} />
                                    <div>
                                        <p className="font-medium text-gray-900">Consultation Method</p>
                                        <p className="text-gray-600 text-sm">{consultInfo.label}</p>
                                    </div>
                                </div>
                            )}

                            {/* Location */}
                            {data.consultationAddress && (
                                <div className="flex items-start gap-4">
                                    <MapPin className="h-5 w-5 text-[#008E7E] mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Location</p>
                                        <p className="text-gray-600 text-sm">{data.consultationAddress}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Review Form (Right Side) */}
                    <div className="md:col-span-3">
                        <ReviewForm
                            token={token}
                            initialData={{
                                serviceName: data.serviceName,
                                patientName: data.patientName,
                                appointmentDate: data.appointmentDate,
                                timeSlot: data.timeSlot,
                                consultationType: data.consultationType,
                                consultationAddress: data.consultationAddress,
                                durationMinutes: data.durationMinutes,
                                customerType: data.customerType,
                            }}
                            user={session?.user}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
