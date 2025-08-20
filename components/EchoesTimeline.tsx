import React, { useState } from 'react';
import type { HistoricalEcho } from '../types';
import { Heart, MapPin, BookOpen, Star, ChevronDown } from './Icons';
import { getThemeColor } from '../utils/themeColors';

const EchoTimelineCard = ({ echo, isExpanded, onToggle, isHebrew }: { echo: HistoricalEcho; isExpanded: boolean; onToggle: () => void; isHebrew: boolean; }) => {
    const isEchoHebrew = /[\u0590-\u05FF]/.test(echo.text);

    return (
        <div className="relative pl-8 py-4 group">
            {/* Timeline line and dot */}
            <div className="absolute top-0 left-3 h-full w-px bg-amber-200 dark:bg-stone-700"></div>
            <div className={`absolute top-6 left-0 h-5 w-5 rounded-full bg-white dark:bg-stone-600 border-2 border-amber-400 dark:border-amber-500 group-hover:bg-amber-100 dark:group-hover:bg-stone-500 transition-colors`}></div>
            
            {/* Card Content */}
            <div className="bg-white/60 dark:bg-stone-800/50 backdrop-blur-sm border border-amber-200 dark:border-stone-700 rounded-lg overflow-hidden transition-shadow hover:shadow-md dark:hover:shadow-black/20">
                <div className="p-4 cursor-pointer" onClick={onToggle}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                            <span className={`flex-shrink-0 text-3xl mt-1`}>{echo.icon}</span>
                            <div className="flex-1">
                                <h4 className="font-semibold font-serif text-amber-900 dark:text-amber-200">{echo.author}</h4>
                                <p className="text-sm text-amber-700 dark:text-amber-400">{echo.era}</p>
                                <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getThemeColor(echo.theme)}`}>
                                    <Heart className="w-3 h-3"/>
                                    <span className="capitalize">{echo.theme}</span>
                                </div>
                            </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-amber-500 dark:text-amber-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
                    </div>
                </div>

                {/* Expandable Content */}
                <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                        <div className="px-4 pb-4 pt-2 border-t border-amber-200 dark:border-stone-700">
                             <blockquote className={`text-md font-serif italic text-gray-700 dark:text-stone-300 mb-4 pl-3 border-l-2 border-amber-300 dark:border-amber-500 ${isEchoHebrew ? 'text-right' : 'text-left'}`} style={{ direction: isEchoHebrew ? 'rtl' : 'ltr' }}>
                                "{echo.text}"
                            </blockquote>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" /><div><p className="font-medium text-gray-800 dark:text-stone-200">Location:</p><p className="text-gray-600 dark:text-stone-400">{echo.location}</p></div></div>
                                <div className="flex items-start gap-3"><BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" /><div><p className="font-medium text-gray-800 dark:text-stone-200">Context:</p><p className="text-gray-600 dark:text-stone-400 leading-relaxed">{echo.context}</p></div></div>
                                <div className="flex items-start gap-3"><Star className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" /><div><p className="font-medium text-gray-800 dark:text-stone-200">Type:</p><p className="text-gray-600 dark:text-stone-400 capitalize">{echo.type}</p></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const EchoesTimeline = ({ echoes, isHebrew }: { echoes: HistoricalEcho[]; isHebrew: boolean; }) => {
    const [expandedId, setExpandedId] = useState<number | null>(echoes.length > 0 ? echoes[0].id : null);

    const handleToggle = (id: number) => {
        setExpandedId(prevId => (prevId === id ? null : id));
    };

    if (!echoes || echoes.length === 0) {
        return null;
    }

    return (
        <div className="w-full">
            <h3 className="text-xl font-serif text-amber-900 dark:text-amber-200 mb-4 pl-8 relative" style={{ direction: isHebrew ? 'rtl' : 'ltr' }}>
                <div className={`absolute top-0 h-full w-px bg-amber-200 dark:bg-stone-700 ${isHebrew ? 'right-3' : 'left-3'}`}></div>
                {isHebrew ? 'הדים היסטוריים' : 'Historical Echoes'}
            </h3>
            <div className="h-[26rem] lg:h-[28rem] overflow-y-auto pr-2">
                {echoes.map((echo) => (
                    <EchoTimelineCard
                        key={echo.id}
                        echo={echo}
                        isExpanded={expandedId === echo.id}
                        onToggle={() => handleToggle(echo.id)}
                        isHebrew={isHebrew}
                    />
                ))}
            </div>
        </div>
    );
};