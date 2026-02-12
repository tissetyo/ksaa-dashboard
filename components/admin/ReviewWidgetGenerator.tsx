'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Eye, Code } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewWidgetGeneratorProps {
    staffMembers: any[];
    products: any[];
}

export function ReviewWidgetGenerator({ staffMembers, products }: ReviewWidgetGeneratorProps) {
    const [limit, setLimit] = useState('5');
    const [staffId, setStaffId] = useState('all');
    const [productId, setProductId] = useState('all');
    const [heading, setHeading] = useState('Patient Reviews');
    const [theme, setTheme] = useState('light');
    const [generatedCode, setGeneratedCode] = useState('');
    const [copied, setCopied] = useState(false);

    // Preview State
    const [previewReviews, setPreviewReviews] = useState<any[]>([]);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    useEffect(() => {
        generateCode();
        fetchPreview();
    }, [limit, staffId, productId, heading, theme]);

    const fetchPreview = async () => {
        setIsLoadingPreview(true);
        try {
            const params = new URLSearchParams();
            if (limit) params.append('limit', limit);
            if (staffId && staffId !== 'all') params.append('staffId', staffId);
            if (productId && productId !== 'all') params.append('productId', productId);

            const response = await fetch(`/api/public/reviews?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setPreviewReviews(data);
            }
        } catch (error) {
            console.error('Failed to load preview:', error);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const generateCode = () => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ksaa-dashboard.vercel.app';
        const apiUrl = `${baseUrl}/api/public/reviews`;

        // Build query params
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit);
        if (staffId && staffId !== 'all') params.append('staffId', staffId);
        if (productId && productId !== 'all') params.append('productId', productId);

        const fetchUrl = `${apiUrl}?${params.toString()}`;

        // Using simple text stars for maximum compatibility and minimal size in the snippet
        const starChar = '★';
        const emptyStarChar = '☆';

        const code = `
<!-- KSAA Reviews Widget -->
<div id="ksaa-reviews-widget" style="font-family: system-ui, -apple-system, sans-serif; max-width: 100%; margin: 20px auto;">
  ${heading ? `<h3 style="text-align: center; margin-bottom: 20px; font-weight: 600;">${heading}</h3>` : ''}
  <div id="ksaa-reviews-container">
    <div style="text-align: center; color: #666; padding: 20px;">Loading reviews...</div>
  </div>
</div>

<script>
(function() {
  function initKsaaWidget() {
    const container = document.getElementById('ksaa-reviews-container');
    if (!container) {
        console.warn('KSAA Widget: Container not found');
        return;
    }

    // Avoid double-loading
    if (container.dataset.loaded) return;
    container.dataset.loaded = 'true';

    fetch('${fetchUrl}')
        .then(response => {
        if (!response.ok) throw new Error('Network response was not ok: ' + response.statusText);
        return response.json();
        })
        .then(reviews => {
        if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px; background: #f9fafb; border-radius: 8px;">No reviews available yet.</p>';
            return;
        }
        
        const theme = {
            bg: '${theme === 'dark' ? '#1f2937' : '#ffffff'}',
            text: '${theme === 'dark' ? '#f9fafb' : '#111827'}',
            border: '${theme === 'dark' ? '#374151' : '#e5e7eb'}',
            meta: '${theme === 'dark' ? '#9ca3af' : '#6b7280'}'
        };

        const html = reviews.map(review => {
            const stars = '${starChar}'.repeat(Math.round(review.rating)) + '${emptyStarChar}'.repeat(5 - Math.round(review.rating));
            const date = new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            
            return \`
            <div style="border: 1px solid \${theme.border}; padding: 16px; margin-bottom: 16px; border-radius: 8px; background: \${theme.bg}; color: \${theme.text}; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                <div style="color: #f59e0b; font-size: 18px; letter-spacing: 2px;">\${stars}</div>
                <div style="font-size: 12px; color: \${theme.meta};">\${date}</div>
                </div>
                <p style="margin: 0 0 12px 0; line-height: 1.6; font-size: 14px;">\${review.comment}</p>
                <div style="font-size: 13px; color: \${theme.meta}; font-style: italic; display: flex; align-items: center; gap: 6px;">
                <span style="font-weight: 500;">\${review.reviewerName || 'Anonymous'}</span>
                \${review.serviceName ? \`<span style="opacity: 0.7;">• \${review.serviceName}</span>\` : ''}
                </div>
            </div>
            \`;
        }).join('');
        
        container.innerHTML = html;
        })
        .catch(err => {
        console.error('KSAA Widget Error:', err);
        container.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 10px; font-size: 12px;">Unable to load reviews. Check console for details.</p>';
        });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKsaaWidget);
  } else {
    initKsaaWidget();
  }
})();
</script>
<!-- End KSAA Reviews Widget -->
`.trim();

        setGeneratedCode(code);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        toast.success('Widget code copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    // Preview Styles based on Theme
    const previewStyles = {
        bg: theme === 'dark' ? '#1f2937' : '#ffffff',
        text: theme === 'dark' ? '#f9fafb' : '#111827',
        border: theme === 'dark' ? '#374151' : '#e5e7eb',
        meta: theme === 'dark' ? '#9ca3af' : '#6b7280'
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>WordPress Integration</CardTitle>
                <CardDescription>
                    Generate a code snippet to display patient reviews on your external website.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Configuration Options */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-medium">Configuration</h3>
                            <div className="space-y-2">
                                <Label>Heading Text (Optional)</Label>
                                <Input
                                    value={heading}
                                    onChange={(e) => setHeading(e.target.value)}
                                    placeholder="Patient Reviews"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Number of Reviews</Label>
                                    <Select value={limit} onValueChange={setLimit}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="3">3</SelectItem>
                                            <SelectItem value="5">5</SelectItem>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="20">20</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Theme</Label>
                                    <Select value={theme} onValueChange={setTheme}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">Light</SelectItem>
                                            <SelectItem value="dark">Dark</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Filter by Staff (Optional)</Label>
                                <Select value={staffId} onValueChange={setStaffId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Staff" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Staff</SelectItem>
                                        {staffMembers.map((staff) => (
                                            <SelectItem key={staff.id} value={staff.id}>
                                                {staff.fullName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Filter by Service (Optional)</Label>
                                <Select value={productId} onValueChange={setProductId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Services" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Services</SelectItem>
                                        {products.map((product) => (
                                            <SelectItem key={product.id} value={product.id}>
                                                {product.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Preview & Code Output */}
                    <div className="space-y-4">
                        <Tabs defaultValue="preview" className="w-full">
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger value="preview" className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    Live Preview
                                </TabsTrigger>
                                <TabsTrigger value="code" className="flex items-center gap-2">
                                    <Code className="h-4 w-4" />
                                    Get Code
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="preview" className="mt-4 border rounded-lg p-4 bg-gray-50/50 min-h-[350px]">
                                {isLoadingPreview ? (
                                    <div className="flex items-center justify-center h-48 text-muted-foreground">
                                        Loading preview...
                                    </div>
                                ) : (
                                    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '100%' }}>
                                        {heading && (
                                            <h3 style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 600 }}>
                                                {heading}
                                            </h3>
                                        )}

                                        {previewReviews.length === 0 ? (
                                            <p style={{ textAlign: 'center', color: '#666', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
                                                No reviews available based on current filters.
                                            </p>
                                        ) : (
                                            <div className="space-y-4">
                                                {previewReviews.map((review: any) => (
                                                    <div
                                                        key={review.id}
                                                        style={{
                                                            border: `1px solid ${previewStyles.border}`,
                                                            padding: '16px',
                                                            borderRadius: '8px',
                                                            background: previewStyles.bg,
                                                            color: previewStyles.text,
                                                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                                                            <div style={{ color: '#f59e0b', fontSize: '18px', letterSpacing: '2px' }}>
                                                                {'★'.repeat(Math.round(review.rating)) + '☆'.repeat(5 - Math.round(review.rating))}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: previewStyles.meta }}>
                                                                {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                            </div>
                                                        </div>
                                                        <p style={{ margin: '0 0 12px 0', lineHeight: 1.6, fontSize: '14px' }}>
                                                            {review.comment}
                                                        </p>
                                                        <div style={{ fontSize: '13px', color: previewStyles.meta, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ fontWeight: 500 }}>{review.reviewerName || 'Anonymous'}</span>
                                                            {review.serviceName && <span style={{ opacity: 0.7 }}>• {review.serviceName}</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="code" className="mt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Generated Code</Label>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopy}
                                            className="flex items-center gap-2 h-8"
                                        >
                                            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                            {copied ? 'Copied' : 'Copy Code'}
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={generatedCode}
                                        readOnly
                                        className="font-mono text-xs h-[350px] bg-slate-950 text-slate-50 resize-none p-4"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Copy and paste this code into a "Custom HTML" block in WordPress or any other website builder.
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
