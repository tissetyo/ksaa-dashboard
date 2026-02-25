'use client';

import { useState } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    startOfWeek,
    endOfWeek,
    parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminData } from '@/components/providers/AdminDataProvider';
import { useRouter } from 'next/navigation';
import { ConfirmAppointmentModal } from './ConfirmAppointmentModal';
import { CompleteAppointmentModal } from './CompleteAppointmentModal';
import { CancelAppointmentModal } from './CancelAppointmentModal';
import { PatientHistoryModal } from './PatientHistoryModal';
import { AppointmentDetailModal } from './AppointmentDetailModal';

interface AdminCalendarViewProps {
    appointments: any[];
}

export function AdminCalendarView({ appointments }: AdminCalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const router = useRouter();
    const { refresh } = useAdminData();

    // Modal states
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [selectedPatientName, setSelectedPatientName] = useState<string>('');

    const handleConfirmClick = (apt: any) => {
        setSelectedAppointment(apt);
        setConfirmModalOpen(true);
    };

    const handleCompleteClick = (apt: any) => {
        setSelectedAppointment(apt);
        setCompleteModalOpen(true);
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

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    // Calendar logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start week on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "MMMM yyyy";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Group appointments by date
    const appointmentsByDate = appointments.reduce((acc: any, apt: any) => {
        const dateStr = format(new Date(apt.appointmentDate), 'yyyy-MM-dd');
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(apt);
        return acc;
    }, {});

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            case 'NO_SHOW': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm flex flex-col h-[700px]">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-bold">{format(currentDate, dateFormat)}</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                        Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 border-b bg-gray-50/50">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days grid */}
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-7 h-full min-h-[600px] auto-rows-[120px] divide-x divide-y border-t-0">
                    {days.map((day, i) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayEvents = appointmentsByDate[dateStr] || [];
                        const isToday = isSameDay(day, new Date());
                        const isCurrentMonth = isSameMonth(day, currentDate);

                        // Sort events by time
                        const sortedEvents = [...dayEvents].sort((a, b) => {
                            return a.timeSlot.localeCompare(b.timeSlot);
                        });

                        return (
                            <div
                                key={day.toString()}
                                className={`min-h-[120px] p-1.5 flex flex-col transition-colors ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'bg-white'
                                    } hover:bg-gray-50`}
                            >
                                <div className="flex justify-end mb-1">
                                    <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[#008E7E] text-white' : ''
                                        }`}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                                <div className="space-y-1 overflow-y-auto flex-1 no-scrollbar">
                                    {sortedEvents.map((apt: any) => (
                                        <button
                                            key={apt.id}
                                            onClick={() => {
                                                setSelectedAppointment(apt);
                                                setDetailModalOpen(true);
                                            }}
                                            className={`w-full text-left px-1.5 py-1 text-[10px] sm:text-xs rounded border truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 ${getStatusColor(apt.status)}`}
                                            title={`${apt.timeSlot} - ${apt.patient.fullName || 'Unnamed'}`}
                                        >
                                            <span className="font-semibold whitespace-nowrap">{apt.timeSlot}</span>
                                            <span className="truncate">{apt.patient.fullName || 'Unnamed'}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="p-3 border-t bg-gray-50 flex flex-wrap gap-4 text-xs justify-center text-gray-500">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div> Pending</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div> Confirmed</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-400"></div> Completed</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"></div> Cancelled</div>
            </div>

            {/* Modals */}
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
            />
            <CancelAppointmentModal
                open={cancelModalOpen}
                onOpenChange={setCancelModalOpen}
                appointment={selectedAppointment}
                onSuccess={handleSuccess}
            />
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
        </div>
    );
}
