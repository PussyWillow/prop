import React from 'react';
import type { HistoricalEcho } from '../types';
import { Star, MapPin, Link } from './Icons';

interface TimelineEchoCardProps {
    echo: HistoricalEcho;
    onHover: (keywords: string[]) => void;
}

export const TimelineEchoCard = ({ echo, onHover }: TimelineEchoCardProps) => (
    <div 
        className="bg-stone-50/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 rounded-lg p-3 space-y-3 transition-shadow hover:shadow-md"
        onMouseEnter={() => onHover(echo.triggeringKeywords || [])}
        onMouseLeave={() => onHover([])}
    >
        <div className="flex items-start gap-3">
            <span className="text-2xl mt-1">{echo.icon}</span>
            <div className="flex-1">
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400">{echo.era}</p>
                <h3 className="font-semibold text-gray-800 dark:text-stone-200">{echo.author}</h3>
                <p className="text-sm text-gray-600 dark:text-stone-400 italic mt-1">"{echo.text}"</p>
            </div>
        </div>

        <div className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/20 p-2 rounded-md">
            <Link className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p><span className="font-semibold">Connection:</span> {echo.connection}</p>
        </div>
        
        <div className="flex items-center justify-between">
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-purple-800 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/40`}>
                <Star className="w-3 h-3"/>
                <span className="capitalize">{echo.theme}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                <MapPin className="w-3 h-3"/>
                <span>{echo.location}</span>
            </div>
        </div>
    </div>
);