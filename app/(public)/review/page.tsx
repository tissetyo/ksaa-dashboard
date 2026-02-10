import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getReviewByToken } from '@/lib/actions/review';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Write a Review | KSAA',
    description: 'Share your feedback with us.',
    robots: {
        index: false,
        follow: false,
    },
};

interface ReviewPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
    const { token } = await searchParams;

    if (!token || typeof token !== 'string') {
        return notFound();
    }

    const { success, data, error } = await getReviewByToken(token);

    if (!success || !data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow max-w-md text-center">
                    <h1 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h1>
                    <p className="text-gray-600">{error || 'Invalid review link.'}</p>
                </div>
            </div>
        );
    }

    const session = await auth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-lg mb-8 text-center">
                {/* Logo or specialized header could go here */}
                {/* <div className="text-2xl font-bold tracking-tight mb-2">KSAA Dashboard</div> */}
            </div>

            <ReviewForm
                token={token}
                initialData={{
                    serviceName: data.serviceName,
                    patientName: data.patientName, // Pre-filled name from appointment
                    appointmentDate: data.appointmentDate
                }}
                user={session?.user}
            />
        </div>
    );
}
