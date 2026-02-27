'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { submitReview } from '@/lib/actions/review';
import { Loader2, CheckCircle2, Calendar, Clock, MapPin, Video, MessageCircle, Building2, Home, Gift, Ticket, Copy } from 'lucide-react';
import { format } from 'date-fns';

interface ReviewFormProps {
    token: string;
    initialData: {
        serviceName: string;
        staffName?: string;
        patientName: string;
        appointmentDate: Date;
        timeSlot?: string;
        consultationType?: string | null;
        consultationAddress?: string | null;
        durationMinutes?: number;
        customerType?: string | null;
    };
    user?: {
        name?: string | null;
        email?: string | null;
    } | null;
}

export function ReviewForm({ token, initialData, user }: ReviewFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [couponData, setCouponData] = useState<{
        code: string;
        type: string;
        description: string;
    } | null>(null);

    // Form State
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewerName, setReviewerName] = useState(user?.name || initialData.patientName);

    // Derived state
    const isValid = rating > 0 && comment.length >= 3 && reviewerName.trim().length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValid) return;

        setIsSubmitting(true);
        try {
            const result = await submitReview({
                token,
                rating,
                comment,
                reviewerName,
            });

            if (result.success) {
                setIsSuccess(true);
                if (result.coupon) {
                    setCouponData(result.coupon);
                }
                toast.success('Thank you for your review!');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyCouponCode = () => {
        if (couponData?.code) {
            navigator.clipboard.writeText(couponData.code);
            toast.success('Coupon code copied!');
        }
    };

    if (isSuccess) {
        return (
            <Card className="w-full max-w-lg mx-auto shadow-lg border-2 border-green-100 bg-white/50 backdrop-blur-sm">
                <CardContent className="pt-10 pb-10 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Thank You!</h2>
                    <p className="text-gray-600 max-w-xs mx-auto">
                        Your review has been submitted successfully. We appreciate your feedback!
                    </p>

                    {/* Reward Coupon Ticket */}
                    {couponData && (
                        <div className="w-full mt-6">
                            <div className="relative bg-gradient-to-r from-[#008E7E] to-[#00b39e] rounded-2xl p-6 text-white overflow-hidden">
                                {/* Decorative circles for ticket look */}
                                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full" />
                                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full" />

                                <div className="flex items-center gap-2 mb-3">
                                    <Gift className="h-5 w-5" />
                                    <span className="text-sm font-semibold uppercase tracking-wide opacity-90">
                                        {couponData.type === 'FREE_STEMCELLS' ? '🌱 Reward Coupon' : '🎁 Reward Coupon'}
                                    </span>
                                </div>

                                <p className="text-lg font-bold mb-1">{couponData.description}</p>

                                <div className="flex items-center gap-2 mt-4 bg-white/20 rounded-lg px-3 py-2">
                                    <Ticket className="h-4 w-4" />
                                    <span className="font-mono text-sm font-bold flex-1 tracking-wider">
                                        {couponData.code.toUpperCase().slice(0, 12)}
                                    </span>
                                    <button
                                        onClick={copyCouponCode}
                                        className="p-1 hover:bg-white/20 rounded transition-colors"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>

                                <p className="text-xs opacity-80 mt-3">
                                    {couponData.type === 'FREE_STEMCELLS'
                                        ? 'Show this coupon to the staff at the clinic to redeem your free stemcells service.'
                                        : 'Show this coupon to the staff at the clinic to receive your free item.'}
                                </p>
                            </div>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        onClick={() => router.push('/')}
                        className="mt-4"
                    >
                        Return Home
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-lg mx-auto shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2 pb-2">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Rate Your Experience
                </CardTitle>
                <CardDescription className="text-base">
                    How was your <strong>{initialData.serviceName}</strong>?
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 pt-4">
                    {/* Reward Banner */}
                    {initialData.customerType && (
                        <div className={`rounded-lg p-4 border ${initialData.customerType === 'POTENTIAL_CUSTOMER'
                            ? 'bg-[#008E7E]/5 border-[#008E7E]/20'
                            : 'bg-green-50 border-green-200'
                            }`}>
                            <div className="flex items-center gap-2 mb-1">
                                <Gift className="h-4 w-4 text-[#008E7E]" />
                                <span className="text-sm font-semibold text-gray-800">
                                    {initialData.customerType === 'POTENTIAL_CUSTOMER'
                                        ? '🌱 Leave a review and get free 5 million stemcells!'
                                        : '🎁 Leave a review and get a free health drink or voucher!'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 ml-6">
                                Submit your honest feedback below to receive your reward coupon.
                            </p>
                        </div>
                    )}

                    {/* Rating Section */}
                    <div className="flex flex-col items-center space-y-3 py-2">
                        <StarRating
                            rating={rating}
                            onRatingChange={setRating}
                            className="scale-110"
                        />
                        <p className="text-sm font-medium text-muted-foreground h-5">
                            {rating === 1 && "Poor"}
                            {rating === 2 && "Fair"}
                            {rating === 3 && "Good"}
                            {rating === 4 && "Very Good"}
                            {rating === 5 && "Excellent!"}
                        </p>
                    </div>

                    {/* Reviewer Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                            id="name"
                            value={reviewerName}
                            onChange={(e) => setReviewerName(e.target.value)}
                            placeholder="Enter your name"
                            className="bg-white/50"
                        />
                        <p className="text-xs text-muted-foreground">
                            Displayed publicly as identifying the reviewer.
                        </p>
                    </div>

                    {/* Comment Section */}
                    <div className="space-y-2">
                        <Label htmlFor="comment">Your Feedback</Label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us what you liked or how we can improve..."
                            className="min-h-[120px] resize-none bg-white/50"
                        />
                        <p className="text-xs text-right text-muted-foreground">
                            {comment.length}/3 characters minimum
                        </p>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-2">
                    <Button
                        type="submit"
                        className="w-full h-11 text-base font-medium shadow-md transition-all hover:shadow-lg"
                        disabled={!isValid || isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Review'
                        )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground w-full">
                        {initialData.customerType
                            ? 'Submit to receive your reward coupon!'
                            : 'Your review helps us improve our services.'}
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
