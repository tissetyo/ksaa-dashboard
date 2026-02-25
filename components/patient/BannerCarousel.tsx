'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Banner {
    id: string;
    title?: string | null;
    imageUrl: string;
    linkType: string;
    linkUrl?: string | null;
    serviceId?: string | null;
    isActive: boolean;
    order: number;
}

interface BannerCarouselProps {
    banners: Banner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
    const [current, setCurrent] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const total = banners.length;

    const next = useCallback(() => {
        setCurrent((prev) => (prev + 1) % total);
    }, [total]);

    const prev = useCallback(() => {
        setCurrent((prev) => (prev - 1 + total) % total);
    }, [total]);

    useEffect(() => {
        if (total <= 1 || isHovered) return;
        const timer = setInterval(next, 4000);
        return () => clearInterval(timer);
    }, [next, total, isHovered]);

    if (!banners || total === 0) return null;

    const getBannerHref = (banner: Banner) => {
        if (banner.linkType === 'service' && banner.serviceId) {
            return `/book?service=${banner.serviceId}`;
        }
        return banner.linkUrl || '#';
    };

    return (
        <div
            className="relative w-full overflow-hidden rounded-2xl shadow-lg"
            style={{ aspectRatio: '16/5' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Slides */}
            <div
                className="flex h-full transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                {banners.map((banner) => {
                    const href = getBannerHref(banner);
                    const isExternal = href.startsWith('http');

                    const content = (
                        <div className="relative w-full h-full flex-shrink-0 cursor-pointer group">
                            <img
                                src={banner.imageUrl}
                                alt={banner.title || 'Banner'}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                            {banner.title && (
                                <div className="absolute bottom-4 left-6 text-white">
                                    <p className="text-lg font-bold drop-shadow-lg">{banner.title}</p>
                                </div>
                            )}
                        </div>
                    );

                    return isExternal ? (
                        <a
                            key={banner.id}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 w-full h-full block"
                        >
                            {content}
                        </a>
                    ) : (
                        <Link
                            key={banner.id}
                            href={href}
                            className="flex-shrink-0 w-full h-full block"
                        >
                            {content}
                        </Link>
                    );
                })}
            </div>

            {/* Navigation arrows — only show if more than 1 banner */}
            {total > 1 && (
                <>
                    <button
                        onClick={(e) => { e.preventDefault(); prev(); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 backdrop-blur-sm text-white rounded-full p-1.5 transition-all duration-200 shadow"
                        aria-label="Previous banner"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); next(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 backdrop-blur-sm text-white rounded-full p-1.5 transition-all duration-200 shadow"
                        aria-label="Next banner"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-3 right-4 flex gap-1.5">
                        {banners.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={cn(
                                    'rounded-full transition-all duration-300',
                                    i === current ? 'bg-white w-5 h-2' : 'bg-white/50 w-2 h-2'
                                )}
                                aria-label={`Go to banner ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
