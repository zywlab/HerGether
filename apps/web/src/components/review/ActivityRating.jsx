import React from "react";
import { Star } from "lucide-react";

export default function ActivityRating({ reviews, className = "", onClick }) {
    const wrapperClasses = `flex items-center gap-1 ${className} ${onClick ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''}`;
    
    if (!reviews || reviews.length === 0) {
        return (
            <div className={wrapperClasses} onClick={onClick}>
                <Star className="w-4 h-4 text-pink-500 fill-pink-500" />
                <span className="text-sm text-gray-500">暂无评价</span>
            </div>
        );
    }

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const roundedRating = Math.round(averageRating * 10) / 10;

    return (
        <div 
            className={wrapperClasses}
            onClick={onClick}
        >
            <Star className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span className="text-sm font-medium text-gray-700">{roundedRating.toFixed(2)}</span>
            <span className="text-xs text-gray-500">({reviews.length}条评价)</span>
        </div>
    );
}