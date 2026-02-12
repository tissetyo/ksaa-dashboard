import { db } from "@/lib/db";
import { ReviewWidgetGenerator } from "@/components/admin/ReviewWidgetGenerator";

export default async function AdminSettingsPage() {
    // Fetch active staff and products for the generator filters
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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Configure system preferences and integrations.</p>
            </div>

            <ReviewWidgetGenerator staffMembers={staffMembers} products={products} />
        </div>
    );
}
