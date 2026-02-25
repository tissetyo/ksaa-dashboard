'use client';

import Link from 'next/link';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileCompletionBarProps {
    patient: {
        fullName?: string | null;
        phone?: string | null;
        dateOfBirth?: Date | string | null;
        gender?: string | null;
        nationality?: string | null;
        bloodType?: string | null;
        heightCm?: number | null;
        weightKg?: number | null;
        emergencyContactName?: string | null;
        emergencyContactPhone?: string | null;
        icNumber?: string | null;
        placeOfBirth?: string | null;
        maritalStatus?: string | null;
        country?: string | null;
    };
    compact?: boolean; // for dashboard (compact) vs full profile page
}

const PROFILE_FIELDS = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'icNumber', label: 'IC / Passport Number' },
    { key: 'dateOfBirth', label: 'Date of Birth' },
    { key: 'gender', label: 'Gender' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'bloodType', label: 'Blood Type', emptyValues: ['UNKNOWN'] },
    { key: 'heightCm', label: 'Height' },
    { key: 'weightKg', label: 'Weight' },
    { key: 'emergencyContactName', label: 'Emergency Contact Name' },
    { key: 'emergencyContactPhone', label: 'Emergency Contact Phone' },
    { key: 'maritalStatus', label: 'Marital Status' },
    { key: 'country', label: 'Country' },
];

export function ProfileCompletionBar({ patient, compact = false }: ProfileCompletionBarProps) {
    const completedFields = PROFILE_FIELDS.filter((field) => {
        const value = (patient as any)[field.key];
        if (!value) return false;
        if (field.emptyValues && field.emptyValues.includes(value)) return false;
        return true;
    });

    const percentage = Math.round((completedFields.length / PROFILE_FIELDS.length) * 100);
    const isComplete = percentage === 100;
    const missingFields = PROFILE_FIELDS.filter((f) => !completedFields.includes(f));

    if (compact) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {isComplete ? (
                            <CheckCircle2 className="h-4 w-4 text-[#008E7E]" />
                        ) : (
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                        )}
                        <span className="text-sm font-semibold text-gray-800">
                            Profile {isComplete ? 'Complete' : `${percentage}% Complete`}
                        </span>
                    </div>
                    {!isComplete && (
                        <Link
                            href="/profile"
                            className="text-xs text-[#008E7E] font-medium hover:underline"
                        >
                            Complete →
                        </Link>
                    )}
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                        className={cn(
                            'h-2 rounded-full transition-all duration-500',
                            isComplete ? 'bg-[#008E7E]' : 'bg-gradient-to-r from-[#008E7E] to-emerald-400'
                        )}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                {!isComplete && (
                    <p className="text-xs text-gray-500 mt-1">
                        {missingFields.length} field{missingFields.length !== 1 ? 's' : ''} missing
                    </p>
                )}
            </div>
        );
    }

    // Full view (profile page)
    return (
        <div className="bg-gradient-to-r from-[#008E7E]/10 to-emerald-50 rounded-2xl border border-[#008E7E]/20 p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-[#008E7E]" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                    )}
                    <span className="font-semibold text-gray-900">
                        Profile Completion: {percentage}%
                    </span>
                </div>
                <span className="text-sm text-[#008E7E] font-bold">{completedFields.length}/{PROFILE_FIELDS.length} fields</span>
            </div>
            <div className="w-full bg-white/60 rounded-full h-3">
                <div
                    className={cn(
                        'h-3 rounded-full transition-all duration-700 shadow-sm',
                        isComplete ? 'bg-[#008E7E]' : 'bg-gradient-to-r from-[#008E7E] to-emerald-400'
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {!isComplete && (
                <div className="mt-3">
                    <p className="text-xs text-gray-600 font-medium mb-1">Still missing:</p>
                    <div className="flex flex-wrap gap-1.5">
                        {missingFields.map((f) => (
                            <span key={f.key} className="text-xs bg-orange-100 text-orange-700 rounded-full px-2 py-0.5">
                                {f.label}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {isComplete && (
                <p className="text-sm text-[#008E7E] font-medium mt-2">
                    ✨ Your profile is fully complete. Thank you!
                </p>
            )}
        </div>
    );
}
