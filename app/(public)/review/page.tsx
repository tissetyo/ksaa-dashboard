import { notFound, redirect } from 'next/navigation';
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

    const { success, data, error, recent } = await getReviewByToken(token) as any;

    if (!success || !data) {
        if (error === 'ReviewSubmitted' && recent) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg mx-auto shadow-lg border-2 border-green-100 bg-white p-10 rounded-xl text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
                        <p className="text-gray-600">
                            Your review has been submitted successfully. We appreciate your feedback!
                        </p>
                        <a href="/" className="mt-6 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                            Return Home
                        </a>
                    </div>
                </div>
            );
        }

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

    // Login gate: redirect to login if not authenticated
    if (!session?.user) {
        redirect(`/login?callbackUrl=${encodeURIComponent(`/review?token=${token}`)}`);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-lg mb-8 text-center">
                <img src="/ksaa-logo.png" alt="KSAA STEMCARE" className="h-12 mx-auto mb-4" />
            </div>

            <ReviewForm
                token={token}
                initialData={{
                    serviceName: data.serviceName,
                    patientName: data.patientName,
                    appointmentDate: data.appointmentDate,
                    timeSlot: data.timeSlot,
                    consultationType: data.consultationType,
                    consultationAddress: data.consultationAddress,
                    durationMinutes: data.durationMinutes,
                    customerType: data.customerType,
                }}
                user={session?.user}
            />
        </div>
    );
}

