'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateProfile } from '@/lib/actions/profile';
import { toast } from 'sonner';
import { User, Activity, Phone, MapPin, Heart, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const STEPS = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'physical', label: 'Physical', icon: Activity },
    { id: 'emergency', label: 'Emergency', icon: Phone },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'medical', label: 'Medical', icon: Heart },
];

export function ProfileWizard({ initialData }: { initialData: any }) {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [isPending, startTransition] = useTransition();

    // All form fields
    const [form, setForm] = useState({
        fullName: initialData?.fullName || '',
        phone: initialData?.phone || '',
        dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: initialData?.gender || '',
        nationality: initialData?.nationality || '',
        icNumber: initialData?.icNumber || '',
        // Physical
        height: initialData?.height?.toString() || '',
        weight: initialData?.weight?.toString() || '',
        bloodType: initialData?.bloodType || '',
        // Emergency
        emergencyContactName: initialData?.emergencyContactName || '',
        emergencyContactPhone: initialData?.emergencyContactPhone || '',
        emergencyContactRelationship: initialData?.emergencyContactRelationship || '',
        // Address
        homeAddress: initialData?.homeAddress || '',
        homeCity: initialData?.homeCity || '',
        homeState: initialData?.homeState || '',
        homePostcode: initialData?.homePostcode || '',
        // Medical
        allergies: initialData?.allergies || '',
        medicalConditions: initialData?.medicalConditions || '',
        currentMedications: initialData?.currentMedications || '',
    });

    const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

    const handleSaveAndNext = async () => {
        startTransition(async () => {
            try {
                const fd = new FormData();
                Object.entries(form).forEach(([k, v]) => { if (v) fd.set(k, v); });
                const result = await updateProfile(fd);
                if (result?.error) { toast.error(result.error); return; }
                if (step < STEPS.length - 1) {
                    setStep(s => s + 1);
                } else {
                    toast.success('Profile complete!');
                    router.push('/dashboard');
                }
            } catch {
                toast.error('Failed to save');
            }
        });
    };

    const handleSkip = () => {
        if (step < STEPS.length - 1) {
            setStep(s => s + 1);
        } else {
            router.push('/dashboard');
        }
    };

    const progressPct = ((step + 1) / STEPS.length) * 100;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-[#008E7E]">Complete Your Profile</h1>
                <p className="text-gray-500">Step {step + 1} of {STEPS.length} — you can skip any step and finish later</p>
            </div>

            {/* Step Tabs */}
            <div className="flex justify-center gap-2 flex-wrap">
                {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${i === step ? 'bg-[#008E7E] text-white' :
                                i < step ? 'bg-emerald-100 text-[#008E7E]' :
                                    'bg-gray-100 text-gray-400'
                            }`}>
                            {i < step ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                            {s.label}
                        </div>
                    );
                })}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#008E7E] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                {/* Step 1: Personal */}
                {step === 0 && <>
                    <h2 className="text-base font-semibold flex items-center gap-2"><User className="h-4 w-4 text-[#008E7E]" /> Personal Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Full Name <span className="text-red-500">*</span></Label>
                            <Input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Your full name" />
                        </div>
                        <div>
                            <Label>Phone Number <span className="text-red-500">*</span></Label>
                            <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+60 12-345 6789" />
                        </div>
                        <div>
                            <Label>Date of Birth</Label>
                            <Input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} max={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div>
                            <Label>Gender</Label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.gender} onChange={e => set('gender', e.target.value)}>
                                <option value="">Select gender</option>
                                <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
                            </select>
                        </div>
                        <div>
                            <Label>Nationality</Label>
                            <Input value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="Malaysian" />
                        </div>
                        <div>
                            <Label>IC / Passport Number</Label>
                            <Input value={form.icNumber} onChange={e => set('icNumber', e.target.value)} placeholder="XXXXXX-XX-XXXX" />
                        </div>
                    </div>
                </>}

                {/* Step 2: Physical */}
                {step === 1 && <>
                    <h2 className="text-base font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-[#008E7E]" /> Physical Information</h2>
                    <p className="text-sm text-gray-500">This helps our staff prepare for your appointment. You can skip this.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <Label>Height (cm)</Label>
                            <Input type="number" value={form.height} onChange={e => set('height', e.target.value)} placeholder="170" min={50} max={250} />
                        </div>
                        <div>
                            <Label>Weight (kg)</Label>
                            <Input type="number" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="65" min={10} max={300} />
                        </div>
                        <div>
                            <Label>Blood Type</Label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.bloodType} onChange={e => set('bloodType', e.target.value)}>
                                <option value="">Unknown</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                </>}

                {/* Step 3: Emergency Contact */}
                {step === 2 && <>
                    <h2 className="text-base font-semibold flex items-center gap-2"><Phone className="h-4 w-4 text-[#008E7E]" /> Emergency Contact</h2>
                    <p className="text-sm text-gray-500">Someone we can reach in case of emergency.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Contact Name</Label>
                            <Input value={form.emergencyContactName} onChange={e => set('emergencyContactName', e.target.value)} placeholder="Full name" />
                        </div>
                        <div>
                            <Label>Contact Phone</Label>
                            <Input value={form.emergencyContactPhone} onChange={e => set('emergencyContactPhone', e.target.value)} placeholder="+60 12-345 6789" />
                        </div>
                        <div>
                            <Label>Relationship</Label>
                            <Input value={form.emergencyContactRelationship} onChange={e => set('emergencyContactRelationship', e.target.value)} placeholder="Spouse, Parent, Sibling..." />
                        </div>
                    </div>
                </>}

                {/* Step 4: Address */}
                {step === 3 && <>
                    <h2 className="text-base font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-[#008E7E]" /> Home Address</h2>
                    <p className="text-sm text-gray-500">Required for home visit appointments.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <Label>Street Address</Label>
                            <Input value={form.homeAddress} onChange={e => set('homeAddress', e.target.value)} placeholder="No. 1, Jalan ..." />
                        </div>
                        <div>
                            <Label>City</Label>
                            <Input value={form.homeCity} onChange={e => set('homeCity', e.target.value)} placeholder="Kuala Lumpur" />
                        </div>
                        <div>
                            <Label>State</Label>
                            <Input value={form.homeState} onChange={e => set('homeState', e.target.value)} placeholder="Selangor" />
                        </div>
                        <div>
                            <Label>Postcode</Label>
                            <Input value={form.homePostcode} onChange={e => set('homePostcode', e.target.value)} placeholder="50000" />
                        </div>
                    </div>
                </>}

                {/* Step 5: Medical */}
                {step === 4 && <>
                    <h2 className="text-base font-semibold flex items-center gap-2"><Heart className="h-4 w-4 text-[#008E7E]" /> Medical History</h2>
                    <p className="text-sm text-gray-500">All information is confidential and only visible to STEMCARE staff.</p>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <Label>Known Allergies</Label>
                            <Textarea rows={2} value={form.allergies} onChange={e => set('allergies', e.target.value)} placeholder="e.g. Penicillin, Latex..." className="resize-none" />
                        </div>
                        <div>
                            <Label>Medical Conditions</Label>
                            <Textarea rows={2} value={form.medicalConditions} onChange={e => set('medicalConditions', e.target.value)} placeholder="e.g. Hypertension, Diabetes..." className="resize-none" />
                        </div>
                        <div>
                            <Label>Current Medications</Label>
                            <Textarea rows={2} value={form.currentMedications} onChange={e => set('currentMedications', e.target.value)} placeholder="e.g. Metformin 500mg, Amlodipine..." className="resize-none" />
                        </div>
                    </div>
                </>}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => step > 0 ? setStep(s => s - 1) : null} disabled={step === 0}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSkip} disabled={isPending}>
                        Skip
                    </Button>
                    <Button onClick={handleSaveAndNext} disabled={isPending} className="bg-[#008E7E] hover:bg-[#008E7E]/90">
                        {isPending ? 'Saving...' : step === STEPS.length - 1 ? (
                            <><Check className="h-4 w-4 mr-1" /> Finish</>
                        ) : (
                            <>Save & Continue <ChevronRight className="h-4 w-4 ml-1" /></>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
