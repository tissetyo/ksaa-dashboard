'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { addDateOverride } from '@/lib/actions/admin-schedule';
import { toast } from 'sonner';

export function DateOverrideForm() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            await addDateOverride(data);
            toast.success('Date override added');
            e.currentTarget.reset();
        } catch (error) {
            toast.error('Failed to add override');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="specificDate">Select Date</Label>
                    <Input id="specificDate" name="specificDate" type="date" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="isClosed">Status</Label>
                    <Select name="isClosed" defaultValue="true">
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">Closed</SelectItem>
                            <SelectItem value="false">Custom Hours</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="reason">Reason (Internal Note)</Label>
                <Input id="reason" name="reason" placeholder="e.g., Public Holiday, Staff Training" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Add Date Override'}
            </Button>
        </form>
    );
}
