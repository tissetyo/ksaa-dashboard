import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { getAdminReviews } from '@/lib/actions/admin-review';
import { ReviewsClient } from '@/components/admin/ReviewsClient';

export default async function AdminReviewsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/admin-login');
    }

    const { reviews } = await getAdminReviews();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <ReviewsClient reviews={reviews || []} />
        </div>
    );
}
