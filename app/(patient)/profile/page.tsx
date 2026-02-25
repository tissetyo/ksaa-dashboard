import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User, Phone, MapPin, Calendar, Activity, AlertCircle } from 'lucide-react';
import { ProfileCompletionBar } from '@/components/patient/ProfileCompletionBar';

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    const patient = await db.patient.findUnique({
        where: { userId: session.user.id },
    });

    if (!patient) {
        redirect('/profile/complete');
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">My Profile</h1>
                <Button asChild variant="outline">
                    <Link href="/profile/edit">Edit Profile</Link>
                </Button>
            </div>

            {/* Profile Completion Bar */}
            <ProfileCompletionBar patient={patient} compact={false} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Basic Info */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center">
                            <User className="mr-2 h-5 w-5 text-[#008E7E]" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="font-medium">{patient.fullName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Blood Type</p>
                                <p className="font-medium">{patient.bloodType.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Age</p>
                                <p className="font-medium">{patient.age || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">{patient.phone}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium">{patient.address || 'Not specified'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Physical Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center">
                            <Activity className="mr-2 h-5 w-5 text-[#008E7E]" />
                            Physical Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Height</p>
                            <p className="font-medium">{patient.heightCm ? `${patient.heightCm} cm` : 'Not specified'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Weight</p>
                            <p className="font-medium">{patient.weightKg ? `${patient.weightKg} kg` : 'Not specified'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center text-red-600">
                            <AlertCircle className="mr-2 h-5 w-5" />
                            Emergency Contact
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium">{patient.emergencyContactName || 'Not specified'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{patient.emergencyContactPhone || 'Not specified'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Medical History */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center">
                            <Calendar className="mr-2 h-5 w-5 text-[#008E7E]" />
                            Medical History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Medical Allergies</p>
                            <div className="p-3 bg-gray-50 rounded-md">
                                <p className="text-sm">{patient.medicalAllergies || 'No allergies recorded'}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Current Medications</p>
                            <div className="p-3 bg-gray-50 rounded-md">
                                <p className="text-sm">{patient.currentMedications || 'No medications recorded'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
