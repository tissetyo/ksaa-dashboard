'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ImageIcon, Loader2, Upload, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getSiteSettings, updateSiteSetting } from '@/lib/actions/site-settings';

export function LogoSettingsCard() {
    const [logoUrl, setLogoUrl] = useState('');
    const [faviconUrl, setFaviconUrl] = useState('');
    const [isLoadingLogo, setIsLoadingLogo] = useState(false);
    const [isLoadingFavicon, setIsLoadingFavicon] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        getSiteSettings().then((settings) => {
            setLogoUrl(settings['logo_url'] || '');
            setFaviconUrl(settings['favicon_url'] || '');
            setIsLoaded(true);
        });
    }, []);

    const handleUpload = async (
        file: File,
        setUrl: (url: string) => void,
        setLoading: (v: boolean) => void
    ) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/admin/banners/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setUrl(data.url);
            toast.success('Image uploaded!');
        } catch {
            toast.error('Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSiteSetting('logo_url', logoUrl);
            await updateSiteSetting('favicon_url', faviconUrl);
            toast.success('Logo settings saved!');
        } catch {
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isLoaded) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" /> Logo & Favicon
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" /> Logo & Favicon
                </CardTitle>
                <CardDescription>
                    Upload your clinic logo and favicon. These will be displayed across the entire website.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Site Logo</Label>
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-40 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
                            ) : (
                                <ImageIcon className="h-6 w-6 text-gray-300" />
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label
                                htmlFor="logo-upload"
                                className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                {isLoadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                Upload Logo
                            </Label>
                            <Input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUpload(file, setLogoUrl, setIsLoadingLogo);
                                }}
                            />
                            <p className="text-xs text-gray-400">PNG, JPG, SVG. Recommended: 200×60px</p>
                        </div>
                    </div>
                    <Input
                        placeholder="Or paste image URL..."
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="text-sm"
                    />
                </div>

                {/* Favicon Upload */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Favicon</Label>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                            {faviconUrl ? (
                                <img src={faviconUrl} alt="Favicon" className="h-full w-full object-contain p-1" />
                            ) : (
                                <ImageIcon className="h-5 w-5 text-gray-300" />
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label
                                htmlFor="favicon-upload"
                                className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                {isLoadingFavicon ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                Upload Favicon
                            </Label>
                            <Input
                                id="favicon-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUpload(file, setFaviconUrl, setIsLoadingFavicon);
                                }}
                            />
                            <p className="text-xs text-gray-400">ICO, PNG. Recommended: 32×32px</p>
                        </div>
                    </div>
                    <Input
                        placeholder="Or paste favicon URL..."
                        value={faviconUrl}
                        onChange={(e) => setFaviconUrl(e.target.value)}
                        className="text-sm"
                    />
                </div>

                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#008E7E] hover:bg-[#0a4f47] text-white"
                >
                    {isSaving ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                        <><Check className="h-4 w-4 mr-2" /> Save Logo Settings</>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
