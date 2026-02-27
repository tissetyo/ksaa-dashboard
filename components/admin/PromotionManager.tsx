'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Megaphone, Plus, Loader2, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { getPromotions, createPromotion, togglePromotion, deletePromotion } from '@/lib/actions/promotion';
import { format } from 'date-fns';

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    EVENT: { label: 'Event', color: 'bg-purple-100 text-purple-700' },
    DISCOUNT: { label: 'Discount', color: 'bg-green-100 text-green-700' },
    ANNOUNCEMENT: { label: 'Announcement', color: 'bg-blue-100 text-blue-700' },
};

export function PromotionManager() {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('ANNOUNCEMENT');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        loadPromotions();
    }, []);

    const loadPromotions = async () => {
        try {
            const data = await getPromotions();
            setPromotions(data);
        } catch {
            // ignore
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!title.trim() || !description.trim()) {
            toast.error('Title and description are required');
            return;
        }
        setIsSubmitting(true);
        try {
            await createPromotion({
                title: title.trim(),
                description: description.trim(),
                type,
                isActive: true,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });
            toast.success('Promotion created!');
            setTitle('');
            setDescription('');
            setType('ANNOUNCEMENT');
            setStartDate('');
            setEndDate('');
            setShowForm(false);
            loadPromotions();
        } catch {
            toast.error('Failed to create promotion');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggle = async (id: string, isActive: boolean) => {
        try {
            await togglePromotion(id, isActive);
            setPromotions(prev => prev.map(p => p.id === id ? { ...p, isActive } : p));
            toast.success(isActive ? 'Promotion activated' : 'Promotion deactivated');
        } catch {
            toast.error('Failed to update');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this promotion?')) return;
        try {
            await deletePromotion(id);
            setPromotions(prev => prev.filter(p => p.id !== id));
            toast.success('Promotion deleted');
        } catch {
            toast.error('Failed to delete');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Megaphone className="h-5 w-5" /> Promotions & Events
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Create promotions and events visible to patients in their Rewards page.
                    </p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-[#008E7E] hover:bg-[#0a4f47]"
                >
                    <Plus className="h-4 w-4 mr-2" /> New Promotion
                </Button>
            </div>

            {/* Create Form */}
            {showForm && (
                <Card className="mb-6 border-[#008E7E]/20">
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                placeholder="e.g. Free Consultation Week"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Describe the promotion or event..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                                        <SelectItem value="DISCOUNT">Discount</SelectItem>
                                        <SelectItem value="EVENT">Event</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Start Date (optional)</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>End Date (optional)</Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                onClick={handleCreate}
                                disabled={isSubmitting || !title.trim() || !description.trim()}
                                className="bg-[#008E7E] hover:bg-[#0a4f47]"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
                                ) : (
                                    'Create Promotion'
                                )}
                            </Button>
                            <Button variant="outline" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
            ) : promotions.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No promotions yet. Create one to get started.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {promotions.map(promo => (
                        <div
                            key={promo.id}
                            className={`border rounded-xl p-4 flex items-center justify-between transition-colors ${promo.isActive ? 'bg-white' : 'bg-gray-50 opacity-60'}`}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900 truncate">{promo.title}</h4>
                                    <Badge className={TYPE_LABELS[promo.type]?.color || 'bg-gray-100'}>
                                        {TYPE_LABELS[promo.type]?.label || promo.type}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-1">{promo.description}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                    <span>Created {format(new Date(promo.createdAt), 'MMM d, yyyy')}</span>
                                    {promo.startDate && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(promo.startDate), 'MMM d')}
                                            {promo.endDate && ` - ${format(new Date(promo.endDate), 'MMM d')}`}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 ml-4 shrink-0">
                                <Switch
                                    checked={promo.isActive}
                                    onCheckedChange={(checked) => handleToggle(promo.id, checked)}
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-400 hover:text-red-500"
                                    onClick={() => handleDelete(promo.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
