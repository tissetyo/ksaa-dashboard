import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { ConsultationBookingClient } from './ConsultationBookingClient';

export const dynamic = 'force-dynamic';

export default async function BookConsultationPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Get patient info
    const patient = await db.patient.findUnique({
        where: { userId: session.user.id },
        include: {
            user: {
                select: { email: true }
            }
        }
    });

    if (!patient) {
        redirect('/profile/complete');
    }

    // Get the Free Consultation product
    const consultationProduct = await db.product.findFirst({
        where: {
            name: 'Free Consultation',
            isActive: true
        }
    });

    if (!consultationProduct) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Service Unavailable</h1>
                    <p className="text-gray-600 mt-2">
                        Free consultation is currently unavailable. Please contact support.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <ConsultationBookingClient
            product={consultationProduct}
            defaultEmail={patient.user.email}
            defaultPhone={patient.phone || ''}
        />
    );
}
