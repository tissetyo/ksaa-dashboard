'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { QrCode } from 'lucide-react';
import { ReferralQRCode } from '@/components/admin/ReferralQRCode';

interface StaffMember {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    staffCode: string;
    isActive: boolean;
    _count: {
        referredPatients: number;
    };
}

export function StaffCard({ member }: { member: StaffMember }) {
    const [showQR, setShowQR] = useState(false);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            {member.fullName}
                            {!member.isActive && (
                                <span className="text-sm font-normal text-muted-foreground">(Inactive)</span>
                            )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowQR(!showQR)}
                        >
                            <QrCode className="h-4 w-4 mr-2" />
                            {showQR ? 'Hide' : 'Show'} QR
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/staff/${member.id}/edit`}>Edit</Link>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {showQR && (
                    <div className="mb-6">
                        <ReferralQRCode
                            staffCode={member.staffCode}
                            staffName={member.fullName}
                            size={200}
                        />
                    </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Referral Code</p>
                        <p className="font-mono font-bold text-[#008E7E]">{member.staffCode}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p>{member.phone || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Referrals</p>
                        <p className="font-semibold">{member._count.referredPatients}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className={member.isActive ? 'text-green-600' : 'text-red-600'}>
                            {member.isActive ? 'Active' : 'Inactive'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
