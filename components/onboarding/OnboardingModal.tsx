'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Video, CheckCircle2, X } from 'lucide-react';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);

    const handleBookConsultation = () => {
        onClose();
        router.push('/book-consultation');
    };

    const handleSkip = () => {
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                {step === 1 && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Welcome to KSAA STEMCARE! 🎉</DialogTitle>
                            <DialogDescription className="text-base">
                                Your profile is complete. Let's get you started with a free consultation.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-6">
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
                                <div className="flex items-start gap-4">
                                    <Video className="h-8 w-8 text-[#008E7E] flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">
                                            Free 30-Minute Consultation
                                        </h3>
                                        <p className="text-sm text-gray-700 mb-3">
                                            Talk to our STEMCARE specialists about your health concerns and learn
                                            how our treatments can help you.
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <span>Choose Google Meet or WhatsApp call</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <span>No payment required</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <span>Flexible scheduling</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={handleBookConsultation} className="flex-1" size="lg">
                                    Book Free Consultation
                                </Button>
                                <Button onClick={handleSkip} variant="outline" size="lg">
                                    Skip for Now
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
