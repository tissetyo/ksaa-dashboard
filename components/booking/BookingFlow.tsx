'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
    Check,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    CreditCard,
    CheckCircle2,
    Video
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { checkAvailabilityAction, checkMonthAvailabilityAction } from '@/lib/actions/availability';
import { createBookingIntent, completeBooking } from '@/lib/actions/booking';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentForm } from './PaymentForm';
import { ConsultationMethodSelector } from './ConsultationMethodSelector';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const STEPS = [
    { id: 1, name: 'Select Service', icon: CalendarIcon },
    { id: 2, name: 'Choose Time', icon: Clock },
    { id: 3, name: 'Payment', icon: CreditCard },
    { id: 4, name: 'Confirmation', icon: CheckCircle2 },
];

export function BookingFlow({ products }: { products: any[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialServiceId = searchParams.get('service');

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState<any>(
        products.find(p => p.id === initialServiceId) || null
    );
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [paymentType, setPaymentType] = useState<'FULL' | 'DEPOSIT'>('DEPOSIT');
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [bookingResult, setBookingResult] = useState<any>(null);
    const [consultationData, setConsultationData] = useState<{
        type: 'GOOGLE_MEET' | 'WHATSAPP_CALL';
        phone?: string;
        email?: string;
    } | null>(null);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Check if selected product is a free consultation
    const isFreeConsultation = selectedProduct?.priceMYR === 0 &&
        selectedProduct?.name?.toLowerCase().includes('consultation');

    // Load availability for the current month when step 2 is visible
    useEffect(() => {
        if (selectedProduct && currentStep === 2) {
            loadMonthAvailability(currentMonth);
        }
    }, [currentStep, currentMonth, selectedProduct]);

    const loadMonthAvailability = async (month: Date) => {
        if (!selectedProduct) return;
        const result = await checkMonthAvailabilityAction(
            selectedProduct.id,
            month.getFullYear(),
            month.getMonth()
        );
        if (result.success) {
            setAvailableDates(result.availableDates || []);
        }
    };

    // Load slots when date/product changes
    useEffect(() => {
        if (selectedProduct && selectedDate && currentStep === 2) {
            loadSlots();
        }
    }, [selectedDate, selectedProduct, currentStep]);

    // Helper function to format date as YYYY-MM-DD without timezone conversion
    const formatDateOnly = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const loadSlots = async () => {
        if (!selectedProduct || !selectedDate) return;
        setIsLoadingSlots(true);
        setSelectedSlot(null);
        const result = await checkAvailabilityAction(selectedProduct.id, formatDateOnly(selectedDate));
        if (result.success) {
            setAvailableSlots(result.slots || []);
        }
        setIsLoadingSlots(false);
    };

    const handleCreateIntent = async () => {
        if (!selectedProduct) return;

        const price = selectedProduct.priceMYR ?? 0;
        const depositPct = selectedProduct.depositPercentage ?? 0;

        // If product is free, skip payment and go directly to confirmation
        if (price === 0) {
            await handleFreeBooking();
            return;
        }

        const amount = paymentType === 'FULL'
            ? price
            : (price * (depositPct / 100));

        try {
            const { clientSecret } = await createBookingIntent(selectedProduct.id, amount);
            setClientSecret(clientSecret);
            setCurrentStep(3);
        } catch (error) {
            toast.error('Failed to initialize payment');
        }
    };

    const handleFreeBooking = async () => {
        if (!selectedProduct || !selectedDate || !selectedSlot) return;

        // Validate consultation data for free consultations
        if (isFreeConsultation && !consultationData) {
            toast.error('Please select a consultation method');
            return;
        }

        try {
            const result = await completeBooking({
                productId: selectedProduct.id,
                appointmentDate: formatDateOnly(selectedDate),
                timeSlot: selectedSlot,
                paymentAmount: 0,
                paymentType: 'FULL',
                stripePaymentIntentId: undefined,
                // Include consultation data if this is a free consultation
                consultationType: consultationData?.type,
                consultationPhone: consultationData?.phone,
                consultationEmail: consultationData?.email,
            });

            if (result.success) {
                setBookingResult(result);
                setCurrentStep(4);
                toast.success('Free appointment booked successfully!');
            }
        } catch (error) {
            toast.error('Booking failed. Please try again.');
        }
    };

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        if (!selectedProduct || !selectedDate || !selectedSlot) return;

        const price = selectedProduct.priceMYR ?? 0;
        const depositPct = selectedProduct.depositPercentage ?? 0;
        const amount = paymentType === 'FULL'
            ? price
            : (price * (depositPct / 100));

        try {
            const result = await completeBooking({
                productId: selectedProduct.id,
                appointmentDate: formatDateOnly(selectedDate),
                timeSlot: selectedSlot,
                paymentAmount: amount,
                paymentType,
                stripePaymentIntentId: paymentIntentId,
            });

            if (result.success) {
                setBookingResult(result);
                setCurrentStep(4);
            }
        } catch (error) {
            toast.error('Booking failed but payment was successful. Please contact support.');
        }
    };

    // Render Step Content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map((p) => (
                            <Card
                                key={p.id}
                                className={cn(
                                    "cursor-pointer transition-all hover:border-blue-500",
                                    selectedProduct?.id === p.id ? "border-2 border-blue-500 bg-[#0F665C]/10" : ""
                                )}
                                onClick={() => setSelectedProduct(p)}
                            >
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold">{p.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {(p.priceMYR ?? 0) === 0 ? 'FREE' : `RM ${(p.priceMYR ?? 0).toFixed(2)}`}
                                        </p>
                                    </div>
                                    {selectedProduct?.id === p.id && <Check className="text-[#0F665C]" />}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8">
                        {/* Consultation Method Selection for Free Consultations */}
                        {isFreeConsultation && (
                            <div>
                                <ConsultationMethodSelector
                                    defaultEmail=""
                                    defaultPhone=""
                                    onMethodChange={setConsultationData}
                                />
                                <div className="mt-6 border-t pt-6">
                                    <h4 className="font-medium text-lg mb-4">Select Date & Time</h4>
                                </div>
                            </div>
                        )}

                        {/* Date and Time Selection */}
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                                <div className="mb-2">
                                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        <span>Available slots</span>
                                    </span>
                                </div>
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    month={currentMonth}
                                    onMonthChange={setCurrentMonth}
                                    disabled={(date) => date < new Date() || date.getDay() === 0}
                                    className="rounded-md border"
                                    modifiers={{
                                        available: availableDates.map(d => new Date(d + 'T12:00:00'))
                                    }}
                                />
                            </div>
                            <div className="flex-1 space-y-4">
                                <h4 className="font-medium">Available Slots for {selectedDate ? format(selectedDate, 'PP') : ''}</h4>
                                {isLoadingSlots ? (
                                    <p>Loading slots...</p>
                                ) : availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {availableSlots.map((slot) => (
                                            <Button
                                                key={slot}
                                                variant={selectedSlot === slot ? 'default' : 'outline'}
                                                onClick={() => setSelectedSlot(slot)}
                                                className="w-full"
                                            >
                                                {slot}
                                            </Button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No slots available for this date.</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-bold mb-2">Booking Summary</h4>
                            <p className="text-sm">Service: {selectedProduct.name}</p>
                            <p className="text-sm">Date: {format(selectedDate!, 'PP')}</p>
                            <p className="text-sm">Time: {selectedSlot}</p>
                            <div className="mt-4 border-t pt-4">
                                <p className="font-bold">Total: {(selectedProduct.priceMYR ?? 0) === 0 ? 'FREE' : `RM ${(selectedProduct.priceMYR ?? 0).toFixed(2)}`}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-medium">Selected Payment: {paymentType === 'FULL' ? 'Full Payment' : `Deposit (${selectedProduct.depositPercentage ?? 0}%)`}</h4>
                            {clientSecret && (
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <PaymentForm
                                        amount={paymentType === 'FULL' ? (selectedProduct.priceMYR ?? 0) : ((selectedProduct.priceMYR ?? 0) * ((selectedProduct.depositPercentage ?? 0) / 100))}
                                        onPaymentSuccess={handlePaymentSuccess}
                                    />
                                </Elements>
                            )}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="text-center py-10 space-y-4">
                        <div className="flex justify-center">
                            <CheckCircle2 className="h-20 w-20 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold italic">KSA A STEMCARE | Appointment Confirmed!</h2>
                        <p className="text-gray-600">Your appointment for {selectedProduct.name} has been successfully scheduled.</p>
                        <div className="pt-6">
                            <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Stepper */}
            <div className="mb-12">
                <div className="flex items-center justify-between relative">
                    {STEPS.map((step, idx) => (
                        <div key={step.id} className="flex flex-col items-center z-10">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 bg-white transition-colors",
                                currentStep >= step.id ? "border-[#0F665C] text-[#0F665C]" : "border-gray-300 text-gray-300"
                            )}>
                                <step.icon className="h-5 w-5" />
                            </div>
                            <span className={cn(
                                "text-xs font-medium",
                                currentStep >= step.id ? "text-[#0F665C]" : "text-gray-500"
                            )}>
                                {step.name}
                            </span>
                        </div>
                    ))}
                    {/* Progress bar line */}
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-0" />
                    <div
                        className="absolute top-5 left-0 h-0.5 bg-[#0F665C] transition-all duration-300 -z-0"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    />
                </div>
            </div>

            <Card className="shadow-lg border-blue-50">
                <CardContent className="p-8">
                    {renderStepContent()}

                    <div className="mt-8 flex justify-between">
                        {currentStep > 1 && currentStep < 4 && (
                            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        )}
                        <div className="ml-auto">
                            {currentStep === 1 && (
                                <Button
                                    disabled={!selectedProduct}
                                    onClick={() => setCurrentStep(2)}
                                >
                                    Next
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            {currentStep === 2 && (
                                <div className="flex flex-col items-end gap-2">
                                    {(selectedProduct.priceMYR ?? 0) > 0 && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant={paymentType === 'DEPOSIT' ? 'default' : 'outline'}
                                                onClick={() => setPaymentType('DEPOSIT')}
                                            >
                                                Pay Deposit (RM {((selectedProduct.priceMYR ?? 0) * ((selectedProduct.depositPercentage ?? 0) / 100)).toFixed(2)})
                                            </Button>
                                            <Button
                                                variant={paymentType === 'FULL' ? 'default' : 'outline'}
                                                onClick={() => setPaymentType('FULL')}
                                            >
                                                Pay Full (RM {(selectedProduct.priceMYR ?? 0).toFixed(2)})
                                            </Button>
                                        </div>
                                    )}
                                    <Button
                                        disabled={!selectedSlot}
                                        onClick={handleCreateIntent}
                                        className="w-full mt-2"
                                    >
                                        {(selectedProduct.priceMYR ?? 0) === 0 ? 'Confirm Booking' : 'Proceed to Payment'}
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
