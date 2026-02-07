'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export function StaffForm({ initialData }: { initialData?: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            isActive: formData.get('isActive') === 'on',
        };

        try {
            const url = initialData
                ? `/api/admin/staff/${initialData.id}`
                : '/api/admin/staff';

            const method = initialData ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save staff member');
            }

            const result = await response.json();

            if (!initialData && result.staffCode) {
                toast.success(`Staff created! Referral code: ${result.staffCode}`, {
                    duration: 5000,
                });
            } else {
                toast.success('Staff member updated successfully');
            }

            router.push('/admin/staff');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                        id="fullName"
                        name="fullName"
                        defaultValue={initialData?.fullName}
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={initialData?.email}
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={initialData?.phone}
                        disabled={isLoading}
                    />
                </div>

                {!initialData && (
                    <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            disabled={isLoading}
                            minLength={8}
                        />
                        <p className="text-sm text-muted-foreground">Minimum 8 characters</p>
                    </div>
                )}

                <div className="flex items-center space-x-2">
                    <Switch
                        id="isActive"
                        name="isActive"
                        defaultChecked={initialData?.isActive ?? true}
                        disabled={isLoading}
                    />
                    <Label htmlFor="isActive">Active</Label>
                </div>

                {initialData?.staffCode && (
                    <div className="p-4 bg-[#0F665C]/10 dark:bg-blue-950 rounded-lg">
                        <p className="text-sm font-medium">Referral Code</p>
                        <p className="text-2xl font-mono font-bold text-[#0F665C]">{initialData.staffCode}</p>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : initialData ? 'Update Staff' : 'Create Staff'}
                </Button>
            </div>
        </form>
    );
}
