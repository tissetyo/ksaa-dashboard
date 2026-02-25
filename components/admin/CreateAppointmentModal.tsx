'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { createAppointmentFromAdmin } from '@/lib/actions/admin-appointment';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CreateAppointmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patients: any[];
    products: any[];
}

export function CreateAppointmentModal({ open, onOpenChange, patients, products }: CreateAppointmentModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [patientId, setPatientId] = useState('');
    const [productId, setProductId] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [consultationType, setConsultationType] = useState('IN_PERSON');
    const [adminNotes, setAdminNotes] = useState('');

    const resetForm = () => {
        setPatientId('');
        setProductId('');
        setAppointmentDate('');
        setTimeSlot('');
        setConsultationType('IN_PERSON');
        setAdminNotes('');
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!patientId || !productId || !appointmentDate || !timeSlot) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createAppointmentFromAdmin({
                patientId,
                productId,
                appointmentDate: new Date(appointmentDate).toISOString(),
                timeSlot,
                consultationType: consultationType as any,
                adminNotes
            });

            if (result.success) {
                toast.success('Appointment created successfully!');
                resetForm();
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to create appointment');
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to generate time slots (9 AM to 5 PM)
    const generateTimeSlots = () => {
        const slots = [];
        for (let i = 9; i <= 17; i++) {
            const hour = i > 12 ? i - 12 : i;
            const ampm = i >= 12 ? 'PM' : 'AM';
            slots.push(`${hour}:00 ${ampm}`);
            if (i !== 17) slots.push(`${hour}:30 ${ampm}`); // Don't add 5:30 PM
        }
        return slots;
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) resetForm();
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Appointment</DialogTitle>
                    <DialogDescription>
                        Book a new appointment on behalf of a patient.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="patient">Patient <span className="text-red-500">*</span></Label>
                        <Select value={patientId} onValueChange={setPatientId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a patient" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {patients.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.fullName || 'Unnamed Patient'} - {p.phone || p.user?.email || 'No contact'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                            Don't see the patient? Create them from the Patients page first.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="service">Service <span className="text-red-500">*</span></Label>
                        <Select value={productId} onValueChange={setProductId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name} ({p.durationMinutes} mins)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                            <Input
                                id="date"
                                type="date"
                                value={appointmentDate}
                                onChange={(e) => setAppointmentDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timeSlot">Time Slot <span className="text-red-500">*</span></Label>
                            <Select value={timeSlot} onValueChange={setTimeSlot}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {generateTimeSlots().map((slot) => (
                                        <SelectItem key={slot} value={slot}>
                                            {slot}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="consultationType">Consultation Type</Label>
                        <Select value={consultationType} onValueChange={setConsultationType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="IN_PERSON">In Person</SelectItem>
                                <SelectItem value="GOOGLE_MEET">Google Meet</SelectItem>
                                <SelectItem value="WHATSAPP_CALL">WhatsApp Call</SelectItem>
                                <SelectItem value="HOME_VISIT">Home Visit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                        <Textarea
                            id="adminNotes"
                            placeholder="Any specific requests or requirements..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            className="resize-none h-20"
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-[#008E7E] hover:bg-[#0a4f47] text-white">
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create Booking'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
