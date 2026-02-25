'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DialogFooter } from '@/components/ui/dialog';
import {
    User,
    Phone,
    Mail,
    Calendar,
    Clock,
    MapPin,
    Heart,
    Pill,
    FileText,
    CreditCard,
    Video,
    MessageCircle,
    Building2,
    Home,
    Copy,
    Check,
    CalendarPlus,
    Loader2,
    ExternalLink,
    History,
} from 'lucide-react';
import { format } from 'date-fns';
import { createGoogleCalendarEvent } from '@/lib/actions/admin-appointment';
import { getGoogleConnectionStatus } from '@/lib/actions/google-connect';
import { toast } from 'sonner';
import Link from 'next/link';

interface AppointmentDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: any;
    onRefresh?: () => void;
    onConfirm?: (appointment: any) => void;
    onComplete?: (appointment: any) => void;
    onHistory?: (patientId: string, patientName: string) => void;
}

export function AppointmentDetailModal({
    open,
    onOpenChange,
    appointment,
    onRefresh,
    onConfirm,
    onComplete,
    onHistory,
}: AppointmentDetailModalProps) {
    const [isCreatingEvent, setIsCreatingEvent] = useState(false);
    const [meetLink, setMeetLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isGoogleConnected, setIsGoogleConnected] = useState<boolean | null>(null);
    const [isCheckingGoogle, setIsCheckingGoogle] = useState(false);

    useEffect(() => {
        if (open && (appointment?.status === 'CONFIRMED' || appointment?.status === 'COMPLETED')) {
            checkGoogleConnection();
        }
    }, [open, appointment?.status]);

    const checkGoogleConnection = async () => {
        setIsCheckingGoogle(true);
        try {
            const status = await getGoogleConnectionStatus();
            setIsGoogleConnected(status.connected);
        } catch (error) {
            console.error('Failed to check Google connection:', error);
        } finally {
            setIsCheckingGoogle(false);
        }
    };

    if (!appointment) return null;

    const { patient, product } = appointment;
    const displayMeetLink = meetLink || appointment.googleMeetLink;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <Badge variant="secondary">Pending</Badge>;
            case 'CONFIRMED': return <Badge className="bg-blue-100 text-blue-700 border-none">Confirmed</Badge>;
            case 'COMPLETED': return <Badge className="bg-green-100 text-green-700 border-none">Completed</Badge>;
            case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const getConsultationLabel = (type: string) => {
        switch (type) {
            case 'WHATSAPP_CALL': return 'WhatsApp Call';
            case 'GOOGLE_MEET': return 'Google Meet';
            case 'IN_PERSON': return 'In-Person Visit';
            case 'HOME_VISIT': return 'Home Visit';
            default: return type;
        }
    };

    const getConsultationIcon = (type: string) => {
        switch (type) {
            case 'WHATSAPP_CALL': return <MessageCircle className="h-4 w-4 text-green-600" />;
            case 'GOOGLE_MEET': return <Video className="h-4 w-4 text-blue-600" />;
            case 'IN_PERSON': return <Building2 className="h-4 w-4 text-orange-600" />;
            case 'HOME_VISIT': return <Home className="h-4 w-4 text-purple-600" />;
            default: return null;
        }
    };

    const handleCreateCalendarEvent = async () => {
        setIsCreatingEvent(true);
        try {
            const result = await createGoogleCalendarEvent(appointment.id);
            if (result.success) {
                toast.success('Google Calendar event created with Meet link!');
                setMeetLink(result.googleMeetLink || null);
                onRefresh?.();
            } else {
                toast.error(result.error || 'Failed to create calendar event');
            }
        } catch (error) {
            toast.error('Failed to create calendar event');
        } finally {
            setIsCreatingEvent(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-[#008E7E]" />
                            Appointment Details
                        </DialogTitle>
                        {getStatusBadge(appointment.status)}
                    </div>
                    <DialogDescription>
                        Full details submitted by the patient
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">

                    {/* Patient Details */}
                    <div>
                        <h4 className="font-semibold text-xs text-gray-500 uppercase mb-3">Patient Information</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{patient?.fullName || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{patient?.phone || 'No phone'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{patient?.user?.email || 'No email'}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Service & Schedule */}
                    <div>
                        <h4 className="font-semibold text-xs text-gray-500 uppercase mb-3">Service Details</h4>
                        <div className="bg-[#008E7E]/5 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-[#008E7E]" />
                                <span className="font-medium text-[#008E7E]">{product?.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-[#008E7E]/70" />
                                <span className="text-sm text-[#008E7E]/80">
                                    {format(new Date(appointment.appointmentDate), 'EEEE, MMMM d, yyyy')} at {appointment.timeSlot}
                                </span>
                            </div>
                            {product?.durationMinutes && (
                                <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-[#008E7E]/70" />
                                    <span className="text-sm text-[#008E7E]/80">{product.durationMinutes} minutes</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Consultation Method */}
                    {appointment.consultationType && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-xs text-gray-500 uppercase mb-3">Consultation Method</h4>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    <div className="flex items-center gap-3">
                                        {getConsultationIcon(appointment.consultationType)}
                                        <Badge variant="outline">{getConsultationLabel(appointment.consultationType)}</Badge>
                                    </div>
                                    {appointment.consultationPhone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm">WhatsApp: {appointment.consultationPhone}</span>
                                        </div>
                                    )}
                                    {appointment.consultationEmail && (
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm">Email: {appointment.consultationEmail}</span>
                                        </div>
                                    )}
                                    {appointment.consultationAddress && (
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm">{appointment.consultationAddress}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Google Meet Link / Create Calendar Event Section */}
                    {(appointment.status === 'CONFIRMED' || appointment.status === 'COMPLETED') && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-xs text-gray-500 uppercase mb-3">Google Calendar & Meet</h4>
                                {displayMeetLink ? (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Video className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                            <span className="text-sm font-medium text-blue-800">Google Meet Link</span>
                                            <Badge className="bg-green-100 text-green-700 border-none text-xs ml-auto">Active</Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <code className="text-xs bg-white border border-blue-200 rounded px-2 py-1 text-blue-700 flex-1 truncate">
                                                {displayMeetLink}
                                            </code>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                                                onClick={() => handleCopy(displayMeetLink)}
                                            >
                                                {copied ? <Check className="h-3.5 w-3.5 mr-1 text-green-600" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                                                {copied ? 'Copied!' : 'Copy Link'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                asChild
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                <a href={displayMeetLink} target="_blank" rel="noopener noreferrer">
                                                    <Video className="h-3.5 w-3.5 mr-1" /> Open Meet
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ) : isCheckingGoogle ? (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center">
                                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                    </div>
                                ) : isGoogleConnected ? (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                                        <p className="text-sm text-gray-500">No Google Calendar event created yet for this appointment.</p>
                                        <Button
                                            onClick={handleCreateCalendarEvent}
                                            disabled={isCreatingEvent}
                                            className="bg-[#008E7E] hover:bg-[#0a4f47] text-white"
                                            size="sm"
                                        >
                                            {isCreatingEvent ? (
                                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
                                            ) : (
                                                <><CalendarPlus className="h-4 w-4 mr-2" /> Create Google Calendar Event</>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                                        <p className="text-sm text-amber-800">You need to connect your Google account to create calendar events and meeting links.</p>
                                        <Button asChild size="sm" className="bg-[#008E7E] hover:bg-[#0a4f47] text-white">
                                            <Link href="/admin/settings">Connect Email</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Health Information */}
                    {(appointment.healthCondition || appointment.onMedication) && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-xs text-gray-500 uppercase mb-3">Health Information</h4>
                                <div className="bg-red-50/50 rounded-lg p-4 space-y-3">
                                    {appointment.healthCondition && (
                                        <div className="flex gap-3">
                                            <Heart className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1">Health Condition</p>
                                                <p className="text-sm">{appointment.healthCondition}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <Pill className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">On Medication</p>
                                            <p className="text-sm">{appointment.onMedication ? 'Yes' : 'No'}</p>
                                            {appointment.medicationDetails && (
                                                <p className="text-sm text-gray-600 mt-1">{appointment.medicationDetails}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Additional Notes */}
                    {appointment.adminNotes && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-xs text-gray-500 uppercase mb-3">Patient Notes</h4>
                                <div className="bg-amber-50/50 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <FileText className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                        <p className="text-sm">{appointment.adminNotes}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Treatment Report (if completed) */}
                    {appointment.treatmentReport && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-xs text-gray-500 uppercase mb-3">Treatment Report</h4>
                                <div className="bg-green-50/50 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <FileText className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                        <p className="text-sm whitespace-pre-wrap">{appointment.treatmentReport}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <Separator />

                    {/* Payment */}
                    <div>
                        <h4 className="font-semibold text-xs text-gray-500 uppercase mb-3">Payment</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-gray-500">Total</p>
                                    <p className="font-semibold">RM {appointment.totalAmountMYR?.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Paid</p>
                                    <p className="font-semibold text-green-600">RM {appointment.paidAmountMYR?.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Balance</p>
                                    <p className={`font-semibold ${appointment.balanceAmountMYR > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                        RM {appointment.balanceAmountMYR?.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center bg-gray-50 -mx-6 -mb-6 px-6 py-4 mt-6 border-t gap-3 sm:gap-0">
                    <div className="flex gap-2 w-full sm:w-auto">
                        {onHistory && (
                            <Button variant="outline" size="sm" onClick={() => onHistory(patient.id, patient.fullName)} className="flex-1 sm:flex-none">
                                <History className="h-4 w-4 mr-2" />
                                History
                            </Button>
                        )}
                        {appointment.consultationPhone && (
                            <Button variant="outline" size="sm" asChild className="text-green-600 hover:text-green-700 hover:bg-green-50 flex-1 sm:flex-none">
                                <a href={`https://wa.me/${appointment.consultationPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                                </a>
                            </Button>
                        )}
                        {appointment.consultationAddress && appointment.consultationType === 'HOME_VISIT' && (
                            <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                                <a href={`https://maps.google.com/?q=${encodeURIComponent(appointment.consultationAddress)}`} target="_blank" rel="noopener noreferrer">
                                    <MapPin className="h-4 w-4 mr-2" /> Maps
                                </a>
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        {appointment.status === 'PENDING' && onConfirm && (
                            <Button className="bg-[#008E7E] hover:bg-[#0a4f47] w-full sm:w-auto" onClick={() => onConfirm(appointment)}>
                                Confirm Slot
                            </Button>
                        )}
                        {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && onComplete && (
                            <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" onClick={() => onComplete(appointment)}>
                                Mark Completed
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
