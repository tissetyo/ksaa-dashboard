'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cancelAppointment } from '@/lib/actions/appointment';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';

interface CancelAppointmentButtonProps {
    appointmentId: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
}

export function CancelAppointmentButton({
    appointmentId,
    variant = 'outline',
    size = 'default',
    className
}: CancelAppointmentButtonProps) {
    const [isCancelling, setIsCancelling] = useState(false);
    const [open, setOpen] = useState(false);

    const handleCancel = async () => {
        setIsCancelling(true);
        try {
            await cancelAppointment(appointmentId);
            toast.success('Appointment cancelled successfully');
            setOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to cancel appointment');
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    className={className}
                    disabled={isCancelling}
                >
                    {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will cancel your appointment.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                        <Button variant="outline" type="button">Keep Appointment</Button>
                    </DialogClose>
                    <Button
                        onClick={handleCancel}
                        disabled={isCancelling}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isCancelling ? 'Cancelling...' : 'Yes, Cancel Appointment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
