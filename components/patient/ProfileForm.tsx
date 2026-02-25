'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { updatePatientProfile } from '@/lib/actions/patient';
import { BloodType, Salutation } from '@prisma/client';
import { ChevronDown, ChevronUp, Home, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileFormProps {
    initialData?: any;
    services?: { id: string; name: string }[];
    showAddress?: boolean; // force open address section (e.g. for home visit)
}

const SECTION_STYLE = "bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4";
const SECTION_TITLE = "font-bold text-gray-900 text-base border-b border-gray-100 pb-3 mb-1 uppercase tracking-wide text-sm";

export function ProfileForm({ initialData, services = [], showAddress = false }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [addressOpen, setAddressOpen] = useState(showAddress || !!initialData?.homeAddress);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        try {
            await updatePatientProfile(data);
            toast.success('Profile updated successfully');
            if (!initialData?.fullName) {
                router.push('/dashboard?onboarding=true');
            } else {
                router.push('/profile');
            }
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── Personal Information ───────────────── */}
            <div className={SECTION_STYLE}>
                <h3 className={SECTION_TITLE}>Personal Information</h3>

                {/* Row: Title + Full Name */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label>Title / Salutation</Label>
                        <Select name="salutation" defaultValue={initialData?.salutation}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                {Object.values(Salutation).map(sal => (
                                    <SelectItem key={sal} value={sal}>
                                        {sal === 'MR' ? 'Mr.' : sal === 'MRS' ? 'Mrs.' : sal === 'MS' ? 'Ms.'
                                            : sal === 'DR' ? 'Dr.' : sal === 'PROF' ? 'Prof.' : sal === 'DATO' ? 'Dato\''
                                                : sal === 'DATIN' ? 'Datin' : sal}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                        <Label>Full Name <span className="text-red-500">*</span></Label>
                        <Input name="fullName" defaultValue={initialData?.fullName} required placeholder="As per IC / Passport" />
                    </div>
                </div>

                {/* Row: IC + Place of Birth */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>IC / Passport No.</Label>
                        <Input name="icNumber" defaultValue={initialData?.icNumber} placeholder="e.g. 900101-14-1234" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Place of Birth</Label>
                        <Input name="placeOfBirth" defaultValue={initialData?.placeOfBirth} placeholder="e.g. Kuala Lumpur" />
                    </div>
                </div>

                {/* Row: Date of Birth + Nationality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Date of Birth</Label>
                        <Input
                            name="dateOfBirth"
                            type="date"
                            defaultValue={initialData?.dateOfBirth
                                ? new Date(initialData.dateOfBirth).toISOString().split('T')[0]
                                : ''}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Nationality</Label>
                        <Input name="nationality" defaultValue={initialData?.nationality} placeholder="e.g. Malaysian" />
                    </div>
                </div>

                {/* Row: Phone + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Phone Number <span className="text-red-500">*</span></Label>
                        <Input name="phone" defaultValue={initialData?.phone} required placeholder="+60123456789" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Marital Status</Label>
                        <Select name="maritalStatus" defaultValue={initialData?.maritalStatus || ''}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                {['Single', 'Married', 'Divorced', 'Widowed'].map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Row: Gender + Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Gender</Label>
                        <div className="flex gap-3">
                            {['Male', 'Female'].map(g => (
                                <label key={g} className={cn(
                                    'flex-1 flex items-center justify-center gap-2 border-2 rounded-xl py-2.5 cursor-pointer text-sm font-medium transition-all',
                                    initialData?.gender === g
                                        ? 'border-[#008E7E] bg-[#008E7E]/5 text-[#008E7E]'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                )}>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value={g}
                                        defaultChecked={initialData?.gender === g}
                                        className="sr-only"
                                    />
                                    {g}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Country</Label>
                        <Input name="country" defaultValue={initialData?.country || 'Malaysia'} placeholder="e.g. Malaysia" />
                    </div>
                </div>
            </div>

            {/* ── Physical Details ───────────────────── */}
            <div className={SECTION_STYLE}>
                <h3 className={SECTION_TITLE}>Physical Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label>Blood Type</Label>
                        <Select name="bloodType" defaultValue={initialData?.bloodType || 'UNKNOWN'}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                {Object.values(BloodType).map(t => (
                                    <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Height (cm)</Label>
                        <Input name="heightCm" type="number" step="0.1" defaultValue={initialData?.heightCm} placeholder="e.g. 168" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Weight (kg)</Label>
                        <Input name="weightKg" type="number" step="0.1" defaultValue={initialData?.weightKg} placeholder="e.g. 65" />
                    </div>
                </div>
            </div>

            {/* ── Emergency Contact ──────────────────── */}
            <div className={SECTION_STYLE}>
                <h3 className={SECTION_TITLE}>Emergency Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Contact Name</Label>
                        <Input name="emergencyContactName" defaultValue={initialData?.emergencyContactName} placeholder="Full name" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Contact Phone</Label>
                        <Input name="emergencyContactPhone" defaultValue={initialData?.emergencyContactPhone} placeholder="+60123456789" />
                    </div>
                </div>
            </div>

            {/* ── Address (collapsible) ─────────────── */}
            <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                    type="button"
                    className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors"
                    onClick={() => setAddressOpen(o => !o)}
                >
                    <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-[#008E7E]" />
                        <span className="font-bold text-sm text-gray-900 uppercase tracking-wide">Home / Visit Address</span>
                        {!initialData?.homeAddress && (
                            <span className="text-xs text-gray-400 font-normal normal-case">
                                (optional — required for Home Visit)
                            </span>
                        )}
                    </div>
                    {addressOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>

                {addressOpen && (
                    <div className="bg-white px-5 pb-5 space-y-4 border-t border-gray-100">
                        <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 mt-3">
                            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-700">
                                This address will be automatically used when you book a Home Visit service. You can update it at any time.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Present Address</Label>
                            <Textarea name="homeAddress" defaultValue={initialData?.homeAddress} placeholder="Street address, unit number..." className="min-h-[70px]" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="space-y-1.5">
                                <Label>Postcode</Label>
                                <Input name="homePostcode" defaultValue={initialData?.homePostcode} placeholder="50450" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>State</Label>
                                <Input name="homeState" defaultValue={initialData?.homeState} placeholder="Selangor" />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label>City</Label>
                                <Input name="homeCity" defaultValue={initialData?.homeCity} placeholder="Kuala Lumpur" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Medical History ────────────────────── */}
            <div className={SECTION_STYLE}>
                <h3 className={SECTION_TITLE}>Medical History</h3>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Medical History</Label>
                        <Textarea name="medicalHistory" defaultValue={initialData?.medicalHistory}
                            placeholder="List any past medical conditions or surgeries..." className="min-h-[80px]" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Medical Allergies</Label>
                        <Textarea name="medicalAllergies" defaultValue={initialData?.medicalAllergies}
                            placeholder="List any allergies..." className="min-h-[70px]" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Current Medications</Label>
                        <Textarea name="currentMedications" defaultValue={initialData?.currentMedications}
                            placeholder="List any medications you are currently taking..." className="min-h-[70px]" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Previous Treatments</Label>
                        <Textarea name="previousTreatments" defaultValue={initialData?.previousTreatments}
                            placeholder="List any major surgeries or treatments..." className="min-h-[70px]" />
                    </div>
                </div>
            </div>

            {/* ── Treatment Interest ─────────────────── */}
            {services.length > 0 && (
                <div className={SECTION_STYLE}>
                    <h3 className={SECTION_TITLE}>Service Interest</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Interested Service</Label>
                            <Select name="interestedService" defaultValue={initialData?.interestedService}>
                                <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                                <SelectContent>
                                    {services.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Quantity / Sessions (if applicable)</Label>
                            <Input name="stemCellInterestQuantity" defaultValue={initialData?.stemCellInterestQuantity}
                                placeholder="e.g. 1 vial, 2 sessions" />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Declaration ───────────────────────── */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 flex items-start gap-3">
                <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    required
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#008E7E] focus:ring-[#008E7E]"
                />
                <label htmlFor="consent" className="text-sm text-gray-600 cursor-pointer">
                    I hereby confirm that all information provided is true and accurate.
                </label>
            </div>

            {/* ── Actions ───────────────────────────── */}
            <div className="flex justify-end gap-3 pb-12">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-[#008E7E] hover:bg-[#008E7E]/90 min-w-[120px]">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
}
