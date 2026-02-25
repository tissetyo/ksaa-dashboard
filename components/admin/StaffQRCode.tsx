'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface StaffQRCodeProps {
    staffCode: string;
    staffName: string;
}

export function StaffQRCode({ staffCode, staffName }: StaffQRCodeProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string>('');

    useEffect(() => {
        const generateQR = async () => {
            try {
                // The URL to point to. Assuming standard registration or booking with referral code.
                // Replace with actual referral link format.
                const referralLink = `${window.location.origin}/register?ref=${staffCode}`;

                const url = await QRCode.toDataURL(referralLink, {
                    width: 400,
                    margin: 2,
                    color: {
                        dark: '#008E7E',
                        light: '#FFFFFF',
                    },
                });
                setQrDataUrl(url);
            } catch (err) {
                console.error(err);
            }
        };

        generateQR();
    }, [staffCode]);

    const downloadQR = () => {
        const link = document.createElement('a');
        link.href = qrDataUrl;
        link.download = `referral-qr-${staffCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadHighResQR = async () => {
        try {
            const referralLink = `${window.location.origin}/register?ref=${staffCode}`;
            const highResUrl = await QRCode.toDataURL(referralLink, {
                width: 2500,
                margin: 2,
                color: {
                    dark: '#008E7E',
                    light: '#FFFFFF',
                },
            });

            const link = document.createElement('a');
            link.href = highResUrl;
            link.download = `referral-qr-${staffCode}-highres.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Failed to generate high res QR', err);
        }
    };

    return (
        <Card className="flex flex-col items-center p-6 space-y-4">
            <CardHeader className="text-center p-0">
                <CardTitle className="text-xl">Referral QR Code</CardTitle>
                <CardDescription>{staffName}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4 p-0">
                {qrDataUrl ? (
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <img src={qrDataUrl} alt={`QR Code for ${staffName}`} className="w-64 h-64" />
                    </div>
                ) : (
                    <div className="w-64 h-64 bg-gray-100 animate-pulse rounded-lg" />
                )}

                <div className="space-y-2 text-center w-full">
                    <p className="text-sm font-medium text-gray-500">Referral Code</p>
                    <p className="text-2xl font-mono font-bold text-[#008E7E] tracking-wider">{staffCode}</p>
                </div>

                <div className="w-full space-y-2">
                    <Button onClick={downloadQR} className="w-full" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download Standard (400px)
                    </Button>
                    <Button onClick={downloadHighResQR} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download High Res (2500px)
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
