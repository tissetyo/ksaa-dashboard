import { db } from '@/lib/db';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { ProductForm } from '@/components/admin/ProductForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function EditProductPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    const product = await db.product.findUnique({
        where: { id },
    });

    if (!product) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Edit Service</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Update Service details</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProductForm initialData={product} />
                </CardContent>
            </Card>
        </div>
    );
}
