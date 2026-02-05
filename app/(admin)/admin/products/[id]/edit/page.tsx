import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function EditProductPage({
    params
}: {
    params: { id: string }
}) {
    const product = await db.product.findUnique({
        where: { id: params.id },
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
