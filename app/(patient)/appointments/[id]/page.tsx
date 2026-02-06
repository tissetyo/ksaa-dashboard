import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Calendar, Clock, MapPin, CreditCard, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

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
            }
        }
    });

    if (!appointment) {
        notFound();
    }

    // Verify the appointment belongs to the logged-in user
    if (appointment.patient.userId !== session.user.id) {
        notFound();
    }

    const statusColors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        CONFIRMED: 'bg-blue-100 text-blue-800',
        COMPLETED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
        NO_SHOW: 'bg-gray-100 text-gray-800',
    };

    const paymentStatusColors = {
        UNPAID: 'bg-red-100 text-red-800',
        DEPOSIT_PAID: 'bg-blue-100 text-blue-800',
        FULL_PAID: 'bg-green-100 text-green-800',
        REFUNDED: 'bg-purple-100 text-purple-800',
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
                            <Calendar className="h-5 w-5 text-blue-600 mt-1" />
                            <div>
                                <p className="font-medium text-gray-900">Date & Time</p>
                                <p className="text-gray-600">
                                    {format(new Date(appointment.appointmentDate), 'EEEE, MMMM d, yyyy')}
                                </p>
                                <p className="text-blue-600 font-medium flex items-center gap-2 mt-1">
                                    <Clock className="h-4 w-4" />
                                    {appointment.timeSlot}
                                </p>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-4">
                            <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                            <div>
                                <p className="font-medium text-gray-900">Location</p>
                                <p className="text-gray-600">KSAA STEMCARE Clinic</p>
                                <p className="text-sm text-gray-500">Address will be provided upon confirmation</p>
                            </div>
                        </div>

                        {/* Notes */}
                        {appointment.notes && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="font-medium text-gray-900 mb-2">Notes</p>
                                <p className="text-gray-700">{appointment.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

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
                                    {appointment.payments.map((payment) => (
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
                            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                                Cancel Appointment
                            </Button>
                            <Button variant="outline">
                                Reschedule
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
