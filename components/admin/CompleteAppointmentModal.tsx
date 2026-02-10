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
    FileText,
    CheckCircle2,
    Copy
} from 'lucide-react';
import { format } from 'date-fns';
import { completeAppointment } from '@/lib/actions/admin-appointment';
import { toast } from 'sonner';

interface CompleteAppointmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: any;
    onSuccess: () => void;
}

export function CompleteAppointmentModal({
    open,
    onOpenChange,
    appointment,
    onSuccess
}: CompleteAppointmentModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [treatmentReport, setTreatmentReport] = useState('');
    const [successData, setSuccessData] = useState<{ token: string } | null>(null);

    const handleSuccessClose = () => {
        setSuccessData(null);
        onOpenChange(false);
        onSuccess();
    };

    const copyLink = () => {
        if (successData?.token) {
            const link = `${window.location.origin}/review?token=${successData.token}`;
            navigator.clipboard.writeText(link);
            toast.success('Review link copied!');
        }
    };

    const handleComplete = async () => {
        if (!treatmentReport.trim()) {
            toast.error('Please provide a treatment report');
            return;
        }

        setIsLoading(true);
        try {
            const result = await completeAppointment(appointment.id, treatmentReport);
            if (result.success) {
                // Determine if we have a token (we should)
                // The server action returns { success: true, reviewToken: string }
                const token = (result as any).reviewToken;

                if (token) {
                    setSuccessData({ token });
                } else {
                    toast.success('Appointment marked as complete.');
                    onSuccess();
                    onOpenChange(false);
                }
                setTreatmentReport('');
            } else {
                toast.error(result.error || 'Failed to complete appointment');
            }
        } catch (error) {
            toast.error('Failed to complete appointment');
        } finally {
            setIsLoading(false);
        }
    };

    if (successData) {
        return (
            <Dialog open={open} onOpenChange={(open) => !open && handleSuccessClose()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex flex-col items-center gap-2 text-center">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                            <span>Appointment Completed!</span>
                        </DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            The appointment has been marked as complete and the treatment report has been sent.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-muted p-4 rounded-lg space-y-3 my-2">
                        <Label>Review Link for Patient</Label>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-background border rounded px-3 py-2 text-sm text-muted-foreground truncate">
                                {`${typeof window !== 'undefined' ? window.location.origin : ''}/review?token=${successData.token}`}
                            </div>
                            <Button size="icon" variant="outline" onClick={copyLink}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Share this link with the patient to collect their feedback.
                        </p>
                    </div>

                    <DialogFooter className="sm:justify-center">
                        <Button onClick={handleSuccessClose} className="w-full sm:w-auto">
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    if (!appointment) return null;

    const { patient, product } = appointment;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Complete Appointment
                    </DialogTitle>
                    <DialogDescription>
                        Fill in the treatment report to complete this appointment
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

                    {/* Service Details */}
                    <div className="bg-[#0F665C]/10 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="h-4 w-4 text-[#0F665C]" />
                            <span className="font-medium text-blue-900">{product?.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-blue-700 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>
                                {format(new Date(appointment.appointmentDate), 'EEEE, MMMM d, yyyy')} at {appointment.timeSlot}
                            </span>
                        </div>
                    </div>

                    <Separator />

                    {/* Treatment Report Form */}
                    <div>
                        <Label htmlFor="report" className="flex items-center gap-2 mb-3">
                            <FileText className="h-4 w-4" />
                            Treatment Report <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="report"
                            placeholder="Enter treatment notes, observations, recommendations, and follow-up instructions for the patient..."
                            value={treatmentReport}
                            onChange={(e) => setTreatmentReport(e.target.value)}
                            rows={6}
                            className="resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            This report will be sent to the patient's dashboard for their records.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleComplete}
                        disabled={isLoading || !treatmentReport.trim()}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isLoading ? 'Completing...' : 'Complete & Send Report'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
