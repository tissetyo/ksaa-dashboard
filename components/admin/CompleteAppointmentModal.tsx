'use client';

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import {
    User,
    Phone,
    Mail,
    Calendar,
    Clock,
    FileText,
    CheckCircle2,
    Copy,
    Sparkles,
    Heart,
    Pill,
    MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
import { completeAppointment } from '@/lib/actions/admin-appointment';
import { toast } from 'sonner';

interface CompleteAppointmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: any;
    onSuccess: () => void;
    staffMembers?: any[];
    products?: any[]; // Available services for recommendation
}

export function CompleteAppointmentModal({
    open,
    onOpenChange,
    appointment,
    onSuccess,
    staffMembers = [],
    products = [],
}: CompleteAppointmentModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [treatmentReport, setTreatmentReport] = useState('');
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [otherStaffName, setOtherStaffName] = useState('');
    const [successData, setSuccessData] = useState<{ token: string } | null>(null);

    // Recommendation fields
    const [addRecommendation, setAddRecommendation] = useState(false);
    const [recType, setRecType] = useState<'existing' | 'custom'>('existing');
    const [recProductId, setRecProductId] = useState('');
    const [recCustomName, setRecCustomName] = useState('');
    const [recDate, setRecDate] = useState('');
    const [recNote, setRecNote] = useState('');

    // Reset ALL state when modal opens to prevent stale success screens
    useEffect(() => {
        if (open) {
            setSuccessData(null);
            setTreatmentReport('');
            setSelectedStaffId('');
            setOtherStaffName('');
            setAddRecommendation(false);
            setRecType('existing');
            setRecProductId('');
            setRecCustomName('');
            setRecDate('');
            setRecNote('');
            setIsLoading(false);
        }
    }, [open]);

    const handleSuccessClose = () => {
        setSuccessData(null);
        setTreatmentReport('');
        setSelectedStaffId('');
        setOtherStaffName('');
        setAddRecommendation(false);
        setRecProductId('');
        setRecCustomName('');
        setRecDate('');
        setRecNote('');
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
        if (!selectedStaffId) {
            toast.error('Please select an attending staff member');
            return;
        }
        if (selectedStaffId === 'OTHER' && !otherStaffName.trim()) {
            toast.error('Please enter the staff name');
            return;
        }

        setIsLoading(true);
        try {
            const recommendation = addRecommendation ? {
                productId: recType === 'existing' ? recProductId : undefined,
                customServiceName: recType === 'custom' ? recCustomName : undefined,
                scheduledDate: recDate || undefined,
                staffNote: recNote || undefined,
            } : undefined;

            const result = await completeAppointment(
                appointment.id,
                treatmentReport,
                selectedStaffId === 'OTHER' ? undefined : selectedStaffId,
                selectedStaffId === 'OTHER' ? otherStaffName : undefined,
                recommendation,
            );

            if (result.success) {
                const token = (result as any).reviewToken;
                if (token) {
                    setSuccessData({ token });
                } else {
                    toast.success('Appointment marked as complete.');
                    handleSuccessClose();
                }
            } else {
                toast.error((result as any).error || 'Failed to complete appointment');
            }
        } catch {
            toast.error('Failed to complete appointment');
        } finally {
            setIsLoading(false);
        }
    };

    // SUCCESS SCREEN — must be after all hooks
    if (successData) {
        return (
            <Dialog open={open} onOpenChange={(open) => !open && handleSuccessClose()}>
                <DialogContent className="sm:max-w-lg">
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
                            <div className="flex-1 min-w-0 bg-background border rounded px-3 py-2 text-sm text-muted-foreground truncate">
                                /review?token=...{successData.token.slice(-8)}
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
                        <Button onClick={handleSuccessClose} className="w-full sm:w-auto bg-[#008E7E] hover:bg-[#008E7E]/90">
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
            <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Complete Appointment
                    </DialogTitle>
                    <DialogDescription>
                        Fill in the treatment report to complete this appointment
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Patient Details */}
                    <div>
                        <h4 className="font-semibold text-xs text-gray-500 uppercase mb-3">Patient Details</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{patient?.fullName || 'Unknown'}</span>
                                {patient?.title && <Badge variant="outline">{patient.title}</Badge>}
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

                    {/* Service Details */}
                    <div className="bg-[#008E7E]/10 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-1">
                            <Calendar className="h-4 w-4 text-[#008E7E]" />
                            <span className="font-medium text-[#008E7E]">{product?.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[#008E7E]/80">
                            <Clock className="h-4 w-4" />
                            <span>{format(new Date(appointment.appointmentDate), 'EEEE, MMMM d, yyyy')} at {appointment.timeSlot}</span>
                        </div>
                    </div>

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

                    {/* Consultation Address */}
                    {appointment.consultationAddress && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-xs text-gray-500 uppercase mb-3">Location</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                        <p className="text-sm">{appointment.consultationAddress}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Patient Notes */}
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

                    <Separator />

                    {/* Treatment Report */}
                    <div>
                        <Label htmlFor="report" className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4" />
                            Treatment Report <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="report"
                            placeholder="Enter treatment notes, observations, recommendations, and follow-up instructions for the patient..."
                            value={treatmentReport}
                            onChange={(e) => setTreatmentReport(e.target.value)}
                            rows={5}
                            className="resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">This report will be sent to the patient's dashboard for their records.</p>
                    </div>

                    {/* Attending Staff */}
                    <div>
                        <Label htmlFor="staff" className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4" />
                            Attending Staff <span className="text-red-500">*</span>
                        </Label>
                        <select
                            id="staff"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={selectedStaffId}
                            onChange={(e) => setSelectedStaffId(e.target.value)}
                        >
                            <option value="">Select Staff Member</option>
                            {staffMembers.map((staff: any) => (
                                <option key={staff.id} value={staff.id}>
                                    {staff.fullName} ({staff.staffCode})
                                </option>
                            ))}
                            <option value="OTHER">Other (enter name below)</option>
                        </select>
                        {selectedStaffId === 'OTHER' && (
                            <Input
                                className="mt-2"
                                placeholder="Enter attending staff name"
                                value={otherStaffName}
                                onChange={e => setOtherStaffName(e.target.value)}
                            />
                        )}
                    </div>

                    <Separator />

                    {/* Service Recommendation */}
                    <div>
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-orange-500" />
                                Recommend a Follow-up Service?
                            </Label>
                            <button
                                type="button"
                                onClick={() => setAddRecommendation(v => !v)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${addRecommendation ? 'bg-[#008E7E]' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${addRecommendation ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {addRecommendation && (
                            <div className="mt-3 border rounded-xl p-4 bg-orange-50 space-y-3">
                                {/* Type toggle */}
                                <div className="flex gap-2">
                                    <button onClick={() => setRecType('existing')} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${recType === 'existing' ? 'bg-[#008E7E] text-white border-[#008E7E]' : 'bg-white text-gray-600 border-gray-200'}`}>
                                        From Services
                                    </button>
                                    <button onClick={() => setRecType('custom')} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${recType === 'custom' ? 'bg-[#008E7E] text-white border-[#008E7E]' : 'bg-white text-gray-600 border-gray-200'}`}>
                                        Custom Service
                                    </button>
                                </div>

                                {recType === 'existing' ? (
                                    <div>
                                        <Label className="text-xs">Select Service</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                                            value={recProductId}
                                            onChange={e => setRecProductId(e.target.value)}
                                        >
                                            <option value="">Select a service...</option>
                                            {products.map((p: any) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <Label className="text-xs">Custom Service Name</Label>
                                        <Input
                                            className="mt-1"
                                            placeholder="e.g. Follow-up Blood Test"
                                            value={recCustomName}
                                            onChange={e => setRecCustomName(e.target.value)}
                                        />
                                    </div>
                                )}

                                <div>
                                    <Label className="text-xs">Suggested Date (optional)</Label>
                                    <Input
                                        type="date"
                                        className="mt-1"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={recDate}
                                        onChange={e => setRecDate(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Leave empty — patient will confirm the date when booking.</p>
                                </div>

                                <div>
                                    <Label className="text-xs">Note to Patient (optional)</Label>
                                    <Textarea
                                        className="mt-1 resize-none"
                                        rows={2}
                                        placeholder="e.g. Doctor recommends a follow-up in 3 weeks"
                                        value={recNote}
                                        onChange={e => setRecNote(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleComplete}
                        disabled={isLoading || !treatmentReport.trim() || !selectedStaffId}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isLoading ? 'Completing...' : 'Complete & Send Report'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
