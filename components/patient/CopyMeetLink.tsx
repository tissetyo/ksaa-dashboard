'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CopyMeetLinkProps {
    link: string;
}

export function CopyMeetLink({ link }: CopyMeetLinkProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            toast.success('Meeting link copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = link;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            toast.success('Meeting link copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md px-3 py-1.5 transition-colors"
        >
            {copied ? (
                <>
                    <Check className="h-3.5 w-3.5 text-green-600" /> Copied!
                </>
            ) : (
                <>
                    <Copy className="h-3.5 w-3.5" /> Copy Link
                </>
            )}
        </button>
    );
}
