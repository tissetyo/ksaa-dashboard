'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Check,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    Heart,
    CheckCircle2,
    MessageCircle,
    Video,
    Building2,
    Home,
    User,
    Phone,
    MapPin,
    FileText,
    Stethoscope,
    Pill,
    Sparkles,
    Info,
    Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { checkAvailabilityAction, checkMonthAvailabilityAction } from '@/lib/actions/availability';
import { completeBooking } from '@/lib/actions/booking';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { HealthStatementForm } from './HealthStatementForm';
import { toast } from 'sonner';

const STEPS = [
    { id: 1, name: 'Select Service', icon: CalendarIcon },
    { id: 2, name: 'Schedule', icon: Clock },
    { id: 3, name: 'Health Info', icon: Heart },
    { id: 4, name: 'Confirm', icon: CheckCircle2 },
];

const CONSULTATION_OPTIONS = [
    {
        type: 'WHATSAPP_CALL',
        label: 'WhatsApp Call',
        description: 'We will call you on WhatsApp',
        icon: MessageCircle,
        color: 'text-green-600',
        bg: 'bg-green-50 border-green-200 hover:border-green-400',
        activeBg: 'border-green-500 bg-green-50',
    },
    {
        type: 'GOOGLE_MEET',
        label: 'Online (Google Meet)',
        description: 'Video call link will be sent',
        icon: Video,
        color: 'text-blue-600',
        bg: 'bg-blue-50 border-blue-200 hover:border-blue-400',
        activeBg: 'border-blue-500 bg-blue-50',
    },
    {
        type: 'IN_PERSON',
        label: 'Visit Our Office',
        description: 'Come to our clinic in KL',
        icon: Building2,
        color: 'text-[#008E7E]',
        bg: 'bg-teal-50 border-teal-200 hover:border-teal-400',
        activeBg: 'border-[#008E7E] bg-teal-50',
    },
    {
        type: 'HOME_VISIT',
        label: 'Home Visit',
        description: 'Our team visits your home',
        icon: Home,
        color: 'text-orange-600',
        bg: 'bg-orange-50 border-orange-200 hover:border-orange-400',
        activeBg: 'border-orange-500 bg-orange-50',
    },
];

interface BookingFlowProps {
    products: any[];
    savedHomeAddress?: string | null;
    patientProfile?: {
        fullName?: string;
        phone?: string;
        dateOfBirth?: string;
        homeAddress?: string;
        homeCity?: string;
        homeState?: string;
        homePostcode?: string;
    } | null;
}

export function BookingFlow({ products, savedHomeAddress, patientProfile }: BookingFlowProps) {
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
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Consultation type
    const [consultationType, setConsultationType] = useState<string | null>(null);
    const [whatsappPhone, setWhatsappPhone] = useState('');
    const [meetEmail, setMeetEmail] = useState('');
    // Home visit address (4 fields synced to profile)
    const [hvAddress, setHvAddress] = useState(patientProfile?.homeAddress || '');
    const [hvCity, setHvCity] = useState(patientProfile?.homeCity || '');
    const [hvState, setHvState] = useState(patientProfile?.homeState || '');
    const [hvPostcode, setHvPostcode] = useState(patientProfile?.homePostcode || '');
    // Clinic locations (for IN_PERSON)
    const [clinicLocations, setClinicLocations] = useState<any[]>([]);
    const [selectedClinicId, setSelectedClinicId] = useState('');

    // Health statement
    const [healthData, setHealthData] = useState({
        healthCondition: '',
        onMedication: false,
        medicationDetails: '',
    });

    // Confirmation step extras
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [consentChecked, setConsentChecked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (selectedProduct && currentStep === 2) {
            loadMonthAvailability(currentMonth);
        }
    }, [currentStep, currentMonth, selectedProduct]);

    const loadMonthAvailability = async (month: Date) => {
        if (!selectedProduct) return;
        const result = await checkMonthAvailabilityAction(selectedProduct.id, month.getFullYear(), month.getMonth());
        if (result.success) setAvailableDates(result.availableDates || []);
    };

    useEffect(() => {
        if (selectedProduct && selectedDate && currentStep === 2) loadSlots();
    }, [selectedDate, selectedProduct, currentStep]);

    const formatDateOnly = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const loadSlots = async () => {
        if (!selectedProduct || !selectedDate) return;
        setIsLoadingSlots(true);
        setSelectedSlot(null);
        const result = await checkAvailabilityAction(selectedProduct.id, formatDateOnly(selectedDate));
        if (result.success) setAvailableSlots(result.slots || []);
        setIsLoadingSlots(false);
    };

    const handleConfirmBooking = async () => {
        if (!selectedProduct || !selectedDate || !selectedSlot || !consultationType) return;

        if (!healthData.healthCondition.trim()) {
            toast.error('Please describe your current health condition.');
            return;
        }

        if (!consentChecked) {
            toast.error('Please agree to the terms to proceed.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Build consultationAddress
            let consultationAddress: string | undefined;
            if (consultationType === 'HOME_VISIT') {
                consultationAddress = [hvAddress, hvCity, hvState, hvPostcode].filter(Boolean).join(', ');
            } else if (consultationType === 'IN_PERSON') {
                const loc = clinicLocations.find(l => l.id === selectedClinicId);
                consultationAddress = loc ? `${loc.name}, ${loc.address}` : undefined;
            }

            const result = await completeBooking({
                productId: selectedProduct.id,
                appointmentDate: formatDateOnly(selectedDate),
                timeSlot: selectedSlot,
                paymentAmount: 0,
                paymentType: 'FULL',
                stripePaymentIntentId: undefined,
                consultationType: consultationType as any,
                consultationPhone: consultationType === 'WHATSAPP_CALL' ? whatsappPhone : undefined,
                consultationEmail: consultationType === 'GOOGLE_MEET' ? meetEmail : undefined,
                consultationAddress,
                healthCondition: healthData.healthCondition,
                onMedication: healthData.onMedication,
                medicationDetails: healthData.onMedication ? healthData.medicationDetails : undefined,
                additionalNotes: additionalNotes || undefined,
                // Home visit address fields for profile sync
                homeAddress: consultationType === 'HOME_VISIT' ? hvAddress : undefined,
                homeCity: consultationType === 'HOME_VISIT' ? hvCity : undefined,
                homeState: consultationType === 'HOME_VISIT' ? hvState : undefined,
                homePostcode: consultationType === 'HOME_VISIT' ? hvPostcode : undefined,
            });

            if (result.success) {
                setShowSuccessModal(true);
            }
        } catch {
            toast.error('Booking failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canGoToStep3 = selectedSlot && consultationType &&
        (consultationType !== 'WHATSAPP_CALL' || whatsappPhone.trim()) &&
        (consultationType !== 'GOOGLE_MEET' || meetEmail.trim()) &&
        (consultationType !== 'IN_PERSON' || selectedClinicId) &&
        (consultationType !== 'HOME_VISIT' || hvAddress.trim());

    const handleSelectConsultationType = (type: string) => {
        setConsultationType(type);
        setSelectedClinicId('');
        if (type === 'IN_PERSON' && clinicLocations.length === 0) {
            fetch('/api/clinic-locations').then(r => r.json()).then(d => {
                const locs = d.locations || [];
                setClinicLocations(locs);
                // Auto-select first location
                if (locs.length > 0) setSelectedClinicId(locs[0].id);
            });
        }
        if (type === 'HOME_VISIT') {
            // Pre-fill from profile if available
            if (patientProfile?.homeAddress && !hvAddress) {
                setHvAddress(patientProfile.homeAddress);
                setHvCity(patientProfile.homeCity || '');
                setHvState(patientProfile.homeState || '');
                setHvPostcode(patientProfile.homePostcode || '');
            }
        }
    };

    const getConsultationLabel = () => CONSULTATION_OPTIONS.find(o => o.type === consultationType)?.label || '';

    const getConsultationDetail = () => {
        if (consultationType === 'WHATSAPP_CALL') return whatsappPhone;
        if (consultationType === 'GOOGLE_MEET') return meetEmail;
        if (consultationType === 'IN_PERSON') {
            const loc = clinicLocations.find(l => l.id === selectedClinicId);
            return loc ? `${loc.name} — ${loc.address}` : '';
        }
        if (consultationType === 'HOME_VISIT') {
            return [hvAddress, hvCity, hvState, hvPostcode].filter(Boolean).join(', ');
        }
        return '';
    };

    // ── Left Info Panel ──────────────────────────────────────────────────
    const renderStepInfo = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-[#008E7E]/10 text-[#008E7E] rounded-full px-3 py-1 text-xs font-semibold mb-4">
                                <Sparkles className="h-3.5 w-3.5" />
                                Step 1 of 4
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Treatment</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Browse our range of STEMCARE services and select the treatment that best suits your needs.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-[#008E7E]/5 to-[#008E7E]/10 rounded-2xl p-5 border border-[#008E7E]/10">
                            <div className="flex items-start gap-3">
                                <div className="bg-[#008E7E]/15 rounded-xl p-2.5 flex-shrink-0">
                                    <Info className="h-5 w-5 text-[#008E7E]" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm mb-1">What to expect</p>
                                    <ul className="text-sm text-gray-600 space-y-1.5">
                                        <li className="flex items-start gap-2">
                                            <Check className="h-3.5 w-3.5 text-[#008E7E] mt-0.5 flex-shrink-0" />
                                            <span>Free consultation available</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-3.5 w-3.5 text-[#008E7E] mt-0.5 flex-shrink-0" />
                                            <span>Multiple consultation methods</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-3.5 w-3.5 text-[#008E7E] mt-0.5 flex-shrink-0" />
                                            <span>Flexible scheduling options</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-[#008E7E]/10 text-[#008E7E] rounded-full px-3 py-1 text-xs font-semibold mb-4">
                                <Clock className="h-3.5 w-3.5" />
                                Step 2 of 4
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Schedule Your Session</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Pick how you&apos;d like to meet us, then choose a date and time that works for you.
                            </p>
                        </div>

                        {/* Selected service recap */}
                        {selectedProduct && (
                            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Selected Service</p>
                                <div className="flex items-center gap-3">
                                    {selectedProduct.imageUrl && (
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                            <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold text-gray-900">{selectedProduct.name}</p>
                                        <p className="text-xs text-gray-500 line-clamp-1">{selectedProduct.description}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-5 border border-blue-100/80">
                            <div className="flex items-start gap-3">
                                <div className="bg-blue-100 rounded-xl p-2.5 flex-shrink-0">
                                    <Info className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm mb-1">Scheduling tips</p>
                                    <ul className="text-sm text-gray-600 space-y-1.5">
                                        <li>• Green dots indicate available dates</li>
                                        <li>• Slots are shown in your local time</li>
                                        <li>• Sundays are not available</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-[#008E7E]/10 text-[#008E7E] rounded-full px-3 py-1 text-xs font-semibold mb-4">
                                <Heart className="h-3.5 w-3.5" />
                                Step 3 of 4
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Health Information</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Help us understand your health better so we can prepare the most effective treatment for you.
                            </p>
                        </div>

                        {/* Booking recap */}
                        {selectedProduct && (
                            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Your Booking</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Stethoscope className="h-3.5 w-3.5 text-[#008E7E] flex-shrink-0" />
                                        <span className="text-gray-600">{selectedProduct.name}</span>
                                    </div>
                                    {selectedDate && (
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-3.5 w-3.5 text-[#008E7E] flex-shrink-0" />
                                            <span className="text-gray-600">{format(selectedDate, 'EEEE, MMM d, yyyy')}</span>
                                        </div>
                                    )}
                                    {selectedSlot && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5 text-[#008E7E] flex-shrink-0" />
                                            <span className="text-gray-600">{selectedSlot}</span>
                                        </div>
                                    )}
                                    {consultationType && (
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const Icon = CONSULTATION_OPTIONS.find(o => o.type === consultationType)?.icon || CalendarIcon;
                                                return <Icon className="h-3.5 w-3.5 text-[#008E7E] flex-shrink-0" />;
                                            })()}
                                            <span className="text-gray-600">{getConsultationLabel()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="bg-gradient-to-br from-rose-50 to-pink-50/50 rounded-2xl p-5 border border-rose-100/80">
                            <div className="flex items-start gap-3">
                                <div className="bg-rose-100 rounded-xl p-2.5 flex-shrink-0">
                                    <Shield className="h-5 w-5 text-rose-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm mb-1">Your data is safe</p>
                                    <p className="text-sm text-gray-600">
                                        All health information is kept strictly confidential and only shared with your assigned medical professional.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-[#008E7E]/10 text-[#008E7E] rounded-full px-3 py-1 text-xs font-semibold mb-4">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Step 4 of 4
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Review & Confirm</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Please review your booking details before confirming.
                            </p>
                        </div>

                        {/* Profile Summary */}
                        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                            <h4 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-[#008E7E]" /> Your Profile
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div><span className="text-gray-500">Name:</span> <strong>{patientProfile?.fullName || '—'}</strong></div>
                                <div><span className="text-gray-500">Phone:</span> <strong>{patientProfile?.phone || '—'}</strong></div>
                                {patientProfile?.dateOfBirth && (
                                    <div><span className="text-gray-500">DOB:</span> <strong>{patientProfile.dateOfBirth}</strong></div>
                                )}
                            </div>
                        </div>

                        {/* Booking Details */}
                        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                            <h4 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                                <CalendarIcon className="h-3.5 w-3.5 text-[#008E7E]" /> Booking Details
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Stethoscope className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-500">Service:</span>
                                    <strong>{selectedProduct?.name}</strong>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-500">Date:</span>
                                    <strong>{selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}</strong>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-500">Time:</span>
                                    <strong>{selectedSlot}</strong>
                                </div>
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const Icon = CONSULTATION_OPTIONS.find(o => o.type === consultationType)?.icon || CalendarIcon;
                                        return <Icon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />;
                                    })()}
                                    <span className="text-gray-500">Method:</span>
                                    <strong>{getConsultationLabel()}</strong>
                                </div>
                                {getConsultationDetail() && (
                                    <div className="flex items-start gap-2 ml-5">
                                        <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-600 text-xs">{getConsultationDetail()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Health Info Summary */}
                        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                            <h4 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                                <Heart className="h-3.5 w-3.5 text-[#008E7E]" /> Health Information
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-gray-500">Condition:</span>
                                    <p className="text-gray-800 mt-0.5">{healthData.healthCondition || '—'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">On Medication:</span>{' '}
                                    <strong>{healthData.onMedication ? 'Yes' : 'No'}</strong>
                                </div>
                                {healthData.onMedication && healthData.medicationDetails && (
                                    <div>
                                        <span className="text-gray-500">Medication:</span>
                                        <p className="text-gray-800 mt-0.5">{healthData.medicationDetails}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    // ── Right Action Panel ───────────────────────────────────────────────
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 lg:mb-6">Select Service</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {products.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    className={cn(
                                        'text-left rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md',
                                        selectedProduct?.id === p.id
                                            ? 'border-[#008E7E] bg-[#008E7E]/5 shadow-md'
                                            : 'border-gray-200 hover:border-[#008E7E]/40'
                                    )}
                                    onClick={() => setSelectedProduct(p)}
                                >
                                    {p.imageUrl && (
                                        <div className="w-full h-28 mb-3 rounded-lg overflow-hidden bg-gray-100">
                                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{p.name}</h3>
                                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{p.description}</p>
                                            {p.showPrice !== false && (
                                                <p className="text-sm font-semibold text-[#008E7E] mt-1">
                                                    {(p.priceMYR ?? 0) === 0 ? 'FREE' : `RM ${(p.priceMYR ?? 0).toFixed(2)}`}
                                                </p>
                                            )}
                                        </div>
                                        {selectedProduct?.id === p.id && (
                                            <div className="bg-[#008E7E] rounded-full p-1 flex-shrink-0 mt-1">
                                                <Check className="h-3.5 w-3.5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-0">Schedule</h3>

                        {/* Consultation Type */}
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-3">How would you like to meet us?</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {CONSULTATION_OPTIONS.map((opt) => {
                                    const Icon = opt.icon;
                                    const isActive = consultationType === opt.type;
                                    return (
                                        <button
                                            key={opt.type}
                                            type="button"
                                            onClick={() => handleSelectConsultationType(opt.type)}
                                            className={cn(
                                                'flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200',
                                                isActive ? opt.activeBg : opt.bg
                                            )}
                                        >
                                            <div className={cn('p-2 rounded-lg bg-white/80 flex-shrink-0', opt.color)}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-gray-800">{opt.label}</p>
                                                <p className="text-xs text-gray-500">{opt.description}</p>
                                            </div>
                                            {isActive && <Check className="h-4 w-4 text-[#008E7E] ml-auto flex-shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Consultation type extra fields */}
                            {consultationType === 'WHATSAPP_CALL' && (
                                <div className="mt-3 space-y-1">
                                    <Label className="text-sm">WhatsApp Number</Label>
                                    <Input placeholder="+60123456789" value={whatsappPhone} onChange={e => setWhatsappPhone(e.target.value)} className="focus-visible:ring-[#008E7E]" />
                                </div>
                            )}
                            {consultationType === 'GOOGLE_MEET' && (
                                <div className="mt-3 space-y-1">
                                    <Label className="text-sm">Your Email (for Meet link)</Label>
                                    <Input type="email" placeholder="you@email.com" value={meetEmail} onChange={e => setMeetEmail(e.target.value)} className="focus-visible:ring-[#008E7E]" />
                                </div>
                            )}
                            {consultationType === 'IN_PERSON' && (
                                <div className="mt-4 space-y-2">
                                    <Label className="text-sm font-semibold">Select Clinic Location</Label>
                                    {clinicLocations.length === 0 ? (
                                        <p className="text-sm text-gray-400">Loading locations...</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {clinicLocations.map(loc => (
                                                <button
                                                    key={loc.id}
                                                    type="button"
                                                    onClick={() => setSelectedClinicId(loc.id)}
                                                    className={`w-full text-left rounded-xl border-2 p-3 transition-all ${selectedClinicId === loc.id ? 'border-[#008E7E] bg-teal-50' : 'border-gray-200 hover:border-[#008E7E]/40'}`}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <p className="font-semibold text-sm">{loc.name}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{loc.address}, {loc.city}{loc.state ? `, ${loc.state}` : ''}</p>
                                                            {loc.mapLink && (
                                                                <a href={loc.mapLink} target="_blank" rel="noreferrer" className="text-xs text-[#008E7E] hover:underline mt-1 block" onClick={e => e.stopPropagation()}>
                                                                    📍 View on Maps
                                                                </a>
                                                            )}
                                                        </div>
                                                        {selectedClinicId === loc.id && <Check className="h-4 w-4 text-[#008E7E] flex-shrink-0 mt-0.5" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {consultationType === 'HOME_VISIT' && (
                                <div className="mt-4 space-y-3">
                                    <Label className="text-sm font-semibold">Home Visit Address</Label>
                                    <p className="text-xs text-gray-500">This address will also be saved to your profile for future visits.</p>
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Street address"
                                            value={hvAddress}
                                            onChange={e => setHvAddress(e.target.value)}
                                            className="focus-visible:ring-[#008E7E]"
                                        />
                                        <div className="grid grid-cols-3 gap-2">
                                            <Input
                                                placeholder="City"
                                                value={hvCity}
                                                onChange={e => setHvCity(e.target.value)}
                                                className="focus-visible:ring-[#008E7E]"
                                            />
                                            <Input
                                                placeholder="State"
                                                value={hvState}
                                                onChange={e => setHvState(e.target.value)}
                                                className="focus-visible:ring-[#008E7E]"
                                            />
                                            <Input
                                                placeholder="Postcode"
                                                value={hvPostcode}
                                                onChange={e => setHvPostcode(e.target.value)}
                                                className="focus-visible:ring-[#008E7E]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Date & Time */}
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-3">Select Date & Time</h4>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        month={currentMonth}
                                        onMonthChange={setCurrentMonth}
                                        disabled={(date) => date < new Date() || date.getDay() === 0}
                                        className="rounded-xl border w-full"
                                        modifiers={{ available: availableDates.map(d => new Date(d + 'T12:00:00')) }}
                                    />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <h5 className="text-sm font-medium text-gray-700">
                                        Available slots for {selectedDate ? format(selectedDate, 'PP') : ''}
                                    </h5>
                                    {isLoadingSlots ? (
                                        <p className="text-sm text-gray-400">Loading...</p>
                                    ) : availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2">
                                            {availableSlots.map((slot) => (
                                                <Button
                                                    key={slot}
                                                    type="button"
                                                    variant={selectedSlot === slot ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={selectedSlot === slot ? 'bg-[#008E7E] hover:bg-[#008E7E]/90' : ''}
                                                >
                                                    {slot}
                                                </Button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400">No slots available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Health Info</h3>
                        <HealthStatementForm data={healthData} onChange={setHealthData} />
                    </div>
                );

            case 4:
                // Confirmation / Review step — on desktop the summaries are in the left panel
                // On mobile we show them inline
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-0">Confirm Booking</h3>

                        {/* Mobile-only: show summary sections that are in the left panel on desktop */}
                        <div className="lg:hidden space-y-4">
                            {/* Profile Summary */}
                            <div className="bg-gray-50 rounded-xl p-4 border">
                                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <User className="h-4 w-4 text-[#008E7E]" /> Your Profile
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                    <div><span className="text-gray-500">Name:</span> <strong>{patientProfile?.fullName || '—'}</strong></div>
                                    <div><span className="text-gray-500">Phone:</span> <strong>{patientProfile?.phone || '—'}</strong></div>
                                    {patientProfile?.dateOfBirth && (
                                        <div><span className="text-gray-500">DOB:</span> <strong>{patientProfile.dateOfBirth}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* Booking Details */}
                            <div className="bg-gray-50 rounded-xl p-4 border">
                                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-[#008E7E]" /> Booking Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Stethoscope className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-500">Service:</span>
                                        <strong>{selectedProduct?.name}</strong>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-500">Date:</span>
                                        <strong>{selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}</strong>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-500">Time:</span>
                                        <strong>{selectedSlot}</strong>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const Icon = CONSULTATION_OPTIONS.find(o => o.type === consultationType)?.icon || CalendarIcon;
                                            return <Icon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />;
                                        })()}
                                        <span className="text-gray-500">Method:</span>
                                        <strong>{getConsultationLabel()}</strong>
                                    </div>
                                    {getConsultationDetail() && (
                                        <div className="flex items-start gap-2 ml-5">
                                            <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-600 text-xs">{getConsultationDetail()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Health Conditions Summary */}
                            <div className="bg-gray-50 rounded-xl p-4 border">
                                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-[#008E7E]" /> Health Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-500">Current Condition:</span>
                                        <p className="text-gray-800 mt-0.5">{healthData.healthCondition || '—'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">On Medication:</span>{' '}
                                        <strong>{healthData.onMedication ? 'Yes' : 'No'}</strong>
                                    </div>
                                    {healthData.onMedication && healthData.medicationDetails && (
                                        <div>
                                            <span className="text-gray-500">Medication Details:</span>
                                            <p className="text-gray-800 mt-0.5">{healthData.medicationDetails}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional Notes — visible on all sizes */}
                        <div>
                            <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-[#008E7E]" /> Additional Notes (Optional)
                            </Label>
                            <Textarea
                                placeholder="Any additional information you'd like to share with us..."
                                value={additionalNotes}
                                onChange={e => setAdditionalNotes(e.target.value)}
                                className="focus-visible:ring-[#008E7E] min-h-[80px]"
                            />
                        </div>

                        {/* Consent Checkbox */}
                        <div className="bg-[#008E7E]/5 border border-[#008E7E]/20 rounded-xl p-4">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={consentChecked}
                                    onChange={e => setConsentChecked(e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#008E7E] focus:ring-[#008E7E]"
                                />
                                <div>
                                    <p className="text-sm text-gray-700 font-medium">
                                        I confirm that the information provided is accurate and I consent to the booking terms.
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        By proceeding, you agree to our terms of service and privacy policy.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="w-full py-6 px-4">
            {/* Step Progress */}
            <div className="max-w-3xl mx-auto mb-8 lg:mb-10">
                <div className="flex items-center justify-between relative">
                    {STEPS.map((step) => (
                        <div key={step.id} className="flex flex-col items-center z-10 flex-1">
                            <div className={cn(
                                'w-9 h-9 rounded-full flex items-center justify-center border-2 mb-1.5 bg-white transition-all duration-300',
                                currentStep > step.id
                                    ? 'border-[#008E7E] bg-[#008E7E] text-white'
                                    : currentStep === step.id
                                        ? 'border-[#008E7E] text-[#008E7E]'
                                        : 'border-gray-300 text-gray-300'
                            )}>
                                {currentStep > step.id ? <Check className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
                            </div>
                            <span className={cn(
                                'text-xs font-medium hidden sm:block',
                                currentStep >= step.id ? 'text-[#008E7E]' : 'text-gray-400'
                            )}>
                                {step.name}
                            </span>
                        </div>
                    ))}
                    <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 -z-0" />
                    <div
                        className="absolute top-4 left-0 h-0.5 bg-[#008E7E] transition-all duration-500 -z-0"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    />
                </div>
            </div>

            {/* Split Layout: Info (left) + Actions (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 items-start">
                {/* Left Info Panel — hidden on mobile */}
                <div className="hidden lg:block lg:col-span-4 xl:col-span-4">
                    <div className="sticky top-8 bg-gradient-to-b from-gray-50/80 to-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        {renderStepInfo()}
                    </div>
                </div>

                {/* Right Action Panel */}
                <div className="lg:col-span-8 xl:col-span-8">
                    <Card className="shadow-xl border-gray-100 rounded-2xl">
                        <CardContent className="p-5 sm:p-8">
                            {renderStepContent()}

                            {/* Navigation */}
                            <div className="mt-8 flex justify-between items-center">
                                {currentStep > 1 ? (
                                    <Button variant="outline" onClick={() => setCurrentStep(s => s - 1)}>
                                        <ChevronLeft className="mr-1 h-4 w-4" /> Back
                                    </Button>
                                ) : <div />}

                                {currentStep === 1 && (
                                    <Button
                                        disabled={!selectedProduct}
                                        onClick={() => setCurrentStep(2)}
                                        className="bg-[#008E7E] hover:bg-[#008E7E]/90"
                                    >
                                        Next <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                )}
                                {currentStep === 2 && (
                                    <Button
                                        disabled={!canGoToStep3}
                                        onClick={() => setCurrentStep(3)}
                                        className="bg-[#008E7E] hover:bg-[#008E7E]/90"
                                    >
                                        Next: Health Info <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                )}
                                {currentStep === 3 && (
                                    <Button
                                        disabled={!healthData.healthCondition.trim()}
                                        onClick={() => setCurrentStep(4)}
                                        className="bg-[#008E7E] hover:bg-[#008E7E]/90"
                                    >
                                        Next: Review & Confirm <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                )}
                                {currentStep === 4 && (
                                    <Button
                                        disabled={!consentChecked || isSubmitting}
                                        onClick={handleConfirmBooking}
                                        className="bg-[#008E7E] hover:bg-[#008E7E]/90"
                                    >
                                        {isSubmitting ? 'Confirming...' : 'Confirm Appointment ✓'}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="sm:max-w-md text-center">
                    <DialogHeader>
                        <DialogTitle className="flex flex-col items-center gap-3">
                            <div className="bg-[#008E7E]/10 rounded-full p-4">
                                <CheckCircle2 className="h-12 w-12 text-[#008E7E]" />
                            </div>
                            <span className="text-xl">Booking Received! 🎉</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <p className="text-gray-600">
                            Your appointment for <strong>{selectedProduct?.name}</strong> has been submitted successfully.
                        </p>
                        <div className="bg-gray-50 rounded-xl p-3 text-sm text-left space-y-1">
                            <p><span className="text-gray-500">Date:</span> <strong>{selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}</strong></p>
                            <p><span className="text-gray-500">Time:</span> <strong>{selectedSlot}</strong></p>
                            <p><span className="text-gray-500">Method:</span> <strong>{getConsultationLabel()}</strong></p>
                        </div>
                        <p className="text-sm text-gray-500">
                            Our staff will review and confirm your booking shortly. We&apos;ll contact you once it&apos;s confirmed.
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        className="w-full bg-[#008E7E] hover:bg-[#008E7E]/90"
                    >
                        Go to Dashboard
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}
