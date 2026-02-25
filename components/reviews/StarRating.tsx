'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface StarRatingProps {
    rating: number;
    onRatingChange: (rating: number) => void;
    disabled?: boolean;
    className?: string;
}

export function StarRating({
    rating,
    onRatingChange,
    disabled = false,
    className
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className={cn("flex gap-1", className)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={disabled}
                    onClick={() => onRatingChange(star)}
                    onMouseEnter={() => !disabled && setHoverRating(star)}
                    onMouseLeave={() => !disabled && setHoverRating(0)}
                    className={cn(
                        "transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm p-1",
                        disabled ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"
                    )}
                >
                    <Star
                        className={cn(
                            "w-8 h-8",
                            (hoverRating || rating) >= star
                                ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                                : "text-gray-300 fill-transparent"
                        )}
                        strokeWidth={1.5}
                    />
                </button>
            ))}
        </div>
    );
}
