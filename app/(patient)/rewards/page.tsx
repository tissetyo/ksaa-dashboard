'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Ticket, CheckCircle2, Loader2, Copy, Calendar, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { getPatientCoupons } from '@/lib/actions/patient-rewards';
import { format } from 'date-fns';

export default function PatientRewardsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getPatientCoupons()
            .then(setCoupons)
            .finally(() => setIsLoading(false));
    }, []);

    const copyCouponCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success('Coupon code copied!');
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Rewards</h1>
                <p className="text-muted-foreground">Your earned coupons and available promotions.</p>
            </div>

            <Tabs defaultValue="coupons" className="w-full">
                <TabsList className="bg-white border text-gray-500 rounded-xl h-auto p-1 flex overflow-x-auto justify-start flex-nowrap mb-6">
                    <TabsTrigger value="coupons" className="data-[state=active]:bg-[#008E7E] data-[state=active]:text-white rounded-lg px-4 py-2 text-sm font-medium">
                        <Gift className="h-4 w-4 mr-2" /> Coupons Earned
                    </TabsTrigger>
                    <TabsTrigger value="promotions" className="data-[state=active]:bg-[#008E7E] data-[state=active]:text-white rounded-lg px-4 py-2 text-sm font-medium">
                        <Megaphone className="h-4 w-4 mr-2" /> Promotions & Events
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="coupons">
                    {isLoading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : coupons.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="py-20 text-center">
                                <div className="bg-gray-100 rounded-full p-4 inline-flex mb-4">
                                    <Gift className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-semibold">No coupons earned yet</p>
                                <p className="text-sm text-gray-400 mt-1">Complete an appointment and leave a review to earn rewards!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {coupons.map(coupon => (
                                <div
                                    key={coupon.id}
                                    className={`relative rounded-2xl overflow-hidden ${coupon.isRedeemed
                                            ? 'bg-gray-100 border-2 border-gray-200'
                                            : 'bg-gradient-to-r from-[#008E7E] to-[#00b39e] text-white'
                                        }`}
                                >
                                    {/* Ticket notches */}
                                    <div className={`absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${coupon.isRedeemed ? 'bg-gray-50' : 'bg-gray-50'}`} />
                                    <div className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${coupon.isRedeemed ? 'bg-gray-50' : 'bg-gray-50'}`} />

                                    <div className="p-5 pl-8 pr-8">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {coupon.isRedeemed
                                                    ? <CheckCircle2 className="h-5 w-5 text-gray-400" />
                                                    : <Gift className="h-5 w-5" />}
                                                <span className={`text-xs font-semibold uppercase tracking-wide ${coupon.isRedeemed ? 'text-gray-400' : 'opacity-80'}`}>
                                                    {coupon.type === 'FREE_STEMCELLS' ? '🌱 Stemcells Reward' : '🎁 Free Item Reward'}
                                                </span>
                                            </div>
                                            <Badge variant={coupon.isRedeemed ? 'secondary' : 'outline'} className={!coupon.isRedeemed ? 'bg-white/20 text-white border-white/30' : ''}>
                                                {coupon.isRedeemed ? 'Redeemed' : 'Active'}
                                            </Badge>
                                        </div>

                                        <h3 className={`text-lg font-bold mb-1 ${coupon.isRedeemed ? 'text-gray-500' : ''}`}>
                                            {coupon.description}
                                        </h3>

                                        <div className={`flex items-center gap-2 text-sm ${coupon.isRedeemed ? 'text-gray-400' : 'opacity-80'}`}>
                                            <Calendar className="h-3.5 w-3.5" />
                                            {coupon.serviceName} • {coupon.appointmentDate ? format(new Date(coupon.appointmentDate), 'MMM d, yyyy') : ''}
                                        </div>

                                        {!coupon.isRedeemed && (
                                            <div className="flex items-center gap-2 mt-3 bg-white/20 rounded-lg px-3 py-2">
                                                <Ticket className="h-4 w-4" />
                                                <span className="font-mono text-sm font-bold flex-1 tracking-wider">
                                                    {coupon.code.toUpperCase().slice(0, 12)}
                                                </span>
                                                <button
                                                    onClick={() => copyCouponCode(coupon.code)}
                                                    className="p-1 hover:bg-white/20 rounded transition-colors"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}

                                        {coupon.isRedeemed && coupon.redeemedAt && (
                                            <p className="text-xs text-gray-400 mt-2">
                                                Redeemed on {format(new Date(coupon.redeemedAt), 'MMM d, yyyy h:mm a')}
                                            </p>
                                        )}

                                        {!coupon.isRedeemed && (
                                            <p className="text-xs opacity-70 mt-2">
                                                Show this coupon to staff at the clinic to redeem.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="promotions">
                    <Card className="border-dashed">
                        <CardContent className="py-20 text-center">
                            <div className="bg-gray-100 rounded-full p-4 inline-flex mb-4">
                                <Megaphone className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-semibold">No promotions available</p>
                            <p className="text-sm text-gray-400 mt-1">Check back later for special offers and events!</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
