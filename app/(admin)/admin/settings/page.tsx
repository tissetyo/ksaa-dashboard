export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { ReviewWidgetGenerator } from "@/components/admin/ReviewWidgetGenerator";
import { BannerManager } from "@/components/admin/BannerManager";
import { ClinicLocationManager } from "@/components/admin/ClinicLocationManager";
import { GoogleConnectCard } from "@/components/admin/GoogleConnectCard";
import { Separator } from "@/components/ui/separator";

export default async function AdminSettingsPage() {
    const staffMembers = await db.staff.findMany({
        where: { isActive: true },
        select: { id: true, fullName: true, staffCode: true },
        orderBy: { fullName: 'asc' }
    });

    const products = await db.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    });

    const banners = await db.banner.findMany({
        orderBy: { order: 'asc' }
    });

    const clinicLocations = await db.clinicLocation.findMany({
        orderBy: { order: 'asc' }
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Configure system preferences and integrations.</p>
            </div>

            {/* Banner Management */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <BannerManager initialBanners={banners} products={products} />
            </div>

            <Separator />

            {/* Google Calendar Integration */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <GoogleConnectCard />
            </div>

            <Separator />

            {/* Clinic Locations */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <ClinicLocationManager initialLocations={clinicLocations} />
            </div>

            <Separator />

            {/* Review Widget */}
            <ReviewWidgetGenerator staffMembers={staffMembers} products={products} />
        </div>
    );
}
