'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Heart, Pill } from 'lucide-react';

interface HealthStatementData {
    healthCondition: string;
    onMedication: boolean;
    medicationDetails: string;
}

interface HealthStatementFormProps {
    onChange: (data: HealthStatementData) => void;
    data: HealthStatementData;
}

export function HealthStatementForm({ onChange, data }: HealthStatementFormProps) {
    const handleChange = (field: keyof HealthStatementData, value: string | boolean) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-6">
            <div className="bg-[#008E7E]/5 border border-[#008E7E]/20 rounded-xl p-4">
                <p className="text-sm text-[#008E7E] font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Please help us serve you better by answering a few health questions.
                </p>
            </div>

            {/* Question A */}
            <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <span className="bg-[#008E7E] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        A
                    </span>
                    Please describe your current health condition
                    <span className="text-red-500 text-sm ml-1">*</span>
                </Label>
                <p className="text-sm text-gray-500 ml-8">
                    Tell us about any discomfort, symptoms, or general health status you are experiencing.
                </p>
                <Textarea
                    className="min-h-[100px] focus-visible:ring-[#008E7E] ml-0"
                    placeholder="e.g. I have been experiencing fatigue and joint pain for the past 2 months..."
                    value={data.healthCondition}
                    onChange={(e) => handleChange('healthCondition', e.target.value)}
                    required
                />
            </div>

            {/* Question B */}
            <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <span className="bg-[#008E7E] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        B
                    </span>
                    Are you currently under any medication or other treatments?
                    <span className="text-red-500 text-sm ml-1">*</span>
                </Label>
                <div className="flex gap-4 ml-8">
                    <button
                        type="button"
                        onClick={() => handleChange('onMedication', false)}
                        className={cn(
                            'flex-1 py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200',
                            !data.onMedication
                                ? 'border-[#008E7E] bg-[#008E7E] text-white shadow-md'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        )}
                    >
                        ✗  No
                    </button>
                    <button
                        type="button"
                        onClick={() => handleChange('onMedication', true)}
                        className={cn(
                            'flex-1 py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200',
                            data.onMedication
                                ? 'border-[#008E7E] bg-[#008E7E] text-white shadow-md'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        )}
                    >
                        ✓  Yes
                    </button>
                </div>

                {data.onMedication && (
                    <div className="ml-8 mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <Pill className="h-3.5 w-3.5 text-[#008E7E]" />
                            Please state your current medications or treatments
                        </Label>
                        <Textarea
                            className="min-h-[80px] focus-visible:ring-[#008E7E]"
                            placeholder="e.g. Metformin 500mg daily, physiotherapy twice a week..."
                            value={data.medicationDetails}
                            onChange={(e) => handleChange('medicationDetails', e.target.value)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
