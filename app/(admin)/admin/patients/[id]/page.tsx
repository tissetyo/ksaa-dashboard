import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Activity,
    Heart,
    User,
    Phone,
    Mail,
    MapPin,
    AlertCircle,
    FileText,
    Shield,
    Home,
    CreditCard,
    Pill,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    NO_SHOW: 'bg-gray-100 text-gray-600',
};

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const _patient = await db.patient.findUnique({
        where: { id },
        include: {
            user: { select: { email: true, createdAt: true } },
            appointments: {
                include: { product: { select: { name: true } } },
                orderBy: { appointmentDate: 'desc' },
            },
        },
    });

    if (!_patient) notFound();
    const patient = _patient as any;

    const totalSpend = patient.appointments.reduce((acc: number, a: any) => acc + (a.totalAmountMYR || 0), 0);
    const completed = patient.appointments.filter((a: any) => a.status === 'COMPLETED').length;

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Back */}
            <div>
                <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
                    <Link href="/admin/patients">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Patients
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">{patient.fullName || 'Unnamed Patient'}</h1>
                <p className="text-muted-foreground">Patient since {format(new Date(patient.user.createdAt), 'MMMM yyyy')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stat cards */}
                {[
                    { label: 'Total Appointments', value: patient.appointments.length, icon: Calendar },
                    { label: 'Completed', value: completed, icon: Activity },
                    { label: 'Total Spend', value: `RM ${totalSpend.toFixed(2)}`, icon: CreditCard },
                ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-[#008E7E]/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-[#008E7E]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{value}</p>
                            <p className="text-xs text-gray-500">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <Card>
                    <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-[#008E7E]" /> Personal Information</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <Row icon={<User className="h-4 w-4 text-gray-400" />} label="Full Name" value={patient.fullName || '—'} />
                        {patient.salutation && <Row icon={<User className="h-4 w-4 text-gray-400" />} label="Salutation" value={patient.salutation} />}
                        <Row icon={<Phone className="h-4 w-4 text-gray-400" />} label="Phone" value={patient.phone || '—'} />
                        <Row icon={<Mail className="h-4 w-4 text-gray-400" />} label="Email" value={patient.user.email} />
                        {patient.icNumber && <Row icon={<CreditCard className="h-4 w-4 text-gray-400" />} label="IC Number" value={patient.icNumber} />}
                        {patient.dateOfBirth && <Row icon={<Calendar className="h-4 w-4 text-gray-400" />} label="Date of Birth" value={format(new Date(patient.dateOfBirth), 'd MMM yyyy')} />}
                        {patient.placeOfBirth && <Row icon={<MapPin className="h-4 w-4 text-gray-400" />} label="Place of Birth" value={patient.placeOfBirth} />}
                        {patient.gender && <Row icon={<User className="h-4 w-4 text-gray-400" />} label="Gender" value={patient.gender} />}
                        {patient.nationality && <Row icon={<Activity className="h-4 w-4 text-gray-400" />} label="Nationality" value={patient.nationality} />}
                        {patient.country && <Row icon={<MapPin className="h-4 w-4 text-gray-400" />} label="Country" value={patient.country} />}
                        {patient.maritalStatus && <Row icon={<Heart className="h-4 w-4 text-gray-400" />} label="Marital Status" value={patient.maritalStatus} />}
                        {patient.age && <Row icon={<Calendar className="h-4 w-4 text-gray-400" />} label="Age" value={String(patient.age)} />}
                        {patient.heightCm && <Row icon={<Activity className="h-4 w-4 text-gray-400" />} label="Height" value={`${patient.heightCm} cm`} />}
                        {patient.weightKg && <Row icon={<Activity className="h-4 w-4 text-gray-400" />} label="Weight" value={`${patient.weightKg} kg`} />}
                    </CardContent>
                </Card>

                {/* Medical Info */}
                <Card>
                    <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertCircle className="h-4 w-4 text-[#008E7E]" /> Medical Information</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {patient.bloodType && patient.bloodType !== 'UNKNOWN' && <Row icon={<Heart className="h-4 w-4 text-gray-400" />} label="Blood Type" value={patient.bloodType} />}
                        {patient.medicalAllergies && <Row icon={<AlertCircle className="h-4 w-4 text-gray-400" />} label="Allergies" value={patient.medicalAllergies} />}
                        {patient.medicalHistory && <Row icon={<FileText className="h-4 w-4 text-gray-400" />} label="Medical History" value={patient.medicalHistory} />}
                        {patient.currentMedications && <Row icon={<Pill className="h-4 w-4 text-gray-400" />} label="Current Medications" value={patient.currentMedications} />}
                        {patient.previousTreatments && <Row icon={<Activity className="h-4 w-4 text-gray-400" />} label="Previous Treatments" value={patient.previousTreatments} />}
                        {patient.additionalNotes && <Row icon={<FileText className="h-4 w-4 text-gray-400" />} label="Additional Notes" value={patient.additionalNotes} />}
                        {patient.interestedService && <Row icon={<Activity className="h-4 w-4 text-gray-400" />} label="Interested Service" value={patient.interestedService} />}
                        {patient.stemCellInterestQuantity && <Row icon={<Activity className="h-4 w-4 text-gray-400" />} label="Stem Cell Interest Qty" value={patient.stemCellInterestQuantity} />}
                        {patient.emergencyContactName && (
                            <Row icon={<Phone className="h-4 w-4 text-gray-400" />} label="Emergency Contact" value={`${patient.emergencyContactName} — ${patient.emergencyContactPhone || ''}`} />
                        )}
                        {!patient.bloodType && !patient.medicalAllergies && !patient.medicalHistory && !patient.currentMedications && <p className="text-gray-400">No medical information recorded</p>}
                    </CardContent>
                </Card>

                {/* General Address */}
                {patient.address && (
                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-[#008E7E]" /> Address</CardTitle></CardHeader>
                        <CardContent className="text-sm text-gray-600">
                            {patient.address}
                        </CardContent>
                    </Card>
                )}

                {/* Home Visit Address */}
                {patient.homeAddress && (
                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Home className="h-4 w-4 text-[#008E7E]" /> Home Visit Address</CardTitle></CardHeader>
                        <CardContent className="text-sm text-gray-600">
                            {[patient.homeAddress, patient.homeCity, patient.homeState, patient.homePostcode].filter(Boolean).join(', ')}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Appointment History */}
            <div>
                <h2 className="text-lg font-semibold mb-3">Appointment History</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {patient.appointments.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">No appointments yet</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="text-left font-medium text-gray-500 px-4 py-3">Service</th>
                                    <th className="text-left font-medium text-gray-500 px-4 py-3">Date</th>
                                    <th className="text-left font-medium text-gray-500 px-4 py-3">Time</th>
                                    <th className="text-left font-medium text-gray-500 px-4 py-3">Status</th>
                                    <th className="text-left font-medium text-gray-500 px-4 py-3">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {patient.appointments.map((appt: any) => (
                                    <tr key={appt.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{appt.product?.name || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {format(new Date(appt.appointmentDate), 'd MMM yyyy')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                {appt.timeSlot}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[appt.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {appt.totalAmountMYR ? `RM ${appt.totalAmountMYR.toFixed(2)}` : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0">{icon}</span>
            <div>
                <span className="text-xs text-gray-400 block">{label}</span>
                <span className="text-gray-700">{value}</span>
            </div>
        </div>
    );
}
