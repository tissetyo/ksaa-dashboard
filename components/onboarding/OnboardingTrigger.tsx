'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';

export function OnboardingTrigger() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        if (searchParams.get('onboarding') === 'true') {
            setShowOnboarding(true);
            // Clean up URL
            router.replace('/dashboard');
        }
    }, [searchParams, router]);

    return (
        <OnboardingModal
            isOpen={showOnboarding}
            onClose={() => setShowOnboarding(false)}
        />
    );
}
