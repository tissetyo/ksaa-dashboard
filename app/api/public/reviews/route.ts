import { NextResponse } from 'next/server';
import { getPublicReviews } from '@/lib/actions/review';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const staffId = searchParams.get('staffId') || undefined;
    const productId = searchParams.get('productId') || undefined; // 'service' alias?

    try {
        const reviews = await getPublicReviews({
            limit,
            offset,
            staffId,
            productId
        });

        return NextResponse.json(reviews, {
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow all origins for now (WordPress)
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    } catch (error) {
        console.error('Error fetching public reviews:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
