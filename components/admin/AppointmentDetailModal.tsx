'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
} from 'lucide-react';
import { format } from 'date-fns';

interface AppointmentDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: any;
}

export function AppointmentDetailModal({
    open,
    onOpenChange,
    appointment,
}: AppointmentDetailModalProps) {
    if (!appointment) return null;

    const { patient, product } = appointment;

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
                                    {appointment.googleMeetLink && (
                                        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2.5 space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <Video className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                <span className="text-xs font-medium text-blue-800">Google Meet Link</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs bg-white border border-blue-200 rounded px-2 py-0.5 text-blue-700 flex-1 truncate">
                                                    {appointment.googleMeetLink}
                                                </code>
                                                <button
                                                    type="button"
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                                                    onClick={() => navigator.clipboard.writeText(appointment.googleMeetLink)}
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                            <a
                                                href={appointment.googleMeetLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                            >
                                                <Video className="h-3 w-3" /> Open Meet
                                            </a>
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
            </DialogContent>
        </Dialog>
    );
}
