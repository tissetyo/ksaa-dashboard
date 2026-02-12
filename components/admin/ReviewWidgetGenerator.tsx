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
    const [theme, setTheme] = useState('modern-teal');
    const [generatedCode, setGeneratedCode] = useState('');
    const [copied, setCopied] = useState(false);

    // Filter State
    const [filterMode, setFilterMode] = useState<'auto' | 'manual'>('auto');
    const [allReviewsLabel, setAllReviewsLabel] = useState('All Reviews');
    const [customFilters, setCustomFilters] = useState<{ id: string; original: string; label: string; active: boolean }[]>([]);

    // Initialize custom filters from products
    useEffect(() => {
        if (products.length > 0 && customFilters.length === 0) {
            setCustomFilters(products.map(p => ({
                id: p.id,
                original: p.name,
                label: p.name, // Default to original name
                active: true
            })));
        }
    }, [products]);

    // Preview State
    const [previewReviews, setPreviewReviews] = useState<any[]>([]);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    useEffect(() => {
        generateCode();
        fetchPreview();
    }, [limit, staffId, productId, heading, theme, filterMode, customFilters, allReviewsLabel]);

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

        // Prepare Custom Filters for injection
        const activeFilters = customFilters.filter(f => f.active).map(f => ({
            key: f.original,
            label: f.label
        }));

        const filtersConfig = filterMode === 'manual' ? JSON.stringify(activeFilters) : 'null';

        // Simple star SVG for minimal external dependencies
        const starChar = '★';
        const emptyStarChar = '☆';

        // COMMON CSS
        const baseCss = `
          #ksaa-reviews-widget { font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 1200px; margin: 40px auto; padding: 0 20px; }
          #ksaa-reviews-header { text-align: center; margin-bottom: 40px; }
          #ksaa-reviews-tabs { display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; margin-bottom: 40px; }
          
          /* Common Tab Styles */
          .ksaa-tab { 
            padding: 10px 24px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 15px; 
            transition: all 0.2s; display: flex; align-items: center; gap: 8px; border: 2px solid transparent;
          }
          
          /* Loading State */
          .ksaa-loading { text-align: center; color: #666; padding: 40px; width: 100%; }
        `;

        let themeCss = '';
        // We will inject a 'theme' class into the container to scope styles if needed, 
        // but for now we'll just swap the CSS.

        // --- OPTION 1: MODERN TEAL (Requested Style) ---
        if (theme === 'modern-teal') {
            themeCss = `
              /* Brand Colors */
              :root { --ksaa-teal: #0e5c58; --ksaa-orange: #f97316; }
              
              /* Tabs */
              .ksaa-tab { background: white; color: var(--ksaa-teal); border-color: var(--ksaa-teal); }
              .ksaa-tab:hover, .ksaa-tab.active { background: var(--ksaa-teal); color: white; }
              
              /* Grid / Carousel */
              #ksaa-reviews-grid { 
                display: flex; 
                overflow-x: auto; 
                gap: 24px; 
                padding-bottom: 30px; 
                scroll-snap-type: x mandatory; 
                scrollbar-width: thin;
              }
              #ksaa-reviews-grid::-webkit-scrollbar { height: 8px; }
              #ksaa-reviews-grid::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
              
              /* Cards */
              .ksaa-review-card {
                flex: 0 0 300px; /* Fixed width for carousel */
                scroll-snap-align: center;
                background-color: var(--ksaa-teal);
                color: white;
                border-radius: 0; /* Square/Rectangular look like photo */
                overflow: hidden;
                display: flex;
                flex-direction: column;
                text-align: center;
                position: relative;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                border-bottom: 6px solid var(--ksaa-orange); /* Bottom orange accent */
              }
              
              .ksaa-card-top-icon {
                font-size: 24px; color: white; margin-top: 20px;
              }
              
              .ksaa-card-service {
                 font-size: 18px; font-weight: 500; margin: 10px 20px;
                 padding-bottom: 20px;
                 border-bottom: 1px solid rgba(255,255,255,0.2);
                 position: relative;
              }
              /* Curved line effect simulation */
              .ksaa-card-service::after {
                 content: ''; position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%);
                 width: 60px; height: 4px; background: var(--ksaa-orange); border-radius: 2px;
              }
              
              .ksaa-card-body { padding: 30px 20px; display: flex; flex-direction: column; align-items: center; }
              
              .ksaa-reviewer-name { font-size: 22px; font-weight: 700; margin-bottom: 10px; font-family: 'Georgia', serif; }
              .ksaa-stars { color: #fbbf24; font-size: 16px; letter-spacing: 3px; margin-bottom: 20px; }
              .ksaa-comment { 
                font-size: 15px; line-height: 1.6; opacity: 0.9; font-weight: 300;
                display: -webkit-box; -webkit-line-clamp: 7; -webkit-box-orient: vertical; overflow: hidden;
              }
              
              @media (max-width: 640px) {
                 .ksaa-review-card { flex: 0 0 85%; } 
              }
            `;
        }
        // --- OPTION 2: CLASSIC GOLD (Previous) ---
        else if (theme === 'classic-gold') {
            themeCss = `
               /* Tabs */
               .ksaa-tab { background: #064e3b; color: white; border: 1px solid #064e3b; opacity: 0.8; }
               .ksaa-tab:hover, .ksaa-tab.active { opacity: 1; border-color: #fbbf24; color: #fbbf24; }
               
               #ksaa-reviews-grid { 
                 display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;
               }
               .ksaa-review-card {
                 background: #022c22; color: white; border: 1px solid #064e3b; border-radius: 12px; padding: 24px;
               }
               .ksaa-card-service { text-transform: uppercase; letter-spacing: 1px; color: #fbbf24; font-size: 12px; margin-bottom: 16px; font-weight: 700;}
               .ksaa-reviewer-name { font-size: 18px; font-weight: 600; color: white; }
               .ksaa-stars { color: #fbbf24; margin: 8px 0; }
               .ksaa-comment { color: #d1fae5; font-size: 14px; font-style: italic; }
             `;
        }
        // --- OPTION 3: MINIMAL LIST ---
        else { // minimal-light
            themeCss = `
               .ksaa-tab { background: white; color: #333; border: 1px solid #ddd; }
               .ksaa-tab:hover, .ksaa-tab.active { background: #f3f4f6; border-color: #999; }
               
               #ksaa-reviews-grid { display: grid; gap: 16px; }
               .ksaa-review-card {
                  display: grid; grid-template-columns: 150px 1fr; gap: 20px;
                  background: white; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px;
                  align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
               }
               .ksaa-card-left { text-align: center; border-right: 1px solid #eee; padding-right: 20px; }
               .ksaa-reviewer-name { font-weight: 700; color: #111; }
               .ksaa-card-service { font-size: 12px; color: #666; margin-top: 4px; }
               .ksaa-stars { color: #f97316; margin-top: 8px; }
               .ksaa-comment { font-size: 15px; color: #444; line-height: 1.5; }
               
               @media (max-width: 600px) {
                  .ksaa-review-card { grid-template-columns: 1fr; text-align: center; }
                  .ksaa-card-left { border-right: none; border-bottom: 1px solid #eee; padding-right: 0; padding-bottom: 15px; margin-bottom: 15px; }
               }
             `;
        }

        const allLabel = allReviewsLabel || 'All Reviews';
        const css = baseCss + themeCss;

        const code = `
<!-- KSAA Reviews Widget v2.2 (Refined Labels) -->
<style>${css.replace(/\s+/g, ' ')}</style>
<div id="ksaa-reviews-widget" class="${theme}">
  <div id="ksaa-reviews-header">
     ${heading ? `<h3 style="font-size: 24px; font-weight: 700; color: ${theme === 'modern-teal' ? '#0e5c58' : '#111'};">${heading}</h3>` : ''}
     <p style="color: #666;">Select review type and condition to find targeted feedback!</p>
  </div>
  
  <div id="ksaa-reviews-tabs"></div>
  <div id="ksaa-reviews-grid"><div class="ksaa-loading">Loading reviews...</div></div>
</div>

<script>
(function() {
  const THEME = '${theme}';
  const star = '${starChar}';
  const empty = '${emptyStarChar}';
  const FILTERS = ${filtersConfig};
  const ALL_LABEL = '${allLabel}';

  // Create lookup map for service labels
  const LABEL_MAP = {};
  if (FILTERS) {
      FILTERS.forEach(f => LABEL_MAP[f.key] = f.label);
  }

  function init() {
    const root = document.getElementById('ksaa-reviews-widget');
    if (!root || root.dataset.loaded) return;
    root.dataset.loaded = 'true';
    
    const ui = {
        grid: document.getElementById('ksaa-reviews-grid'),
        tabs: document.getElementById('ksaa-reviews-tabs')
    };

    fetch('${fetchUrl}')
        .then(r => r.json())
        .then(data => {
            if(!data || !data.length) { ui.grid.innerHTML = '<p class="ksaa-loading">No reviews available.</p>'; return; }
            
            // Determine Tabs
            let tabs = [];
            if (FILTERS) {
                tabs = FILTERS;
            } else {
                // Auto-generate from data
                const services = [...new Set(data.map(i => i.serviceName).filter(Boolean))];
                tabs = services.map(s => ({ key: s, label: s }));
            }
            
            // Render Tabs
            ui.tabs.innerHTML = \`<div class="ksaa-tab active" onclick="filter('all')">\${ALL_LABEL}</div>\` + 
                tabs.map(t => \`<div class="ksaa-tab" onclick="filter('\${t.key}')">\${t.label}</div>\`).join('');
                
            window.ksaaReviews = data; // Store globally
            render(data);
        })
        .catch(err => {
            console.error('KSAA Widget Error:', err);
            ui.grid.innerHTML = '<p class="ksaa-loading" style="color: red;">Unable to load reviews.</p>';
        });

    window.filter = function(cat) {
        document.querySelectorAll('.ksaa-tab').forEach(t => t.classList.toggle('active', t.dataset.filter === cat));
        const filtered = cat === 'all' ? window.ksaaReviews : window.ksaaReviews.filter(r => r.serviceName === cat);
        render(filtered);
    };

    function render(list) {
        if(!list.length) { ui.grid.innerHTML = '<p class="ksaa-loading">No reviews found for this category.</p>'; return; }
        
        ui.grid.innerHTML = list.map(r => {
            const stars = star.repeat(Math.round(r.rating)) + empty.repeat(5 - Math.round(r.rating));
            const displayService = LABEL_MAP[r.serviceName] || r.serviceName || 'Review';
            
            // --- TEMPLATE: MODERN TEAL ---
            if (THEME === 'modern-teal') {
                return \`
                <div class="ksaa-review-card">
                   <div class="ksaa-card-top-icon">✦</div>
                   <div class="ksaa-card-service">\${displayService}</div>
                   <div class="ksaa-card-body">
                      <!-- Removed Avatar as requested -->
                      <div class="ksaa-reviewer-name">\${r.reviewerName || 'Anonymous'}</div>
                      <div class="ksaa-stars">\${stars}</div>
                      <div class="ksaa-comment">"\${r.comment}"</div>
                   </div>
                </div>\`;
            }
            
            // --- TEMPLATE: CLASSIC GOLD ---
            if (THEME === 'classic-gold') {
                return \`
                <div class="ksaa-review-card">
                    <div class="ksaa-card-service">\${displayService}</div>
                    <div class="ksaa-reviewer-name">\${r.reviewerName || 'Anonymous'}</div>
                    <div class="ksaa-stars">\${stars}</div>
                    <div class="ksaa-comment">\${r.comment}</div>
                </div>\`;
            }

            // --- TEMPLATE: MINIMAL ---
            return \`
            <div class="ksaa-review-card">
                <div class="ksaa-card-left">
                    <div class="ksaa-reviewer-name">\${r.reviewerName || 'Anonymous'}</div>
                    <div class="ksaa-card-service">\${displayService}</div>
                    <div class="ksaa-stars">\${stars}</div>
                </div>
                <div class="ksaa-comment">\${r.comment}</div>
            </div>\`;
        }).join('');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
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
                                            <SelectItem value="modern-teal">Modern Teal (Recommended)</SelectItem>
                                            <SelectItem value="classic-gold">Classic Gold</SelectItem>
                                            <SelectItem value="minimal-list">Minimal List</SelectItem>
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
                            <div className="space-y-4 border-t pt-4">
                                <Label>Tab Filters</Label>
                                <div className="flex gap-4">
                                    <Button
                                        variant={filterMode === 'auto' ? 'default' : 'outline'}
                                        onClick={() => setFilterMode('auto')}
                                        className="w-full"
                                    >
                                        Auto (All Services)
                                    </Button>
                                    <Button
                                        variant={filterMode === 'manual' ? 'default' : 'outline'}
                                        onClick={() => setFilterMode('manual')}
                                        className="w-full"
                                    >
                                        Manual (Custom)
                                    </Button>
                                </div>

                                {filterMode === 'manual' && (
                                    <div className="space-y-3 mt-4 border rounded-md p-4 bg-muted/20 max-h-[300px] overflow-y-auto">
                                        <div className="text-xs text-muted-foreground mb-2 flex justify-between px-2">
                                            <span>Show?</span>
                                            <span className="flex-1 ml-4">Display Label (Rename)</span>
                                        </div>

                                        {/* "All" Label Customization */}
                                        <div className="flex items-center gap-3 bg-white p-2 border-b">
                                            <div className="h-4 w-4 bg-gray-200 rounded-sm" title="Always visible" />
                                            <Input
                                                value={allReviewsLabel}
                                                onChange={(e) => setAllReviewsLabel(e.target.value)}
                                                placeholder="All Reviews"
                                                className="flex-1 h-8 text-sm"
                                            />
                                            <span className="text-xs text-muted-foreground w-20 truncate">
                                                (Default)
                                            </span>
                                        </div>

                                        {customFilters.map((filter, idx) => (
                                            <div key={filter.id} className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={filter.active}
                                                    onChange={(e) => {
                                                        const newFilters = [...customFilters];
                                                        newFilters[idx].active = e.target.checked;
                                                        setCustomFilters(newFilters);
                                                    }}
                                                    className="h-4 w-4"
                                                />
                                                <Input
                                                    value={filter.label}
                                                    onChange={(e) => {
                                                        const newFilters = [...customFilters];
                                                        newFilters[idx].label = e.target.value;
                                                        setCustomFilters(newFilters);
                                                    }}
                                                    placeholder={filter.original}
                                                    className="flex-1 h-8 text-sm"
                                                />
                                                <span className="text-xs text-muted-foreground w-20 truncate" title={filter.original}>
                                                    ({filter.original})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                                                <h3 style={{ fontSize: '24px', fontWeight: 700, color: theme === 'modern-teal' ? '#f97316' : '#111', margin: '0 0 10px 0' }}>
                                                    {heading}
                                                </h3>
                                                <p style={{ color: '#666' }}>Select review type and condition to find targeted feedback!</p>
                                            </div>
                                        )}

                                        {/* Mock Tabs for Preview */}
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '30px' }}>
                                            <div style={{ padding: '10px 24px', backgroundColor: theme === 'modern-teal' ? '#0e5c58' : (theme === 'classic-gold' ? '#064e3b' : '#eee'), color: theme === 'minimal-list' ? '#333' : 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}>
                                                All Reviews
                                            </div>

                                            {/* Dynamic Tabs */}
                                            {(filterMode === 'manual'
                                                ? customFilters.filter(f => f.active).map(f => ({ key: f.original, label: f.label }))
                                                : [...new Set(previewReviews.map(r => r.serviceName).filter(Boolean))].slice(0, 3).map(s => ({ key: s, label: s }))
                                            ).map((tab: any) => (
                                                <div key={tab.key} style={{ padding: '10px 24px', border: theme === 'minimal-list' ? '1px solid #ddd' : 'none', color: theme === 'modern-teal' ? '#0e5c58' : (theme === 'classic-gold' ? '#064e3b' : '#666'), backgroundColor: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}>
                                                    {tab.label}
                                                </div>
                                            ))}
                                        </div>

                                        {previewReviews.length === 0 ? (
                                            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No reviews available.</p>
                                        ) : (
                                            <div style={{
                                                display: theme === 'minimal-list' ? 'grid' : 'flex',
                                                flexDirection: theme === 'minimal-list' ? 'column' : 'row',
                                                overflowX: theme === 'minimal-list' ? 'visible' : 'auto',
                                                gap: '24px',
                                                paddingBottom: '20px'
                                            }}>
                                                {previewReviews.map((review: any) => (
                                                    <div key={review.id} style={{
                                                        // Styles based on Theme
                                                        ...(theme === 'modern-teal' ? {
                                                            minWidth: '280px', flex: '0 0 280px',
                                                            backgroundColor: '#0e5c58', color: 'white',
                                                            borderBottom: '6px solid #f97316',
                                                            textAlign: 'center', display: 'flex', flexDirection: 'column'
                                                        } : theme === 'classic-gold' ? {
                                                            minWidth: '280px', flex: '0 0 280px',
                                                            backgroundColor: '#022c22', color: 'white',
                                                            border: '1px solid #064e3b', borderRadius: '12px', padding: '24px'
                                                        } : {
                                                            display: 'grid', gridTemplateColumns: '120px 1fr', gap: '20px',
                                                            background: 'white', border: '1px solid #eaeaea', borderRadius: '8px', padding: '20px', alignItems: 'center'
                                                        })
                                                    }}>

                                                        {theme === 'modern-teal' && (
                                                            <>
                                                                <div style={{ fontSize: '24px', color: 'white', marginTop: '20px' }}>✦</div>
                                                                <div style={{ fontSize: '18px', fontWeight: 500, margin: '10px 20px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.2)', position: 'relative' }}>
                                                                    {review.serviceName || 'Review'}
                                                                    <div style={{ position: 'absolute', bottom: '-2px', left: '50%', transform: 'translateX(-50%)', width: '60px', height: '4px', background: '#f97316', borderRadius: '2px' }} />
                                                                </div>
                                                                <div style={{ padding: '30px 20px' }}>
                                                                    <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px', fontFamily: 'Georgia, serif' }}>{review.reviewerName || 'Anonymous'}</div>
                                                                    <div style={{ color: '#fbbf24', fontSize: '16px', letterSpacing: '3px', marginBottom: '20px' }}>{'★'.repeat(Math.round(review.rating))}</div>
                                                                    <div style={{ opacity: 0.9, lineHeight: 1.6, fontSize: '14px' }}>"{review.comment}"</div>
                                                                </div>
                                                            </>
                                                        )}

                                                        {theme === 'classic-gold' && (
                                                            <>
                                                                <div style={{ textTransform: 'uppercase', letterSpacing: '1px', color: '#fbbf24', fontSize: '12px', marginBottom: '16px', fontWeight: 700 }}>{review.serviceName || 'General'}</div>
                                                                <div style={{ fontSize: '18px', fontWeight: 600 }}>{review.reviewerName}</div>
                                                                <div style={{ color: '#fbbf24', margin: '8px 0' }}>{'★'.repeat(Math.round(review.rating))}</div>
                                                                <div style={{ color: '#d1fae5', fontSize: '14px', fontStyle: 'italic' }}>"{review.comment}"</div>
                                                            </>
                                                        )}

                                                        {theme === 'minimal-list' && (
                                                            <>
                                                                <div style={{ textAlign: 'center', borderRight: '1px solid #eee', paddingRight: '20px' }}>
                                                                    <div style={{ fontWeight: 700, color: '#111' }}>{review.reviewerName}</div>
                                                                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{review.serviceName}</div>
                                                                    <div style={{ color: '#f97316', marginTop: '8px' }}>{'★'.repeat(Math.round(review.rating))}</div>
                                                                </div>
                                                                <div style={{ fontSize: '15px', color: '#444', lineHeight: 1.5 }}>"{review.comment}"</div>
                                                            </>
                                                        )}

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
