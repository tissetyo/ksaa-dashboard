'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Image as ImageIcon, ToggleLeft, ToggleRight, Upload, Link2 } from 'lucide-react';
import { toast } from 'sonner';

interface Banner {
    id: string;
    title: string | null;
    imageUrl: string;
    linkType: string;
    linkUrl: string | null;
    serviceId: string | null;
    isActive: boolean;
    order: number;
}

interface BannerManagerProps {
    initialBanners: Banner[];
    products: { id: string; name: string }[];
}

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 500;

function compressAndValidateImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        if (file.size > 10 * 1024 * 1024) {
            reject(new Error('File too large. Max 10MB before compression.'));
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                // Validate landscape ratio
                if (img.width <= img.height) {
                    reject(new Error('Image must be landscape (wider than tall). Minimum ratio: 2:1 recommended.'));
                    return;
                }
                // Draw to canvas at target size
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                if (width > MAX_WIDTH) { height = Math.round(height * MAX_WIDTH / width); width = MAX_WIDTH; }
                if (height > MAX_HEIGHT) { width = Math.round(width * MAX_HEIGHT / height); height = MAX_HEIGHT; }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0, width, height);
                // Try jpeg compression
                let quality = 0.9;
                let base64 = canvas.toDataURL('image/jpeg', quality);
                // Reduce until under 2MB
                while (base64.length * 0.75 > MAX_SIZE_BYTES && quality > 0.3) {
                    quality -= 0.1;
                    base64 = canvas.toDataURL('image/jpeg', quality);
                }
                if (base64.length * 0.75 > MAX_SIZE_BYTES) {
                    reject(new Error('Image cannot be compressed under 2MB. Please use a smaller image.'));
                    return;
                }
                resolve(base64);
            };
            img.onerror = () => reject(new Error('Invalid image file'));
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
}

export function BannerManager({ initialBanners, products }: BannerManagerProps) {
    const [banners, setBanners] = useState<Banner[]>(initialBanners);
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ title: '', imageUrl: '', linkType: 'custom', linkUrl: '', serviceId: '' });
    const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
    const [previewUrl, setPreviewUrl] = useState('');
    const [uploadedBase64, setUploadedBase64] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const base64 = await compressAndValidateImage(file);
            setUploadedBase64(base64);
            setPreviewUrl(base64);
            toast.success('Image ready — will be uploaded when you save');
        } catch (err: any) {
            toast.error(err.message || 'Image validation failed');
            if (fileRef.current) fileRef.current.value = '';
        }
        setUploading(false);
    };

    const handleSave = async () => {
        let imageUrl = form.imageUrl;

        if (uploadMode === 'file') {
            if (!uploadedBase64) { toast.error('Please select an image'); return; }
            // Upload to server
            setSaving(true);
            try {
                const res = await fetch('/api/admin/banners/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ base64: uploadedBase64, filename: 'banner' }),
                });
                const data = await res.json();
                if (!res.ok) { toast.error(data.error || 'Upload failed'); setSaving(false); return; }
                imageUrl = data.url;
            } catch {
                toast.error('Upload failed');
                setSaving(false);
                return;
            }
        } else {
            if (!imageUrl) { toast.error('Please enter an image URL'); return; }
        }

        try {
            const res = await fetch('/api/admin/banners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title,
                    imageUrl,
                    linkType: form.linkType,
                    linkUrl: form.linkType === 'custom' ? form.linkUrl : null,
                    serviceId: form.linkType === 'service' ? form.serviceId : null,
                    order: banners.length,
                }),
            });
            const data = await res.json();
            if (data.banner) {
                setBanners(prev => [...prev, data.banner]);
                setForm({ title: '', imageUrl: '', linkType: 'custom', linkUrl: '', serviceId: '' });
                setPreviewUrl('');
                setUploadedBase64('');
                if (fileRef.current) fileRef.current.value = '';
                setAdding(false);
                toast.success('Banner added');
            }
        } catch {
            toast.error('Failed to save banner');
        }
        setSaving(false);
    };

    const handleToggle = async (banner: Banner) => {
        const res = await fetch('/api/admin/banners', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: banner.id, isActive: !banner.isActive }),
        });
        const data = await res.json();
        if (data.banner) setBanners(prev => prev.map(b => b.id === banner.id ? data.banner : b));
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this banner?')) return;
        const res = await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            setBanners(prev => prev.filter(b => b.id !== id));
            toast.success('Banner deleted');
        } else {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-[#008E7E]" />
                        Banner Management
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">Max 2MB · Landscape images only · Recommended: 1200×500px</p>
                </div>
                <Button size="sm" onClick={() => setAdding(v => !v)} variant={adding ? 'outline' : 'default'} className={adding ? '' : 'bg-[#008E7E] hover:bg-[#008E7E]/90'}>
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Banner
                </Button>
            </div>

            {adding && (
                <div className="border rounded-xl p-4 bg-gray-50 space-y-4">
                    <h4 className="font-medium text-sm">New Banner</h4>

                    {/* Upload mode toggle */}
                    <div className="flex gap-2">
                        <button onClick={() => setUploadMode('file')} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${uploadMode === 'file' ? 'bg-[#008E7E] text-white border-[#008E7E]' : 'bg-white text-gray-600 border-gray-200'}`}>
                            <Upload className="h-3 w-3" /> Upload File
                        </button>
                        <button onClick={() => setUploadMode('url')} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${uploadMode === 'url' ? 'bg-[#008E7E] text-white border-[#008E7E]' : 'bg-white text-gray-600 border-gray-200'}`}>
                            <Link2 className="h-3 w-3" /> Use URL
                        </button>
                    </div>

                    {uploadMode === 'file' ? (
                        <div>
                            <Label className="text-xs">Image File *</Label>
                            <div className="mt-1">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                    className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#008E7E] file:text-white hover:file:bg-[#008E7E]/90 cursor-pointer"
                                />
                                <p className="text-xs text-gray-400 mt-1">Max 2MB · Landscape only · Auto-compressed to 1200×500px</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <Label className="text-xs">Image URL *</Label>
                            <Input
                                placeholder="https://example.com/banner.jpg"
                                value={form.imageUrl}
                                onChange={e => { setForm(f => ({ ...f, imageUrl: e.target.value })); setPreviewUrl(e.target.value); }}
                            />
                        </div>
                    )}

                    {previewUrl && (
                        <div className="rounded-lg overflow-hidden border max-h-40">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={previewUrl} alt="Preview" className="w-full object-cover max-h-40" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Title (optional)</Label>
                            <Input placeholder="Banner title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Link Type</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={form.linkType}
                                onChange={e => setForm(f => ({ ...f, linkType: e.target.value }))}
                            >
                                <option value="custom">Custom URL</option>
                                <option value="service">Link to Service</option>
                                <option value="none">No Link</option>
                            </select>
                        </div>
                        {form.linkType === 'custom' && (
                            <div className="sm:col-span-2">
                                <Label className="text-xs">Link URL</Label>
                                <Input placeholder="https://..." value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))} />
                            </div>
                        )}
                        {form.linkType === 'service' && (
                            <div className="sm:col-span-2">
                                <Label className="text-xs">Service</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={form.serviceId}
                                    onChange={e => setForm(f => ({ ...f, serviceId: e.target.value }))}
                                >
                                    <option value="">Select service...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave} disabled={saving || uploading} className="bg-[#008E7E] hover:bg-[#008E7E]/90">
                            {saving ? 'Saving...' : uploading ? 'Processing...' : 'Save Banner'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setAdding(false); setPreviewUrl(''); setUploadedBase64(''); }}>Cancel</Button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {banners.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No banners yet. Add one above.</p>}
                {banners.map(banner => (
                    <div key={banner.id} className={`flex items-center gap-3 border rounded-xl p-3 ${banner.isActive ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={banner.imageUrl} alt={banner.title || 'Banner'} className="w-20 h-12 object-cover rounded-lg flex-shrink-0 bg-gray-100" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm truncate">{banner.title || 'Untitled'}</span>
                                <Badge variant={banner.isActive ? 'default' : 'secondary'} className={banner.isActive ? 'bg-[#008E7E]/15 text-[#008E7E] border-none text-[10px]' : 'text-[10px]'}>
                                    {banner.isActive ? 'Active' : 'Hidden'}
                                </Badge>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {banner.linkType === 'service' ? `→ Service` : banner.linkUrl ? `→ ${banner.linkUrl}` : 'No link'}
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => handleToggle(banner)} title={banner.isActive ? 'Hide' : 'Show'} className="text-gray-400 hover:text-[#008E7E] p-1">
                                {banner.isActive ? <ToggleRight className="h-5 w-5 text-[#008E7E]" /> : <ToggleLeft className="h-5 w-5" />}
                            </button>
                            <button onClick={() => handleDelete(banner.id)} className="text-gray-400 hover:text-red-500 p-1">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
