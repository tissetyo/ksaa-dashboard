'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ConsultationMethodSelector } from '@/components/booking/ConsultationMethodSelector';
import { checkAvailabilityAction, checkMonthAvailabilityAction } from '@/lib/actions/availability';
import { completeBooking } from '@/lib/actions/booking';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Video, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
    { id: 1, name: 'Choose Method', icon: Video },
    { id: 2, name: 'Select Date & Time', icon: CalendarIcon },
    { id: 3, name: 'Confirmation', icon: CheckCircle2 },
];

interface ConsultationBookingClientProps {
    product: any;
    defaultEmail: string;
    defaultPhone: string;
}

export function ConsultationBookingClient({
    product,
    defaultEmail,
    defaultPhone,
}: ConsultationBookingClientProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [consultationData, setConsultationData] = useState<{
        type: 'GOOGLE_MEET' | 'WHATSAPP_CALL';
        phone?: string;
        email?: string;
    }>({ type: 'GOOGLE_MEET', email: defaultEmail });
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Load availability for the current month when step 2 is visible
    useEffect(() => {
        if (currentStep === 2) {
            loadMonthAvailability(currentMonth);
        }
    }, [currentStep, currentMonth]);

    const loadMonthAvailability = async (month: Date) => {
        const result = await checkMonthAvailabilityAction(
            product.id,
            month.getFullYear(),
            month.getMonth()
        );
        if (result.success) {
            setAvailableDates(result.availableDates || []);
        }
    };

    // Helper function to format date as YYYY-MM-DD without timezone conversion
    const formatDateOnly = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const loadSlots = async (date: Date) => {
        setIsLoadingSlots(true);
        setSelectedSlot(null);
        const result = await checkAvailabilityAction(product.id, formatDateOnly(date));
        if (result.success) {
            setAvailableSlots(result.slots || []);
        }
        setIsLoadingSlots(false);
    };

    const handleDateChange = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date) {
            loadSlots(date);
        }
    };

    const handleNext = () => {
        if (currentStep === 1) {
            // Validate consultation method
            if (consultationData.type === 'GOOGLE_MEET' && !consultationData.email) {
                toast.error('Please provide your email address');
                return;
            }
            if (consultationData.type === 'WHATSAPP_CALL' && !consultationData.phone) {
                toast.error('Please provide your WhatsApp number');
                return;
            }
            setCurrentStep(2);
            if (selectedDate) {
                loadSlots(selectedDate);
            }
        } else if (currentStep === 2) {
            if (!selectedDate || !selectedSlot) {
                toast.error('Please select a date and time');
                return;
            }
            handleBooking();
        }
    };

    const handleBooking = async () => {
        if (!selectedDate || !selectedSlot) return;

        setIsBooking(true);
        try {
            const result = await completeBooking({
                productId: product.id,
                appointmentDate: formatDateOnly(selectedDate),
                timeSlot: selectedSlot,
                paymentAmount: 0,
                paymentType: 'FULL',
                consultationType: consultationData.type,
                consultationPhone: consultationData.phone,
                consultationEmail: consultationData.email,
            });

            if (result.success) {
                setCurrentStep(3);
                toast.success('Consultation booked successfully!');
            }
        } catch (error) {
            toast.error('Booking failed. Please try again.');
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <Button asChild variant="ghost" className="mb-4">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">Book Free Consultation</h1>
                <p className="text-gray-600 mt-2">
                    30-minute consultation to discuss your health concerns
                </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-center relative">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className="flex flex-col items-center z-10">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${currentStep >= step.id
                                        ? 'bg-[#008E7E] text-white'
                                        : 'bg-gray-200 text-gray-600'
                                        }`}
                                >
                                    <step.icon className="h-6 w-6" />
                                </div>
                                <span className="text-sm mt-2 text-center font-medium">{step.name}</span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div className="flex items-center" style={{ width: '200px', marginTop: '-24px' }}>
                                    <div
                                        className={`h-1 w-full transition-colors ${currentStep > step.id ? 'bg-[#008E7E]' : 'bg-gray-200'
                                            }`}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            {currentStep === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Choose Consultation Method</CardTitle>
                        <CardDescription>
                            Select how you'd like to have your consultation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ConsultationMethodSelector
                            defaultEmail={defaultEmail}
                            defaultPhone={defaultPhone}
                            onMethodChange={setConsultationData}
                        />
                        <div className="mt-6 flex justify-end">
                            <Button onClick={handleNext} size="lg">
                                Continue
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Date</CardTitle>
                            <CardDescription>
                                <span className="inline-flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span className="text-xs">Available slots</span>
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateChange}
                                month={currentMonth}
                                onMonthChange={setCurrentMonth}
                                disabled={(date) => date < new Date() || date.getDay() === 0}
                                className="rounded-md border"
                                modifiers={{
                                    available: availableDates.map(d => new Date(d + 'T12:00:00'))
                                }}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Available Times</CardTitle>
                            <CardDescription>
                                {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingSlots ? (
                                <div className="text-center py-8 text-gray-500">
                                    Loading available times...
                                </div>
                            ) : availableSlots.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No available times for this date
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {availableSlots.map((slot) => (
                                        <Button
                                            key={slot}
                                            variant={selectedSlot === slot ? 'default' : 'outline'}
                                            onClick={() => setSelectedSlot(slot)}
                                            className="justify-start"
                                        >
                                            <Clock className="mr-2 h-4 w-4" />
                                            {slot}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="md:col-span-2 flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentStep(1)}>
                            Back
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={!selectedDate || !selectedSlot || isBooking}
                            size="lg"
                        >
                            {isBooking ? 'Booking...' : 'Confirm Booking'}
                        </Button>
                    </div>
                </div>
            )}

            {currentStep === 3 && (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Consultation Booked!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Your free consultation has been scheduled successfully.
                        </p>

                        {/* Booking Summary */}
                        <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
                            <h3 className="font-semibold text-gray-900 mb-4 text-center">Booking Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Service:</span>
                                    <span className="font-medium text-gray-900">{product.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Date:</span>
                                    <span className="font-medium text-gray-900">
                                        {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Time:</span>
                                    <span className="font-medium text-gray-900">{selectedSlot}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Method:</span>
                                    <span className="font-medium text-gray-900">
                                        {consultationData.type === 'GOOGLE_MEET' ? 'Google Meet' : 'WhatsApp Call'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#008E7E]/10 p-4 rounded-lg mb-6">
                            <p className="font-medium text-gray-900 mb-2">What's Next?</p>
                            {consultationData.type === 'GOOGLE_MEET' ? (
                                <p className="text-sm text-gray-700">
                                    You'll receive a Google Meet link at{' '}
                                    <span className="font-medium">{consultationData.email}</span> before your
                                    appointment.
                                </p>
                            ) : (
                                <p className="text-sm text-gray-700">
                                    Our staff will call you on WhatsApp at{' '}
                                    <span className="font-medium">{consultationData.phone}</span> at your
                                    scheduled time.
                                </p>
                            )}
                        </div>
                        <Button onClick={() => router.push('/dashboard')} size="lg">
                            Return to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
