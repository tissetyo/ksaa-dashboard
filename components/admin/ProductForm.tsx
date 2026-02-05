'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createProduct, updateProduct } from '@/lib/actions/admin-product';

export function ProductForm({ initialData }: { initialData?: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const isEditing = !!initialData;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            if (isEditing) {
                await updateProduct(initialData.id, data);
                toast.success('Product updated successfully');
            } else {
                await createProduct(data);
                toast.success('Product created successfully');
            }
            router.push('/admin/products');
            router.refresh();
        } catch (error) {
            toast.error(isEditing ? 'Failed to update product' : 'Failed to create product');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="space-y-2">
                <Label htmlFor="name">Product/Service Name</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={initialData?.name}
                    placeholder="e.g., STEMCARE facial"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    defaultValue={initialData?.description}
                    placeholder="Describe the service..."
                    required
                    rows={5}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="priceMYR">Price (MYR)</Label>
                    <Input
                        id="priceMYR"
                        name="priceMYR"
                        type="number"
                        step="0.01"
                        defaultValue={initialData?.priceMYR}
                        placeholder="0.00"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="depositPercentage">Deposit Percentage (%)</Label>
                    <Input
                        id="depositPercentage"
                        name="depositPercentage"
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={initialData?.depositPercentage ?? 30}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="durationMinutes">Duration (Minutes)</Label>
                    <Input
                        id="durationMinutes"
                        name="durationMinutes"
                        type="number"
                        defaultValue={initialData?.durationMinutes ?? 60}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="quotaPerDay">Daily Quota (Appointments)</Label>
                    <Input
                        id="quotaPerDay"
                        name="quotaPerDay"
                        type="number"
                        defaultValue={initialData?.quotaPerDay ?? 5}
                        required
                    />
                </div>

                {isEditing && (
                    <div className="space-y-2">
                        <Label htmlFor="isActive">Status</Label>
                        <Select name="isActive" defaultValue={initialData?.isActive ? 'true' : 'false'}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
                </Button>
            </div>
        </form>
    );
}
