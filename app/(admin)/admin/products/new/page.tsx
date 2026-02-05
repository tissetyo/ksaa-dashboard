import { ProductForm } from '@/components/admin/ProductForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewProductPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Add New Service</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Service Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProductForm />
                </CardContent>
            </Card>
        </div>
    );
}
