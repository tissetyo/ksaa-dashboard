'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, User, Phone, Calendar, ChevronRight, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { CreatePatientModal } from '@/components/admin/CreatePatientModal';
import { Button } from '@/components/ui/button';

interface PatientRow {
    id: string;
    fullName: string | null;
    phone: string | null;
    createdAt: Date;
    _count: { appointments: number };
    user: { email: string };
}

export function PatientDirectoryClient({ patients }: { patients: PatientRow[] }) {
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const router = useRouter();

    const filtered = patients.filter(p => {
        const q = search.toLowerCase();
        return (
            p.fullName?.toLowerCase().includes(q) ||
            p.phone?.includes(q) ||
            p.user.email.toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedPatients = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, phone, or email..."
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value);
                            setCurrentPage(1); // Reset page on search
                        }}
                        className="pl-9"
                    />
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#008E7E] hover:bg-[#0a4f47] text-white whitespace-nowrap"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Patient
                </Button>
            </div>

            <div className="border rounded-xl overflow-hidden divide-y">
                {paginatedPatients.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm">No patients found</div>
                ) : (
                    paginatedPatients.map(patient => (
                        <button
                            key={patient.id}
                            onClick={() => router.push(`/admin/patients/${patient.id}`)}
                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left group"
                        >
                            <div className="h-10 w-10 rounded-full bg-[#008E7E]/10 flex items-center justify-center flex-shrink-0">
                                <User className="h-5 w-5 text-[#008E7E]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{patient.fullName || 'Unnamed Patient'}</span>
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                        {patient._count.appointments} appt{patient._count.appointments !== 1 ? 's' : ''}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 mt-0.5 text-xs text-gray-500 flex-wrap">
                                    {patient.phone && (
                                        <span className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" /> {patient.phone}
                                        </span>
                                    )}
                                    <span>{patient.user.email}</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Joined {format(new Date(patient.createdAt), 'MMM yyyy')}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                        </button>
                    ))
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-gray-50/50 px-4 py-3">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium text-gray-900">{startIndex + 1}</span> to <span className="font-medium text-gray-900">{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}</span> of <span className="font-medium text-gray-900">{filtered.length}</span> patients
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <CreatePatientModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSuccess={() => router.refresh()}
            />
        </div>
    );
}
