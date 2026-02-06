import { db } from '@/lib/db';
import { BookingFlow } from '@/components/booking/BookingFlow';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BookingPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const products = await db.product.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight sm:text-5xl">
                        Book Your STEMCARE Treatment
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Secure your session in just a few minutes.
                    </p>
                </div>
                <BookingFlow products={products} />
            </div>
        </div>
    );
}
