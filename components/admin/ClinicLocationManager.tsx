'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, MapPin, ExternalLink, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface ClinicLocation {
    id: string;
    name: string;
    address: string;
    city: string;
    state?: string | null;
    postcode?: string | null;
    mapLink?: string | null;
    isActive: boolean;
    order: number;
}

interface ClinicLocationManagerProps {
    initialLocations: ClinicLocation[];
}

export function ClinicLocationManager({ initialLocations }: ClinicLocationManagerProps) {
    const [locations, setLocations] = useState<ClinicLocation[]>(initialLocations);
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ name: '', address: '', city: '', state: '', postcode: '', mapLink: '' });
    const [saving, setSaving] = useState(false);

    const handleAdd = async () => {
        if (!form.name || !form.address || !form.city) {
            toast.error('Name, address and city are required');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch('/api/admin/clinic-locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, order: locations.length }),
            });
            const data = await res.json();
            if (data.location) {
                setLocations(prev => [...prev, data.location]);
                setForm({ name: '', address: '', city: '', state: '', postcode: '', mapLink: '' });
                setAdding(false);
                toast.success('Clinic location added');
            }
        } catch {
            toast.error('Failed to add location');
        }
        setSaving(false);
    };

    const handleToggle = async (loc: ClinicLocation) => {
        const res = await fetch('/api/admin/clinic-locations', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: loc.id, isActive: !loc.isActive }),
        });
        const data = await res.json();
        if (data.location) {
            setLocations(prev => prev.map(l => l.id === loc.id ? data.location : l));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this clinic location?')) return;
        const res = await fetch(`/api/admin/clinic-locations?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            setLocations(prev => prev.filter(l => l.id !== id));
            toast.success('Location deleted');
        } else {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#008E7E]" />
                        Clinic Locations
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">Manage locations shown when patients book In-Person appointments</p>
                </div>
                <Button size="sm" onClick={() => setAdding(v => !v)} variant={adding ? 'outline' : 'default'} className={adding ? '' : 'bg-[#008E7E] hover:bg-[#008E7E]/90'}>
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Location
                </Button>
            </div>

            {adding && (
                <div className="border rounded-xl p-4 bg-gray-50 space-y-3">
                    <h4 className="font-medium text-sm">New Clinic Location</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Location Name *</Label>
                            <Input placeholder="e.g. KLCC Office" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">City *</Label>
                            <Input placeholder="e.g. Kuala Lumpur" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                        </div>
                        <div className="sm:col-span-2">
                            <Label className="text-xs">Full Address *</Label>
                            <Input placeholder="e.g. Unit 12-3, Tower B, KLCC, 50088" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">State</Label>
                            <Input placeholder="e.g. Selangor" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Postcode</Label>
                            <Input placeholder="e.g. 50088" value={form.postcode} onChange={e => setForm(f => ({ ...f, postcode: e.target.value }))} />
                        </div>
                        <div className="sm:col-span-2">
                            <Label className="text-xs">Google Maps Link (optional)</Label>
                            <Input placeholder="https://maps.google.com/..." value={form.mapLink} onChange={e => setForm(f => ({ ...f, mapLink: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={handleAdd} disabled={saving} className="bg-[#008E7E] hover:bg-[#008E7E]/90">
                            {saving ? 'Saving...' : 'Save Location'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {locations.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6">No clinic locations yet. Add one above.</p>
                )}
                {locations.map(loc => (
                    <div key={loc.id} className={`flex items-start gap-3 border rounded-xl p-4 ${loc.isActive ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                        <GripVertical className="h-5 w-5 text-gray-300 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">{loc.name}</span>
                                <Badge variant={loc.isActive ? 'default' : 'secondary'} className={loc.isActive ? 'bg-[#008E7E]/15 text-[#008E7E] border-none' : ''}>
                                    {loc.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{loc.address}, {loc.city}{loc.state ? `, ${loc.state}` : ''}{loc.postcode ? ` ${loc.postcode}` : ''}</p>
                            {loc.mapLink && (
                                <a href={loc.mapLink} target="_blank" rel="noreferrer" className="text-xs text-[#008E7E] flex items-center gap-1 mt-1 hover:underline">
                                    <ExternalLink className="h-3 w-3" /> View on Maps
                                </a>
                            )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => handleToggle(loc)} title={loc.isActive ? 'Deactivate' : 'Activate'} className="text-gray-400 hover:text-[#008E7E] transition-colors p-1">
                                {loc.isActive ? <ToggleRight className="h-5 w-5 text-[#008E7E]" /> : <ToggleLeft className="h-5 w-5" />}
                            </button>
                            <button onClick={() => handleDelete(loc.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
