'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Clock, CheckCircle, XCircle, History, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAdminData } from '@/components/providers/AdminDataProvider';

// Import modals
import { ConfirmAppointmentModal } from './ConfirmAppointmentModal';
import { CompleteAppointmentModal } from './CompleteAppointmentModal';
import { CancelAppointmentModal } from './CancelAppointmentModal';
import { PatientHistoryModal } from './PatientHistoryModal';
import { AppointmentDetailModal } from './AppointmentDetailModal';

interface AppointmentTableProps {
    appointments: any[];
    staffMembers?: any[];
    products?: any[];
}

export function AppointmentTable({ appointments, staffMembers = [], products = [] }: AppointmentTableProps) {
    const router = useRouter();
    const { refresh } = useAdminData();
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

    // Modal states
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [selectedPatientName, setSelectedPatientName] = useState<string>('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedAppointments = appointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleConfirmClick = (apt: any) => {
        setSelectedAppointment(apt);
        setConfirmModalOpen(true);
    };

    const handleCompleteClick = (apt: any) => {
        setSelectedAppointment(apt);
        setCompleteModalOpen(true);
    };

    const handleCancelClick = (apt: any) => {
        setSelectedAppointment(apt);
        setCancelModalOpen(true);
    };

    const handleHistoryClick = (apt: any) => {
        setSelectedPatientId(apt.patientId);
        setSelectedPatientName(apt.patient?.fullName || 'Unknown');
        setHistoryModalOpen(true);
    };

    const handleSuccess = (apt?: any) => {
        router.refresh();
        refresh(); // Refresh client-side cache
        if (apt) {
            const updatedApt = { ...apt };
            if (confirmModalOpen) updatedApt.status = 'CONFIRMED';
            if (completeModalOpen) updatedApt.status = 'COMPLETED';
            if (cancelModalOpen) updatedApt.status = 'CANCELLED';
            setSelectedAppointment(updatedApt);
            setDetailModalOpen(true);
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
        <>
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {appointments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    No appointments found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedAppointments.map((apt) => (
                                <TableRow
                                    key={apt.id}
                                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => {
                                        setSelectedAppointment(apt);
                                        setDetailModalOpen(true);
                                    }}
                                >
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{format(new Date(apt.appointmentDate), 'dd MMM yyyy')}</span>
                                            <span className="text-xs text-gray-400 flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {apt.timeSlot}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{apt.patient?.fullName || 'Unknown'}</span>
                                            <span className="text-xs text-gray-400">{apt.patient?.phone || 'No phone'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">{apt.product?.name || 'Unknown'}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">RM {apt.paidAmountMYR?.toFixed(2) || '0.00'}</span>
                                            <span className="text-[10px] uppercase text-gray-400">
                                                {apt.balanceAmountMYR > 0 ? `Bal: RM ${apt.balanceAmountMYR.toFixed(2)}` : 'Full Paid'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => { setSelectedAppointment(apt); setDetailModalOpen(true); }}>
                                                    <Eye className="mr-2 h-4 w-4 text-[#008E7E]" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {apt.status === 'PENDING' && (
                                                    <DropdownMenuItem onClick={() => handleConfirmClick(apt)}>
                                                        <CheckCircle className="mr-2 h-4 w-4 text-[#008E7E]" />
                                                        Confirm Slot
                                                    </DropdownMenuItem>
                                                )}
                                                {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                                                    <DropdownMenuItem onClick={() => handleCompleteClick(apt)}>
                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                        Mark Completed
                                                    </DropdownMenuItem>
                                                )}
                                                {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                                                    <DropdownMenuItem onClick={() => handleCancelClick(apt)} className="text-red-600">
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Cancel
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleHistoryClick(apt)}>
                                                    <History className="mr-2 h-4 w-4" />
                                                    View Patient History
                                                </DropdownMenuItem>
                                                {apt.status === 'COMPLETED' && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => {
                                                            if (apt.reviewToken?.token) {
                                                                const link = `${window.location.origin}/review?token=${apt.reviewToken.token}`;
                                                                navigator.clipboard.writeText(link);
                                                                toast.success('Review link copied to clipboard!');
                                                            } else {
                                                                toast.error('No review link available. Please complete appointment first.');
                                                            }
                                                        }}>
                                                            <CheckCircle className="mr-2 h-4 w-4 text-purple-600" />
                                                            Copy Review Link
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 py-3">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium text-gray-900">{startIndex + 1}</span> to <span className="font-medium text-gray-900">{Math.min(startIndex + ITEMS_PER_PAGE, appointments.length)}</span> of <span className="font-medium text-gray-900">{appointments.length}</span> results
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Appointment Modal */}
            <ConfirmAppointmentModal
                open={confirmModalOpen}
                onOpenChange={setConfirmModalOpen}
                appointment={selectedAppointment}
                onSuccess={handleSuccess}
            />

            <CompleteAppointmentModal
                open={completeModalOpen}
                onOpenChange={setCompleteModalOpen}
                appointment={selectedAppointment}
                onSuccess={handleSuccess}
                staffMembers={staffMembers}
                products={products}
            />

            {/* Cancel Appointment Modal */}
            <CancelAppointmentModal
                open={cancelModalOpen}
                onOpenChange={setCancelModalOpen}
                appointment={selectedAppointment}
                onSuccess={handleSuccess}
            />

            {/* Patient History Modal */}
            <PatientHistoryModal
                open={historyModalOpen}
                onOpenChange={setHistoryModalOpen}
                patientId={selectedPatientId}
                patientName={selectedPatientName}
            />

            <AppointmentDetailModal
                open={detailModalOpen}
                onOpenChange={setDetailModalOpen}
                appointment={selectedAppointment}
                onRefresh={handleSuccess}
                onConfirm={(apt) => {
                    setDetailModalOpen(false);
                    handleConfirmClick(apt);
                }}
                onComplete={(apt) => {
                    setDetailModalOpen(false);
                    handleCompleteClick(apt);
                }}
                onHistory={(patientId, patientName) => {
                    setDetailModalOpen(false);
                    setSelectedPatientId(patientId);
                    setSelectedPatientName(patientName);
                    setHistoryModalOpen(true);
                }}
            />
        </>
    );
}
