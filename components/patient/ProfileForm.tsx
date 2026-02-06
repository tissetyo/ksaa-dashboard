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
import { updatePatientProfile } from '@/lib/actions/patient';
import { BloodType, Salutation } from '@prisma/client';

export function ProfileForm({ initialData }: { initialData?: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            await updatePatientProfile(data);
            toast.success('Profile updated successfully');

            // If this is initial profile completion (no existing data), show onboarding
            if (!initialData?.dateOfBirth) {
                router.push('/dashboard?onboarding=true');
            } else {
                router.push('/profile');
            }
        } catch (error) {
            toast.error('Failed to update profile');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="salutation">Title</Label>
                        <Select name="salutation" defaultValue={initialData?.salutation}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select title" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(Salutation).map((sal) => (
                                    <SelectItem key={sal} value={sal}>
                                        {sal === 'MR' ? 'Mr.' :
                                            sal === 'MRS' ? 'Mrs.' :
                                                sal === 'MS' ? 'Ms.' :
                                                    sal === 'DR' ? 'Dr.' :
                                                        sal === 'PROF' ? 'Prof.' :
                                                            sal}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            defaultValue={initialData?.fullName}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            name="phone"
                            defaultValue={initialData?.phone}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                            id="age"
                            name="age"
                            type="number"
                            defaultValue={initialData?.age}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bloodType">Blood Type</Label>
                        <Select name="bloodType" defaultValue={initialData?.bloodType || 'UNKNOWN'}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select blood type" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(BloodType).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type.replace('_', ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                        id="address"
                        name="address"
                        defaultValue={initialData?.address}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Physical Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="heightCm">Height (cm)</Label>
                        <Input
                            id="heightCm"
                            name="heightCm"
                            type="number"
                            step="0.1"
                            defaultValue={initialData?.heightCm}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="weightKg">Weight (kg)</Label>
                        <Input
                            id="weightKg"
                            name="weightKg"
                            type="number"
                            step="0.1"
                            defaultValue={initialData?.weightKg}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="emergencyContactName">Contact Name</Label>
                        <Input
                            id="emergencyContactName"
                            name="emergencyContactName"
                            defaultValue={initialData?.emergencyContactName}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                        <Input
                            id="emergencyContactPhone"
                            name="emergencyContactPhone"
                            defaultValue={initialData?.emergencyContactPhone}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Medical History</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="medicalAllergies">Medical Allergies</Label>
                        <Textarea
                            id="medicalAllergies"
                            name="medicalAllergies"
                            defaultValue={initialData?.medicalAllergies}
                            placeholder="List any allergies..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="currentMedications">Current Medications</Label>
                        <Textarea
                            id="currentMedications"
                            name="currentMedications"
                            defaultValue={initialData?.currentMedications}
                            placeholder="List any medications you are currently taking..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="previousTreatments">Previous Treatments</Label>
                        <Textarea
                            id="previousTreatments"
                            name="previousTreatments"
                            defaultValue={initialData?.previousTreatments}
                            placeholder="List any major surgeries or treatments..."
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pb-12">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
}
