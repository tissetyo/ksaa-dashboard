export const dynamic = 'force-dynamic';

import { CouponRedemptionCard } from '@/components/admin/CouponRedemptionCard';
import { PromotionManager } from '@/components/admin/PromotionManager';

export default function AdminPromotionsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Promotions & Coupons</h1>
                <p className="text-muted-foreground">Manage reward coupons and create promotions for patients.</p>
            </div>

            {/* Promotion Management */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <PromotionManager />
            </div>

            {/* Coupon Redemption */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <CouponRedemptionCard />
            </div>
        </div>
    );
}
