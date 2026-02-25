'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    User,
    Phone,
    Mail,
    Calendar,
    Clock,
    Video,
    MessageCircle,
    ExternalLink,
    CheckCircle,
    Heart,
    Pill,
    FileText,
    MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
import { confirmAppointment } from '@/lib/actions/admin-appointment';
import { toast } from 'sonner';

interface ConfirmAppointmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: any;
    onSuccess: () => void;
}

export function ConfirmAppointmentModal({
    open,
    onOpenChange,
    appointment,
    onSuccess
}: ConfirmAppointmentModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    if (!appointment) return null;

    const { patient, product } = appointment;
    const isConsultation = product?.name?.toLowerCase().includes('consultation');
    const consultationType = appointment.consultationType;
    const whatsappNumber = appointment.consultationPhone || patient?.phone;
    const meetEmail = appointment.consultationEmail || patient?.email;

    // Format WhatsApp link
    const formatWhatsAppLink = (phone: string) => {
        const cleaned = phone.replace(/\D/g, '');
        return `https://wa.me/${cleaned}`;
    };

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            const result = await confirmAppointment(appointment.id);
            if (result.success) {
                toast.success('Appointment confirmed successfully');
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to confirm appointment');
            }
        } catch (error) {
            toast.error('Failed to confirm appointment');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-[#008E7E]" />
                        Confirm Appointment
                    </DialogTitle>
                    <DialogDescription>
                        Review details and confirm this appointment slot
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2 overflow-y-auto flex-1 pr-1">
                    {/* Patient Details */}
                    <div>
                        <h4 className="font-semibold text-xs text-gray-500 uppercase mb-2">Patient</h4>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                            <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-gray-500" />
                                <span className="text-sm font-medium">{patient?.fullName}</span>
                                {patient?.title && <Badge variant="outline" className="text-xs py-0">{patient.title}</Badge>}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{patient?.phone || 'No phone'}</span>
                                <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{patient?.user?.email || 'No email'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Service Details */}
                    <div>
                        <h4 className="font-semibold text-xs text-gray-500 uppercase mb-2">Service</h4>
                        <div className="bg-[#008E7E]/10 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="h-3.5 w-3.5 text-[#008E7E]" />
                                <span className="text-sm font-medium text-[#008E7E]">{product?.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#008E7E]/80">
                                <Clock className="h-3 w-3" />
                                <span>{format(new Date(appointment.appointmentDate), 'EEE, MMM d, yyyy')} at {appointment.timeSlot}</span>
                            </div>
                            {isConsultation && (
                                <div className="flex items-center gap-2 text-xs mt-1">
                                    {appointment.consultationType === 'WHATSAPP_CALL' && <MessageCircle className="h-3 w-3 text-green-600" />}
                                    {appointment.consultationType === 'GOOGLE_MEET' && <Video className="h-3 w-3 text-blue-600" />}
                                    <span className="text-gray-600">{appointment.consultationType === 'WHATSAPP_CALL' ? 'WhatsApp Call' : appointment.consultationType === 'GOOGLE_MEET' ? 'Google Meet' : appointment.consultationType?.replace('_', ' ')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Health Information */}
                    {(appointment.healthCondition || appointment.onMedication) && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-xs text-gray-500 uppercase mb-2">Health</h4>
                                <div className="bg-red-50/50 rounded-lg p-3 space-y-2 text-sm">
                                    {appointment.healthCondition && (
                                        <div className="flex gap-2">
                                            <Heart className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                                            <span>{appointment.healthCondition}</span>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Pill className="h-3.5 w-3.5 text-orange-400 mt-0.5 shrink-0" />
                                        <span>Medication: {appointment.onMedication ? 'Yes' : 'No'}{appointment.medicationDetails ? ` — ${appointment.medicationDetails}` : ''}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Location */}
                    {appointment.consultationAddress && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-xs text-gray-500 uppercase mb-2">Location</h4>
                                <div className="bg-gray-50 rounded-lg p-3 flex gap-2 text-sm">
                                    <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                                    <span>{appointment.consultationAddress}</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Notes */}
                    {appointment.adminNotes && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-xs text-gray-500 uppercase mb-2">Notes</h4>
                                <div className="bg-amber-50/50 rounded-lg p-3 flex gap-2 text-sm">
                                    <FileText className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                                    <span>{appointment.adminNotes}</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Communication Links */}
                    {isConsultation && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-sm text-gray-500 uppercase mb-3">Communication</h4>
                                <div className="flex gap-3">
                                    {(consultationType === 'GOOGLE_MEET' || !consultationType) && meetEmail && (
                                        <Button variant="outline" className="flex-1" asChild>
                                            <a
                                                href={`https://meet.google.com/new`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Video className="mr-2 h-4 w-4 text-[#008E7E]" />
                                                Start Google Meet
                                                <ExternalLink className="ml-2 h-3 w-3" />
                                            </a>
                                        </Button>
                                    )}
                                    {whatsappNumber && (
                                        <Button variant="outline" className="flex-1" asChild>
                                            <a
                                                href={formatWhatsAppLink(whatsappNumber)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <MessageCircle className="mr-2 h-4 w-4 text-green-600" />
                                                WhatsApp
                                                <ExternalLink className="ml-2 h-3 w-3" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="bg-[#008E7E] hover:bg-[#0a4f47]"
                    >
                        {isLoading ? 'Confirming...' : 'Confirm Appointment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
