'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createProduct, updateProduct, deleteProduct } from '@/lib/actions/admin-product';
import { Trash2 } from 'lucide-react';

export function ProductForm({ initialData }: { initialData?: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFree, setIsFree] = useState(initialData?.isFree ?? false);
    const [showPrice, setShowPrice] = useState(initialData?.showPrice ?? true);
    const router = useRouter();
    const isEditing = !!initialData;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        // ... (keep existing handleSubmit logic)
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
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData?.id) return;
        setIsDeleting(true);
        try {
            await deleteProduct(initialData.id);
            toast.success('Product deleted successfully');
            // Navigate away immediately
            router.push('/admin/products');
        } catch (error) {
            toast.error('Failed to delete product');
            console.error(error);
            setIsDeleting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {/* ... (keep existing form fields) ... */}
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

            <div className="space-y-2">
                <Label htmlFor="imageUrl">Banner Image URL</Label>
                <Input
                    id="imageUrl"
                    name="imageUrl"
                    defaultValue={initialData?.imageUrl}
                    placeholder="https://example.com/image.jpg"
                />
            </div>

            <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                <Switch
                    id="isFree"
                    name="isFree"
                    checked={isFree}
                    onCheckedChange={setIsFree}
                />
                <div>
                    <Label htmlFor="isFree" className="cursor-pointer">Free Service</Label>
                    <p className="text-sm text-muted-foreground">This service will be offered at no cost</p>
                </div>
            </div>

            <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                <input type="hidden" name="showPrice" value={showPrice ? 'true' : 'false'} />
                <Switch
                    id="showPrice"
                    checked={showPrice}
                    onCheckedChange={setShowPrice}
                />
                <div>
                    <Label htmlFor="showPrice" className="cursor-pointer">Show Price to Patients</Label>
                    <p className="text-sm text-muted-foreground">Display the price on the patient-facing service cards</p>
                </div>
            </div>

            {!isFree && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="priceMYR">Price (MYR) *</Label>
                        <Input
                            id="priceMYR"
                            name="priceMYR"
                            type="number"
                            step="0.01"
                            defaultValue={initialData?.priceMYR}
                            placeholder="0.00"
                            required={!isFree}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="depositPercentage">Deposit Percentage (%) *</Label>
                        <Input
                            id="depositPercentage"
                            name="depositPercentage"
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={initialData?.depositPercentage ?? 30}
                            required={!isFree}
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="flex justify-between items-center pt-4 border-t mt-8">
                {isEditing ? (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={isLoading || isDeleting}
                                className="gap-2"
                            >
                                {isDeleting ? (
                                    <>Deleting...</>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        Delete Product
                                    </>
                                )}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the product
                                    "{initialData.name}". If the product has any existing appointments,
                                    it will be deactivated instead of deleted to preserve history.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : (
                    <div></div> // Spacer for layout if not editing
                )}

                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading || isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading || isDeleting}>
                        {isLoading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
                    </Button>
                </div>
            </div>
        </form >
    );
}
