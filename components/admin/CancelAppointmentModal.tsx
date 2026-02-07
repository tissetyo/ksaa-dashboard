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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    User,
    Phone,
    Mail,
    Calendar,
    Clock,
    AlertTriangle,
    XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { cancelAppointment } from '@/lib/actions/admin-appointment';
import { toast } from 'sonner';

interface CancelAppointmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: any;
    onSuccess: () => void;
}

export function CancelAppointmentModal({
    open,
    onOpenChange,
    appointment,
    onSuccess
}: CancelAppointmentModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');

    if (!appointment) return null;

    const { patient, product } = appointment;

    const handleCancel = async () => {
        if (!cancellationReason.trim()) {
            toast.error('Please provide a cancellation reason');
            return;
        }

        setIsLoading(true);
        try {
            const result = await cancelAppointment(appointment.id, cancellationReason);
            if (result.success) {
                toast.success('Appointment cancelled successfully');
                onSuccess();
                onOpenChange(false);
                setCancellationReason('');
            } else {
                toast.error(result.error || 'Failed to cancel appointment');
            }
        } catch (error) {
            toast.error('Failed to cancel appointment');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-5 w-5" />
                        Cancel Appointment
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. Please provide a reason.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Warning Banner */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-800">
                                You are about to cancel this appointment
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                                The patient will be notified about this cancellation.
                            </p>
                        </div>
                    </div>

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

                    {/* Appointment Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="h-4 w-4 text-gray-600" />
                            <span className="font-medium">{product?.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>
                                {format(new Date(appointment.appointmentDate), 'EEEE, MMMM d, yyyy')} at {appointment.timeSlot}
                            </span>
                        </div>
                    </div>

                    <Separator />

                    {/* Cancellation Reason Form */}
                    <div>
                        <Label htmlFor="reason" className="flex items-center gap-2 mb-3">
                            Cancellation Reason <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder="Please explain why this appointment is being cancelled..."
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Keep Appointment
                    </Button>
                    <Button
                        onClick={handleCancel}
                        disabled={isLoading || !cancellationReason.trim()}
                        variant="destructive"
                    >
                        {isLoading ? 'Cancelling...' : 'Cancel Appointment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
