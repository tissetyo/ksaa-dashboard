'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ReferralQRCodeProps {
    staffCode: string;
    staffName: string;
    size?: number;
}

export function ReferralQRCode({ staffCode, staffName, size = 200 }: ReferralQRCodeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            // Create signup URL with pre-filled referral code
            const signupUrl = `${window.location.origin}/signup?ref=${staffCode}`;

            // Generate QR code with the signup URL
            QRCode.toCanvas(canvasRef.current, signupUrl, {
                width: size,
                margin: 2,
                color: {
                    dark: '#1e3a8a', // Blue color
                    light: '#ffffff',
                },
            });
        }
    }, [staffCode, size]);

    const handleDownload = () => {
        if (canvasRef.current) {
            const url = canvasRef.current.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `${staffCode}-qr-code.png`;
            link.href = url;
            link.click();
        }
    };

    const handleHighResDownload = async () => {
        try {
            const signupUrl = `${window.location.origin}/signup?ref=${staffCode}`;
            const highResUrl = await QRCode.toDataURL(signupUrl, {
                width: 2500,
                margin: 2,
                color: {
                    dark: '#1e3a8a',
                    light: '#ffffff',
                },
            });
            const link = document.createElement('a');
            link.download = `${staffCode}-highres-qr.png`;
            link.href = highResUrl;
            link.click();
        } catch (error) {
            console.error('Failed to generate high-res QR', error);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Referral QR Code</p>
                <p className="text-xs text-muted-foreground mt-1">Scan to auto-fill referral code</p>
            </div>
            <canvas ref={canvasRef} className="border-2 border-border rounded-lg" />
            <div className="text-center">
                <p className="font-mono font-bold text-lg text-[#008E7E]">{staffCode}</p>
                <p className="text-sm text-muted-foreground">{staffName}</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <Button onClick={handleDownload} variant="outline" size="sm" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Standard
                </Button>
                <Button onClick={handleHighResDownload} size="sm" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download High Res (2500px)
                </Button>
            </div>
        </div>
    );
}
