import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
    Calendar,
    Clock,
    MapPin,
    CreditCard,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    MessageCircle,
    Video,
    Building2,
    Home,
    Heart,
    Pill,
    FileText,
    Star,
    ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { CancelAppointmentButton } from '@/components/patient/CancelAppointmentButton';
import { CopyMeetLink } from '@/components/patient/CopyMeetLink';
import { ReviewForm } from '@/components/reviews/ReviewForm';

export const dynamic = 'force-dynamic';

const CONSULTATION_INFO: Record<string, { label: string; icon: any; color: string }> = {
    WHATSAPP_CALL: { label: 'WhatsApp Call', icon: MessageCircle, color: 'text-green-600' },
    GOOGLE_MEET: { label: 'Online (Google Meet)', icon: Video, color: 'text-blue-600' },
    IN_PERSON: { label: 'Visit Our Office', icon: Building2, color: 'text-[#008E7E]' },
    HOME_VISIT: { label: 'Home Visit', icon: Home, color: 'text-orange-600' },
};

interface AppointmentDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function AppointmentDetailPage({ params }: AppointmentDetailPageProps) {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    const appointment = await db.appointment.findUnique({
        where: { id },
        include: {
            product: true,
            patient: {
                include: {
                    user: {
                        select: { email: true }
                    }
                }
            },
            payments: {
                orderBy: { createdAt: 'desc' }
            },
            reviewToken: true,
            review: true
        }
    });

    if (!appointment) {
        notFound();
    }

    // Verify the appointment belongs to the logged-in user
    if (appointment.patient.userId !== session.user.id) {
        notFound();
    }

    const { reviewToken, review } = appointment;
    const showReviewForm = appointment.status === 'COMPLETED' && reviewToken && !reviewToken.isUsed && !review;
    const showReview = !!review;

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        CONFIRMED: 'bg-[#008E7E]/20 text-blue-800',
        COMPLETED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
        NO_SHOW: 'bg-gray-100 text-gray-800',
    };

    const paymentStatusColors: Record<string, string> = {
        UNPAID: 'bg-red-100 text-red-800',
        DEPOSIT_PAID: 'bg-[#008E7E]/20 text-blue-800',
        FULL_PAID: 'bg-green-100 text-green-800',
        REFUNDED: 'bg-purple-100 text-purple-800',
    };

    const consultInfo = appointment.consultationType
        ? CONSULTATION_INFO[appointment.consultationType]
        : null;

    // Build Google Maps embed URL if we have an address
    const getGoogleMapsEmbedUrl = (address: string) => {
        return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Button asChild variant="ghost" className="mb-4">
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
                    <p className="text-gray-600 mt-2">View your appointment information</p>
                </div>
                <div className="flex gap-2">
                    <Badge className={statusColors[appointment.status]}>
                        {appointment.status}
                    </Badge>
                    <Badge className={paymentStatusColors[appointment.paymentStatus]}>
                        {appointment.paymentStatus.replace('_', ' ')}
                    </Badge>
                </div>
            </div>

            {/* Status Messages */}
            {appointment.status === 'PENDING' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-yellow-800 font-medium">Awaiting Confirmation</p>
                        <p className="text-yellow-700 text-sm">Your booking has been received. Our staff will review and confirm it shortly.</p>
                    </div>
                </div>
            )}
            {appointment.status === 'CONFIRMED' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-blue-800 font-medium">Appointment Confirmed</p>
                        <p className="text-blue-700 text-sm">Your appointment has been confirmed. See the details below.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Details */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-2xl">{appointment.product.name}</CardTitle>
                        {appointment.product.description && (
                            <CardDescription>{appointment.product.description}</CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Date & Time */}
                        <div className="flex items-start gap-4">
                            <Calendar className="h-5 w-5 text-[#008E7E] mt-1" />
                            <div>
                                <p className="font-medium text-gray-900">Date & Time</p>
                                <p className="text-gray-600">
                                    {format(new Date(appointment.appointmentDate), 'EEEE, MMMM d, yyyy')}
                                </p>
                                <p className="text-[#008E7E] font-medium flex items-center gap-2 mt-1">
                                    <Clock className="h-4 w-4" />
                                    {appointment.timeSlot}
                                </p>
                            </div>
                        </div>

                        {/* Consultation Type */}
                        {consultInfo && (
                            <div className="flex items-start gap-4">
                                <consultInfo.icon className={`h-5 w-5 mt-1 ${consultInfo.color}`} />
                                <div>
                                    <p className="font-medium text-gray-900">Consultation Method</p>
                                    <p className="text-gray-600">{consultInfo.label}</p>
                                    {appointment.consultationPhone && (
                                        <p className="text-sm text-gray-500 mt-1">Phone: {appointment.consultationPhone}</p>
                                    )}
                                    {appointment.consultationEmail && (
                                        <p className="text-sm text-gray-500 mt-1">Email: {appointment.consultationEmail}</p>
                                    )}
                                    {appointment.googleMeetLink && appointment.status === 'CONFIRMED' && (
                                        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                                            <p className="text-sm font-medium text-blue-800 flex items-center gap-1">
                                                <Video className="h-4 w-4" /> Google Meet Link
                                            </p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <code className="text-xs bg-white border border-blue-200 rounded px-2 py-1 text-blue-700 flex-1 truncate">
                                                    {appointment.googleMeetLink}
                                                </code>
                                            </div>
                                            <div className="flex gap-2">
                                                <a
                                                    href={appointment.googleMeetLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md px-3 py-1.5 transition-colors"
                                                >
                                                    <Video className="h-3.5 w-3.5" /> Join Meeting
                                                </a>
                                                <CopyMeetLink link={appointment.googleMeetLink} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Location / Address */}
                        <div className="flex items-start gap-4">
                            <MapPin className="h-5 w-5 text-[#008E7E] mt-1" />
                            <div>
                                <p className="font-medium text-gray-900">Location</p>
                                {appointment.consultationAddress ? (
                                    <p className="text-gray-600">{appointment.consultationAddress}</p>
                                ) : appointment.consultationType === 'IN_PERSON' ? (
                                    <p className="text-gray-600">KSAA STEMCARE Clinic</p>
                                ) : (
                                    <p className="text-sm text-gray-500">Online consultation — no physical location</p>
                                )}
                            </div>
                        </div>

                        {/* Google Maps Embed */}
                        {appointment.consultationAddress && (appointment.consultationType === 'IN_PERSON' || appointment.consultationType === 'HOME_VISIT') && (
                            <div className="rounded-xl overflow-hidden border">
                                <iframe
                                    src={getGoogleMapsEmbedUrl(appointment.consultationAddress)}
                                    width="100%"
                                    height="200"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Appointment Location"
                                />
                            </div>
                        )}

                        {/* Health Info submitted */}
                        {(appointment.healthCondition || appointment.onMedication) && (
                            <div className="border-t pt-4 space-y-3">
                                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-[#008E7E]" /> Health Information Submitted
                                </h4>
                                {appointment.healthCondition && (
                                    <div>
                                        <p className="text-xs text-gray-500">Current Condition</p>
                                        <p className="text-sm text-gray-700">{appointment.healthCondition}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-gray-500">On Medication</p>
                                    <p className="text-sm text-gray-700">{appointment.onMedication ? 'Yes' : 'No'}</p>
                                </div>
                                {appointment.medicationDetails && (
                                    <div>
                                        <p className="text-xs text-gray-500">Medication Details</p>
                                        <p className="text-sm text-gray-700">{appointment.medicationDetails}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Admin Notes (additional notes from patient) */}
                        {appointment.adminNotes && (
                            <div className="border-t pt-4">
                                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-[#008E7E]" /> Additional Notes
                                </h4>
                                <p className="text-sm text-gray-700 mt-1">{appointment.adminNotes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Review Section - in left column above payment */}
                {showReviewForm && reviewToken && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-[#008E7E]">Rate Your Experience</h2>
                        <ReviewForm
                            token={reviewToken.token}
                            initialData={{
                                serviceName: appointment.product.name,
                                patientName: appointment.patient.fullName,
                                appointmentDate: appointment.appointmentDate
                            }}
                            user={{
                                name: appointment.patient.fullName,
                                email: appointment.patient.user.email
                            }}
                        />
                    </div>
                )}

                {showReview && review && (
                    <Card className="bg-green-50/50 border-green-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-800">
                                <CheckCircle2 className="h-5 w-5" />
                                Your Review
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-1 text-yellow-500 mb-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-5 w-5 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                                    />
                                ))}
                            </div>
                            <p className="text-gray-700 italic">&quot;{review.comment}&quot;</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Submitted on {format(new Date(review.createdAt), 'MMMM d, yyyy')}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Payment Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {(appointment.totalAmountMYR ?? 0) === 0 ? 'FREE' : `RM ${(appointment.totalAmountMYR ?? 0).toFixed(2)}`}
                            </p>
                        </div>

                        {(appointment.totalAmountMYR ?? 0) > 0 && (
                            <>
                                <div className="border-t pt-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-gray-600">Paid</span>
                                        <span className="font-medium text-green-600">
                                            RM {(appointment.paidAmountMYR ?? 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Balance</span>
                                        <span className="font-medium text-orange-600">
                                            RM {(appointment.balanceAmountMYR ?? 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {(appointment.balanceAmountMYR ?? 0) > 0 && (
                                    <Button className="w-full" variant="outline">
                                        Pay Balance
                                    </Button>
                                )}
                            </>
                        )}

                        {/* Payment History */}
                        {appointment.payments.length > 0 && (
                            <div className="border-t pt-4">
                                <p className="font-medium text-gray-900 mb-3">Payment History</p>
                                <div className="space-y-2">
                                    {appointment.payments.map((payment: any) => (
                                        <div key={payment.id} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                {payment.status === 'SUCCEEDED' ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                )}
                                                <span className="text-gray-600">
                                                    {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                            <span className="font-medium">
                                                RM {payment.amountMYR.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            {appointment.status === 'PENDING' && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex gap-4 justify-end">
                            <CancelAppointmentButton
                                appointmentId={appointment.id}
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                            />
                            <Button asChild variant="outline">
                                <Link href={`/book?service=${appointment.productId}`}>
                                    Reschedule
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
