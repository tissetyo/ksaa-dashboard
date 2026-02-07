'use client';

import { useUserData } from '@/components/providers/UserDataProvider';
import { ServiceCard } from '@/components/patient/ServiceCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function ServicesClient() {
    const { data, isLoading } = useUserData();

    if (isLoading) {
        return <ServicesSkeleton />;
    }

    const services = data?.services || [];

    return (
        <div className="space-y-8">
            <div className="max-w-2xl">
                <h1 className="text-3xl font-bold text-gray-900">Our Services</h1>
                <p className="text-gray-600 mt-2">
                    Discover our range of advanced stem cell therapies and regenerative treatments
                    designed to enhance your health and well-being.
                </p>
            </div>

            {services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((product: any) => (
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

function ServicesSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="max-w-2xl">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-96 mt-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i}>
                        <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
