import { db } from '@/lib/db';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function AdminProductsPage() {
    const products = await db.product.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products & Services</h1>
                    <p className="text-muted-foreground">Manage your clinic treatments and service quotas.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Service
                    </Link>
                </Button>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Service Name</TableHead>
                            <TableHead>Price (MYR)</TableHead>
                            <TableHead>Deposit</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Daily Quota</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                    No services found. Start by adding one.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{formatCurrency(product.priceMYR)}</TableCell>
                                    <TableCell>{product.depositPercentage}%</TableCell>
                                    <TableCell>{product.durationMinutes}m</TableCell>
                                    <TableCell>{product.quotaPerDay}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.isActive ? 'default' : 'secondary'}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button asChild variant="ghost" size="icon">
                                                <Link href={`/admin/products/${product.id}/edit`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            {/* Delete functionality could be added here with a server action */}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

// Wrapper card for the table
function Card({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow">
            {children}
        </div>
    );
}
