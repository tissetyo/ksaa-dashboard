'use client';

import { useState, useEffect } from 'react';
import { getGoogleConnectionStatus } from '@/lib/actions/google-connect';
import { AlertTriangle, Plus } from 'lucide-react';
import Link from 'next/link';

export function GoogleConnectionWarning() {
    const [isGoogleConnected, setIsGoogleConnected] = useState<boolean | null>(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const status = await getGoogleConnectionStatus();
                setIsGoogleConnected(status.connected);
            } catch (e) {
                console.error('Failed to check google connection', e);
            }
        };
        checkStatus();
    }, []);

    if (isGoogleConnected === true) return null;
    if (isGoogleConnected === null) return null; // Loading state, render nothing to avoid flicker

    return (
        <div className="bg-amber-50 border-b border-amber-200 px-8 py-2.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 text-amber-800 text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="font-medium">Google Calendar not connected.</span>
                <span className="opacity-90">Please connect your account to enable Meet links and event creation.</span>
            </div>
            <Link
                href="/admin/settings"
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5"
            >
                <Plus className="h-3.5 w-3.5" />
                Connect Now
            </Link>
        </div>
    );
}
