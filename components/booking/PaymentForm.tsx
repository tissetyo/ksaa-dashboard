'use client';

import { useState } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function PaymentForm({ onPaymentSuccess, amount }: {
    onPaymentSuccess: (paymentIntentId: string) => void,
    amount: number
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href,
            },
            redirect: 'if_required',
        });

        if (error) {
            toast.error(error.message || 'An unexpected error occurred.');
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            toast.success('Payment successful!');
            onPaymentSuccess(paymentIntent.id);
        }

        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            <Button
                type="submit"
                className="w-full"
                disabled={!stripe || isProcessing}
            >
                {isProcessing ? 'Processing...' : `Pay RM ${amount.toFixed(2)}`}
            </Button>
        </form>
    );
}
