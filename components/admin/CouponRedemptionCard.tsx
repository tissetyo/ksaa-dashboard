'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Ticket, Search, CheckCircle2, Loader2, Gift, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { lookupCoupon, redeemCoupon, getAllCoupons } from '@/lib/actions/coupon';
import { format } from 'date-fns';

export function CouponRedemptionCard() {
    const [searchCode, setSearchCode] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [foundCoupon, setFoundCoupon] = useState<any>(null);
    const [recentCoupons, setRecentCoupons] = useState<any[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(true);

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        try {
            const coupons = await getAllCoupons();
            setRecentCoupons(coupons);
        } catch {
            // ignore
        } finally {
            setIsLoadingList(false);
        }
    };

    const handleSearch = async () => {
        if (!searchCode.trim()) return;
        setIsSearching(true);
        setFoundCoupon(null);
        try {
            const result = await lookupCoupon(searchCode.trim());
            if (result.success) {
                setFoundCoupon(result.coupon);
            } else {
                toast.error(result.error || 'Coupon not found');
            }
        } catch {
            toast.error('Failed to look up coupon');
        } finally {
            setIsSearching(false);
        }
    };

    const handleRedeem = async () => {
        if (!foundCoupon) return;
        setIsRedeeming(true);
        try {
            const result = await redeemCoupon(foundCoupon.id);
            if (result.success) {
                toast.success('Coupon redeemed successfully!');
                setFoundCoupon({ ...foundCoupon, isRedeemed: true, redeemedAt: new Date() });
                loadCoupons();
            } else {
                toast.error(result.error || 'Failed to redeem');
            }
        } catch {
            toast.error('Failed to redeem coupon');
        } finally {
            setIsRedeeming(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5" /> Reward Coupon Redemption
                </CardTitle>
                <CardDescription>
                    Look up and redeem patient reward coupons. Patients receive coupons after submitting a review.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Search */}
                <div className="flex gap-2">
                    <Input
                        placeholder="Enter coupon code..."
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="font-mono"
                    />
                    <Button
                        onClick={handleSearch}
                        disabled={isSearching || !searchCode.trim()}
                        className="bg-[#008E7E] hover:bg-[#0a4f47]"
                    >
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Found Coupon */}
                {foundCoupon && (
                    <div className={`border-2 rounded-xl p-5 space-y-3 ${foundCoupon.isRedeemed ? 'border-gray-200 bg-gray-50' : 'border-[#008E7E] bg-[#008E7E]/5'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Gift className="h-5 w-5 text-[#008E7E]" />
                                <span className="font-semibold">{foundCoupon.description}</span>
                            </div>
                            <Badge variant={foundCoupon.isRedeemed ? 'secondary' : 'default'} className={!foundCoupon.isRedeemed ? 'bg-[#008E7E]' : ''}>
                                {foundCoupon.isRedeemed ? 'Redeemed' : 'Active'}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>Patient: <span className="font-medium text-gray-900">{foundCoupon.patientName}</span></div>
                            <div>Phone: <span className="font-medium text-gray-900">{foundCoupon.patientPhone}</span></div>
                            <div>Service: <span className="font-medium text-gray-900">{foundCoupon.serviceName}</span></div>
                            <div>Rating: <span className="font-medium text-gray-900">{'⭐'.repeat(foundCoupon.rating)}</span></div>
                        </div>

                        {foundCoupon.isRedeemed ? (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <CheckCircle2 className="h-4 w-4" />
                                Redeemed on {foundCoupon.redeemedAt ? format(new Date(foundCoupon.redeemedAt), 'MMM d, yyyy h:mm a') : 'N/A'}
                            </div>
                        ) : (
                            <Button
                                onClick={handleRedeem}
                                disabled={isRedeeming}
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                {isRedeeming ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Redeeming...</>
                                ) : (
                                    <><CheckCircle2 className="h-4 w-4 mr-2" /> Confirm Redemption</>
                                )}
                            </Button>
                        )}
                    </div>
                )}

                {/* Recent Coupons List */}
                <div>
                    <h4 className="font-semibold text-sm text-gray-500 uppercase mb-3">Recent Coupons</h4>
                    {isLoadingList ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                    ) : recentCoupons.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No coupons generated yet</p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {recentCoupons.map(coupon => (
                                <div
                                    key={coupon.id}
                                    onClick={() => {
                                        setSearchCode(coupon.code);
                                        setFoundCoupon(null);
                                    }}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`p-1.5 rounded-full ${coupon.isRedeemed ? 'bg-gray-100' : 'bg-[#008E7E]/10'}`}>
                                            {coupon.isRedeemed
                                                ? <CheckCircle2 className="h-3.5 w-3.5 text-gray-400" />
                                                : <Gift className="h-3.5 w-3.5 text-[#008E7E]" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{coupon.patientName}</p>
                                            <p className="text-xs text-gray-500 truncate">{coupon.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge variant={coupon.isRedeemed ? 'secondary' : 'outline'} className="text-[10px]">
                                            {coupon.isRedeemed ? 'Used' : 'Active'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
