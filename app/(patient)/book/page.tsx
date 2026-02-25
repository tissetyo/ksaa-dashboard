import { db } from '@/lib/db';
import { BookingFlow } from '@/components/booking/BookingFlow';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function BookingPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const [products, patient] = await Promise.all([
        db.product.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        }),
        db.patient.findUnique({
            where: { userId: session.user.id },
            select: {
                fullName: true,
                phone: true,
                dateOfBirth: true,
                homeAddress: true,
                homeCity: true,
                homeState: true,
                homePostcode: true,
            },
        }),
    ]);

    const patientProfile = patient
        ? {
            fullName: patient.fullName,
            phone: patient.phone,
            dateOfBirth: patient.dateOfBirth
                ? format(new Date(patient.dateOfBirth), 'd MMM yyyy')
                : undefined,
            homeAddress: patient.homeAddress ?? undefined,
            homeCity: patient.homeCity ?? undefined,
            homeState: patient.homeState ?? undefined,
            homePostcode: patient.homePostcode ?? undefined,
        }
        : null;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-[#008E7E] tracking-tight sm:text-5xl">
                        Book Your STEMCARE Treatment
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Secure your session in just a few minutes.
                    </p>
                </div>
                <BookingFlow products={products} patientProfile={patientProfile} />
            </div>
        </div>
    );
}
