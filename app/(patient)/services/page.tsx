import { db } from '@/lib/db';
import { ServiceCard } from '@/components/patient/ServiceCard';

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
    const products = await db.product.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
    });

    return (
        <div className="space-y-8">
            <div className="max-w-2xl">
                <h1 className="text-3xl font-bold text-gray-900">Our Services</h1>
                <p className="text-gray-600 mt-2">
                    Discover our range of advanced stem cell therapies and regenerative treatments
                    designed to enhance your health and well-being.
                </p>
            </div>

            {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ServiceCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No services are currently available. Please check back later.</p>
                </div>
            )}
        </div>
    );
}
