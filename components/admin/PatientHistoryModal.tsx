'use client';

import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    User,
    Phone,
    Mail,
    Calendar,
    Clock,
    MapPin,
    Droplet,
    Ruler,
    Scale,
    FileText,
    History
} from 'lucide-react';
import { format } from 'date-fns';
import { getPatientHistory } from '@/lib/actions/admin-appointment';

interface PatientHistoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: string;
    patientName: string;
}

export function PatientHistoryModal({
    open,
    onOpenChange,
    patientId,
    patientName
}: PatientHistoryModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [patient, setPatient] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);

    useEffect(() => {
        if (open && patientId) {
            loadPatientHistory();
        }
    }, [open, patientId]);

    const loadPatientHistory = async () => {
        setIsLoading(true);
        try {
            const result = await getPatientHistory(patientId);
            if (result.success) {
                setPatient(result.patient);
                setAppointments(result.appointments || []);
            }
        } catch (error) {
            console.error('Failed to load patient history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <Badge variant="secondary">Pending</Badge>;
            case 'CONFIRMED': return <Badge className="bg-[#008E7E]/20 text-blue-700 hover:bg-[#008E7E]/20 border-none">Confirmed</Badge>;
            case 'COMPLETED': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Completed</Badge>;
            case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-gray-600" />
                        Patient History
                    </DialogTitle>
                    <DialogDescription>
                        View profile and service history for {patientName}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    {isLoading ? (
                        <div className="py-10 text-center text-gray-500">
                            Loading patient history...
                        </div>
                    ) : (
                        <div className="space-y-6 py-4">
                            {/* Patient Profile */}
                            <div>
                                <h4 className="font-semibold text-sm text-gray-500 uppercase mb-3 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Patient Profile
                                </h4>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Full Name</p>
                                                <p className="font-medium">{patient?.title} {patient?.fullName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Phone</p>
                                                <p className="font-medium">{patient?.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Email</p>
                                                <p className="font-medium">{patient?.user?.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Age</p>
                                                <p className="font-medium">{patient?.age || 'N/A'} years</p>
                                            </div>
                                        </div>
                                    </div>

                                    {patient?.address && (
                                        <div className="flex items-start gap-3 pt-2 border-t">
                                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500">Address</p>
                                                <p className="font-medium">{patient.address}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Medical Info */}
                                    <div className="pt-2 border-t">
                                        <p className="text-xs text-gray-500 mb-2">Medical Information</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="flex items-center gap-2">
                                                <Droplet className="h-4 w-4 text-red-500" />
                                                <span className="text-sm">{patient?.bloodType || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Ruler className="h-4 w-4 text-blue-500" />
                                                <span className="text-sm">{patient?.height ? `${patient.height} cm` : 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Scale className="h-4 w-4 text-green-500" />
                                                <span className="text-sm">{patient?.weight ? `${patient.weight} kg` : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Service History */}
                            <div>
                                <h4 className="font-semibold text-sm text-gray-500 uppercase mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Service History ({appointments.length})
                                </h4>

                                {appointments.length === 0 ? (
                                    <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                                        No service history found
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {appointments.map((apt: any) => (
                                            <div key={apt.id} className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium">{apt.product?.name}</p>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{format(new Date(apt.appointmentDate), 'MMM d, yyyy')}</span>
                                                            <Clock className="h-3 w-3 ml-2" />
                                                            <span>{apt.timeSlot}</span>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(apt.status)}
                                                </div>

                                                {/* Show treatment report if completed */}
                                                {apt.status === 'COMPLETED' && apt.treatmentReport && (
                                                    <div className="mt-3 pt-3 border-t">
                                                        <p className="text-xs text-gray-500 mb-1">Treatment Report</p>
                                                        <p className="text-sm text-gray-700">{apt.treatmentReport}</p>
                                                    </div>
                                                )}

                                                {/* Show cancellation reason if cancelled */}
                                                {apt.status === 'CANCELLED' && apt.cancellationReason && (
                                                    <div className="mt-3 pt-3 border-t">
                                                        <p className="text-xs text-red-500 mb-1">Cancellation Reason</p>
                                                        <p className="text-sm text-gray-700">{apt.cancellationReason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
