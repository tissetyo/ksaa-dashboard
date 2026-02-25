'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CreditCard, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ServiceCard({ product }: { product: any }) {
    return (
        <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader>
                <CardTitle className="text-[#008E7E]">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {product.description}
                </p>

                <div className="space-y-2 mb-6 mt-auto">
                    {product.durationMinutes && (
                        <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-2" />
                            {product.durationMinutes} minutes
                        </div>
                    )}
                    {product.showPrice !== false && (
                        <>
                            <div className="flex items-center text-sm font-semibold text-gray-900">
                                <CreditCard className="h-4 w-4 mr-2" />
                                {product.priceMYR != null && product.priceMYR > 0
                                    ? `RM ${product.priceMYR.toFixed(2)}`
                                    : 'FREE'}
                            </div>
                            {product.depositPercentage != null && product.depositPercentage > 0 && (
                                <p className="text-xs text-[#008E7E] font-medium">
                                    Deposit option available ({product.depositPercentage}%)
                                </p>
                            )}
                        </>
                    )}
                </div>


                <Button asChild className="w-full">
                    <Link href={`/book?service=${product.id}`}>
                        Book Appointment
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
