
import React from 'react';
import type { HistoricalEcho } from '../types';
import { Star } from './Icons';
import { getThemeColor } from '../utils/themeColors';

interface TimelineEchoCardProps {
    echo: HistoricalEcho & { parentEntryTitle: string };
}

export const TimelineEchoCard = ({ echo }: TimelineEchoCardProps) => (
    <div className="relative pl-8 group">
        <div className="absolute top-0 left-3 h-full w-px bg-stone-200 dark:bg-stone-700"></div>
        <div className="absolute top-5 left-1 h-3 w-3 rounded-full bg-stone-400 dark:bg-stone-500 border-2 border-white dark:border-stone-800"></div>
        <div className="mb-8 ml-4">
            <div className="bg-stone-50/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 rounded-lg p-4 transition-shadow hover:shadow-md dark:hover:shadow-black/20">
                <time className="mb-1 text-sm font-normal leading-none text-stone-500 dark:text-stone-400">{echo.era}</time>
                <div className="flex items-start gap-3 mt-1">
                    <span className="text-2xl mt-1">{echo.icon}</span>
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-stone-200">{echo.author}</h3>
                        <p className="text-sm text-gray-600 dark:text-stone-400 italic">"{echo.text}"</p>
                    </div>
                </div>
                <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getThemeColor(echo.theme)}`}>
                    <Star className="w-3 h-3"/>
                    <span className="capitalize">{echo.theme}</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 pt-2 border-t border-stone-200 dark:border-stone-700">Echo found in: "{echo.parentEntryTitle}"</p>
            </div>
        </div>
    </div>
);