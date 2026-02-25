'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Video, Phone, AlertCircle } from 'lucide-react';

interface ConsultationMethodSelectorProps {
    defaultEmail?: string;
    defaultPhone?: string;
    onMethodChange: (data: {
        type: 'GOOGLE_MEET' | 'WHATSAPP_CALL';
        phone?: string;
        email?: string;
    }) => void;
}

export function ConsultationMethodSelector({
    defaultEmail = '',
    defaultPhone = '',
    onMethodChange,
}: ConsultationMethodSelectorProps) {
    const [method, setMethod] = useState<'GOOGLE_MEET' | 'WHATSAPP_CALL'>('GOOGLE_MEET');
    const [email, setEmail] = useState(defaultEmail);
    const [phone, setPhone] = useState(defaultPhone);

    const handleMethodChange = (value: string) => {
        const newMethod = value as 'GOOGLE_MEET' | 'WHATSAPP_CALL';
        setMethod(newMethod);

        if (newMethod === 'GOOGLE_MEET') {
            onMethodChange({ type: newMethod, email });
        } else {
            onMethodChange({ type: newMethod, phone });
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        onMethodChange({ type: 'GOOGLE_MEET', email: newEmail });
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPhone = e.target.value;
        setPhone(newPhone);
        onMethodChange({ type: 'WHATSAPP_CALL', phone: newPhone });
    };

    return (
        <div className="space-y-6">

            <RadioGroup value={method} onValueChange={handleMethodChange}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Google Meet Option */}
                    <Card
                        className={`cursor-pointer transition-all ${method === 'GOOGLE_MEET'
                            ? 'ring-2 ring-[#008E7E] border-[#008E7E]'
                            : 'hover:border-gray-400'
                            }`}
                        onClick={() => handleMethodChange('GOOGLE_MEET')}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <RadioGroupItem value="GOOGLE_MEET" id="google-meet" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Video className="h-5 w-5 text-[#008E7E]" />
                                        <Label
                                            htmlFor="google-meet"
                                            className="text-base font-semibold cursor-pointer"
                                        >
                                            Google Meet
                                        </Label>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Video consultation via Google Meet. You'll receive a meeting link via email.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* WhatsApp Call Option */}
                    <Card
                        className={`cursor-pointer transition-all ${method === 'WHATSAPP_CALL'
                            ? 'ring-2 ring-green-600 border-green-600'
                            : 'hover:border-gray-400'
                            }`}
                        onClick={() => handleMethodChange('WHATSAPP_CALL')}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <RadioGroupItem value="WHATSAPP_CALL" id="whatsapp-call" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Phone className="h-5 w-5 text-green-600" />
                                        <Label
                                            htmlFor="whatsapp-call"
                                            className="text-base font-semibold cursor-pointer"
                                        >
                                            WhatsApp Call
                                        </Label>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Voice or video call via WhatsApp. Our staff will call you at your preferred time.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </RadioGroup>

            {/* Contact Information */}
            <Card className="bg-[#008E7E]/10 border-blue-200">
                <CardContent className="p-6">
                    {method === 'GOOGLE_MEET' ? (
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-[#008E7E] mt-0.5" />
                                <div className="flex-1">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        Confirm Your Email
                                    </Label>
                                    <p className="text-xs text-gray-600 mb-2">
                                        We'll send the Google Meet link to this email
                                    </p>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        placeholder="your.email@example.com"
                                        className="bg-white"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                <div className="flex-1">
                                    <Label htmlFor="phone" className="text-sm font-medium">
                                        Confirm Your WhatsApp Number
                                    </Label>
                                    <p className="text-xs text-gray-600 mb-2">
                                        Our staff will call this number at your scheduled time
                                    </p>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        placeholder="+60123456789"
                                        className="bg-white"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
