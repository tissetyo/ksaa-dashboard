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
import { MoreHorizontal, Calendar, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { updateAppointmentStatus } from '@/lib/actions/admin-appointment';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function AppointmentTable({ appointments }: { appointments: any[] }) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleStatusUpdate = async (id: string, status: string) => {
        setLoading(id);
        try {
            await updateAppointmentStatus(id, status);
            toast.success(`Appointment marked as ${status.toLowerCase()}`);
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <Badge variant="secondary">Pending</Badge>;
            case 'CONFIRMED': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Confirmed</Badge>;
            case 'COMPLETED': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Completed</Badge>;
            case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
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
                        appointments.map((apt) => (
                            <TableRow key={apt.id}>
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
                                        <span className="font-medium text-sm">{apt.patient.fullName}</span>
                                        <span className="text-xs text-gray-400">{apt.patient.phone}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">{apt.product.name}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">RM {apt.paidAmountMYR.toFixed(2)}</span>
                                        <span className="text-[10px] uppercase text-gray-400">
                                            {apt.balanceAmountMYR > 0 ? `Bal: RM ${apt.balanceAmountMYR.toFixed(2)}` : 'Full Paid'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>{getStatusBadge(apt.status)}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading === apt.id}>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleStatusUpdate(apt.id, 'CONFIRMED')}>
                                                <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                                                Confirm Slot
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusUpdate(apt.id, 'COMPLETED')}>
                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                Mark Completed
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusUpdate(apt.id, 'CANCELLED')} className="text-red-600">
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Cancel
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>View Patient History</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
