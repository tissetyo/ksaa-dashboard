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
        // For the premium widget, we likely want MORE reviews to populate tabs, so maybe bump limit if 'premium'
        if (limit) params.append('limit', theme === 'premium' ? '50' : limit);
        // We probably don't want to pre-filter by staff/product if we want tabs to work for ALL
        // But if admin sets it, we respect it.
        if (staffId && staffId !== 'all') params.append('staffId', staffId);
        if (productId && productId !== 'all') params.append('productId', productId);

        const fetchUrl = `${apiUrl}?${params.toString()}`;

        // Simple star SVG for minimal external dependencies
        const starChar = '★';
        const emptyStarChar = '☆';

        // PREMIUM WIDGET CSS & HTML
        const minifiedCss = `
          #ksaa-reviews-widget { font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 1200px; margin: 40px auto; padding: 0 20px; }
          #ksaa-reviews-header { text-align: center; margin-bottom: 40px; }
          #ksaa-reviews-header h3 { font-size: 28px; font-weight: 700; color: #1f2937; margin: 0 0 10px 0; }
          #ksaa-reviews-tabs { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-bottom: 30px; }
          .ksaa-tab {
            padding: 10px 20px; border: 1px solid #047857; color: #047857; background: white;
            border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s;
            display: flex; align-items: center; gap: 6px;
          }
          .ksaa-tab:hover, .ksaa-tab.active { background: #047857; color: white; }
          .ksaa-tab-icon { font-size: 16px; }

          #ksaa-reviews-grid {
            display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;
            /* For carousel effect on mobile */
            @media (max-width: 768px) {
                display: flex; overflow-x: auto; padding-bottom: 20px; scroll-snap-type: x mandatory;
            }
          }

          .ksaa-review-card {
            background-color: #064e3b; /* Dark Green */
            color: white;
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            position: relative;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s;
            scroll-snap-align: start;
            min-width: 280px; /* For mobile scroll */
          }
          .ksaa-review-card:hover { transform: translateY(-5px); }

          .ksaa-card-header {
            background-color: #047857; /* Slightly lighter green */
            padding: 20px;
            text-align: center;
            font-weight: 600;
            font-size: 16px;
            min-height: 80px;
            display: flex; align-items: center; justify-content: center;
          }

          .ksaa-card-body {
            padding: 20px;
            text-align: center;
            flex-grow: 1;
            display: flex; flex-direction: column; align-items: center;
          }

          .ksaa-avatar {
            width: 80px; height: 80px; border-radius: 50%; object-fit: cover;
            border: 4px solid white; margin-top: -60px; margin-bottom: 15px;
            background-color: #e5e7eb;
            display: flex; align-items: center; justify-content: center;
            font-size: 32px; color: #064e3b; font-weight: bold;
          }

          .ksaa-reviewer-name { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
          .ksaa-stars { color: #f59e0b; font-size: 18px; margin-bottom: 15px; letter-spacing: 2px; }
          .ksaa-comment {
            font-size: 14px; line-height: 1.6; font-style: italic; opacity: 0.9;
            display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden;
          }
        `;

        // Standard logic for 'light'/'dark' themes
        // ... (keep logic if needed, but 'premium' is requested)

        const code = `
<!-- KSAA Reviews Widget -->
<style>${minifiedCss}</style>
<div id="ksaa-reviews-widget">
  <div id="ksaa-reviews-header">
     ${heading ? `<h3>${heading}</h3>` : ''}
     <p style="color: #666;">Select review type and condition to find targeted feedback!</p>
  </div>

  <div id="ksaa-reviews-tabs">
    <!-- Tabs injected by JS -->
    <div class="ksaa-tab active" data-filter="all">All Reviews</div>
  </div>

  <div id="ksaa-reviews-grid">
    <div style="text-align: center; color: #666; padding: 40px; width: 100%;">Loading reviews...</div>
  </div>
</div>

<script>
(function() {
  function initKsaaWidget() {
    const container = document.getElementById('ksaa-reviews-widget');
    if (!container) return; // Silent fail if not present
    if (container.dataset.loaded) return;
    container.dataset.loaded = 'true';

    const grid = document.getElementById('ksaa-reviews-grid');
    const tabsContainer = document.getElementById('ksaa-reviews-tabs');
    let allReviews = [];

    fetch('${fetchUrl}')
        .then(res => res.json())
        .then(reviews => {
            if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
                grid.innerHTML = '<p style="text-align: center; padding: 20px;">No reviews available.</p>';
                return;
            }

            allReviews = reviews;

            // 1. Generate Tabs (Unique Service Names)
            const services = [...new Set(reviews.map(r => r.serviceName).filter(Boolean))];

            // Clear existing tabs (keep "All")
            tabsContainer.innerHTML = '<div class="ksaa-tab active" data-filter="all">All Reviews <span style="font-size:12px">+</span></div>';

            services.forEach(service => {
                const tab = document.createElement('div');
                tab.className = 'ksaa-tab';
                tab.dataset.filter = service;
                tab.innerHTML = \`\${service} <span style="font-size:12px">+</span>\`;
                tab.onclick = () => filterReviews(service);
                tabsContainer.appendChild(tab);
            });

            // Add click for "All"
            tabsContainer.querySelector('[data-filter="all"]').onclick = () => filterReviews('all');

            // 2. Initial Render
            renderReviews(allReviews);
        })
        .catch(err => {
            console.error('KSAA Widget Error:', err);
            grid.innerHTML = '<p style="color: red; text-align: center;">Unable to load reviews.</p>';
        });

    function filterReviews(filter) {
        // Update Active Tab
        document.querySelectorAll('.ksaa-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(\`[data-filter="\${filter}"]\`).classList.add('active');

        // Filter Data
        const filtered = filter === 'all'
            ? allReviews
            : allReviews.filter(r => r.serviceName === filter);

        renderReviews(filtered);
    }

    function renderReviews(reviews) {
        if (reviews.length === 0) {
            grid.innerHTML = '<p style="text-align: center; width: 100%; padding: 40px; color: #666;">No reviews found for this category.</p>';
            return;
        }

        const html = reviews.map(review => {
            const stars = '${starChar}'.repeat(Math.round(review.rating)) + '${emptyStarChar}'.repeat(5 - Math.round(review.rating));

            // Generate initials for avatar
            const initials = (review.reviewerName || 'A').split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

            return \`
            <div class="ksaa-review-card">
                <div class="ksaa-card-header">
                    \${review.serviceName || 'General Review'}
                </div>
                <div class="ksaa-card-body">
                    <div class="ksaa-avatar">\${initials}</div>
                    <div class="ksaa-reviewer-name">\${review.reviewerName || 'Anonymous'}</div>
                    <div class="ksaa-stars">\${stars}</div>
                    <div class="ksaa-comment">"\${review.comment}"</div>
                </div>
            </div>
            \`;
        }).join('');

        grid.innerHTML = html;
    }
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
                                            <SelectItem value="premium">Premium</SelectItem>
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
                                    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', maxWidth: '100%' }}>
                                        {heading && (
                                            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                                <h3 style={{ fontSize: '28px', fontWeight: 700, color: '#1f2937', margin: '0 0 10px 0' }}>
                                                    {heading}
                                                </h3>
                                                <p style={{ color: '#666' }}>Select review type and condition to find targeted feedback!</p>
                                            </div>
                                        )}

                                        {/* Mock Tabs for Preview */}
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
                                            <div style={{ padding: '10px 20px', backgroundColor: '#047857', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                All Reviews <span style={{ fontSize: '12px' }}>+</span>
                                            </div>
                                            {/* Show first few service names as inactive tabs */}
                                            {[...new Set(previewReviews.map(r => r.serviceName).filter(Boolean))].slice(0, 3).map((service: any) => (
                                                <div key={service} style={{ padding: '10px 20px', border: '1px solid #047857', color: '#047857', backgroundColor: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {service} <span style={{ fontSize: '12px' }}>+</span>
                                                </div>
                                            ))}
                                        </div>

                                        {previewReviews.length === 0 ? (
                                            <p style={{ textAlign: 'center', color: '#666', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
                                                No reviews available based on current filters.
                                            </p>
                                        ) : (
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                                gap: '24px'
                                            }}>
                                                {previewReviews.map((review: any) => (
                                                    <div
                                                        key={review.id}
                                                        style={{
                                                            backgroundColor: '#064e3b',
                                                            color: 'white',
                                                            borderRadius: '12px',
                                                            overflow: 'hidden',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                                        }}
                                                    >
                                                        <div style={{
                                                            backgroundColor: '#047857',
                                                            padding: '20px',
                                                            textAlign: 'center',
                                                            fontWeight: 600,
                                                            fontSize: '16px',
                                                            minHeight: '80px',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}>
                                                            {review.serviceName || 'General Review'}
                                                        </div>
                                                        <div style={{
                                                            padding: '20px',
                                                            textAlign: 'center',
                                                            flexGrow: 1,
                                                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                                                        }}>
                                                            <div style={{
                                                                width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover',
                                                                border: '4px solid white', marginTop: '-60px', marginBottom: '15px',
                                                                backgroundColor: '#e5e7eb',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: '32px', color: '#064e3b', fontWeight: 'bold'
                                                            }}>
                                                                {(review.reviewerName || 'A').split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                                                                {review.reviewerName || 'Anonymous'}
                                                            </div>
                                                            <div style={{ color: '#f59e0b', fontSize: '18px', marginBottom: '15px', letterSpacing: '2px' }}>
                                                                {'★'.repeat(Math.round(review.rating)) + '☆'.repeat(5 - Math.round(review.rating))}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '14px', lineHeight: 1.6, fontStyle: 'italic', opacity: 0.9,
                                                                display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                                            }}>
                                                                "{review.comment}"
                                                            </div>
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
