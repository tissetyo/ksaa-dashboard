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
    CheckCircle
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
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-[#0F665C]" />
                        Confirm Appointment
                    </DialogTitle>
                    <DialogDescription>
                        Review details and confirm this appointment slot
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Patient Details */}
                    <div>
                        <h4 className="font-semibold text-sm text-gray-500 uppercase mb-3">Patient Details</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{patient?.fullName || 'Unknown'}</span>
                                {patient?.title && <Badge variant="outline">{patient.title}</Badge>}
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span>{patient?.phone || 'No phone'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span>{patient?.user?.email || 'No email'}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Service Details */}
                    <div>
                        <h4 className="font-semibold text-sm text-gray-500 uppercase mb-3">Service Details</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{product?.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span>
                                    {format(new Date(appointment.appointmentDate), 'EEEE, MMMM d, yyyy')} at {appointment.timeSlot}
                                </span>
                            </div>
                            {consultationType && (
                                <div className="flex items-center gap-3">
                                    {consultationType === 'GOOGLE_MEET' ? (
                                        <Video className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <MessageCircle className="h-4 w-4 text-gray-500" />
                                    )}
                                    <Badge variant="secondary">
                                        {consultationType === 'GOOGLE_MEET' ? 'Google Meet' : 'WhatsApp Call'}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

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
                                                <Video className="mr-2 h-4 w-4 text-[#0F665C]" />
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
                        className="bg-[#0F665C] hover:bg-[#0a4f47]"
                    >
                        {isLoading ? 'Confirming...' : 'Confirm Appointment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
