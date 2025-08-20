
import React from 'react';
import type { HistoricalEcho } from '../types';
import { Star, MapPin, BookOpen } from './Icons';
import { getThemeColor } from '../utils/themeColors';

interface TimelineEchoCardProps {
    echo: HistoricalEcho;
}

export const TimelineEchoCard = ({ echo }: TimelineEchoCardProps) => (
    <div className="bg-stone-50/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 rounded-lg p-3">
        <div className="flex items-start gap-3">
            <span className="text-2xl mt-1">{echo.icon}</span>
            <div className="flex-1">
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400">{echo.era}</p>
                <h3 className="font-semibold text-gray-800 dark:text-stone-200">{echo.author}</h3>
                <p className="text-sm text-gray-600 dark:text-stone-400 italic mt-1">"{echo.text}"</p>
            </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getThemeColor(echo.theme)}`}>
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