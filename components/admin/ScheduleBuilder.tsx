'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toggleScheduleSlot } from '@/lib/actions/admin-schedule';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DAYS = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const TIME_SLOTS = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export function ScheduleBuilder({ initialSlots }: { initialSlots: any[] }) {
    const [loading, setLoading] = useState<string | null>(null);

    const isSlotActive = (day: number, time: string) => {
        return initialSlots.some(s => s.dayOfWeek === day && s.timeSlot === time && s.isActive);
    };

    const handleToggle = async (day: number, time: string) => {
        const currentState = isSlotActive(day, time);
        const key = `${day}-${time}`;
        setLoading(key);

        try {
            await toggleScheduleSlot(day, time, !currentState);
            toast.success(`${DAYS[day]} ${time} updated`);
        } catch (error) {
            toast.error('Failed to update slot');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="p-2 border bg-gray-50 text-left text-sm font-medium">Time</th>
                        {DAYS.map((day, idx) => (
                            <th key={day} className="p-2 border bg-gray-50 text-center text-sm font-medium">
                                {day.substring(0, 3)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {TIME_SLOTS.map((time) => (
                        <tr key={time}>
                            <td className="p-2 border font-medium text-sm">{time}</td>
                            {DAYS.map((_, dayIdx) => {
                                const active = isSlotActive(dayIdx, time);
                                const key = `${dayIdx}-${time}`;
                                return (
                                    <td key={key} className="p-2 border text-center relative">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={active}
                                                onCheckedChange={() => handleToggle(dayIdx, time)}
                                                disabled={loading === key}
                                                className={cn(
                                                    "h-5 w-5",
                                                    active ? "border-[#008E7E] bg-[#008E7E]" : ""
                                                )}
                                            />
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
