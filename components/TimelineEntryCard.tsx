import React, { useState } from 'react';
import type { DiaryEntry } from '../types';
import { Calendar, Trash2, Star, Edit, ChevronDown } from './Icons';
import { TimelineEchoCard } from './TimelineEchoCard';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelineEntryCardProps {
    entry: DiaryEntry;
    onLoad: () => void;
    onDelete: () => void;
}

const HighlightedContent = ({ content, keywords }: { content: string, keywords: string[] }) => {
    if (!keywords || keywords.length === 0) {
        return <>{content.split('\n').map((line, i) => <p key={i} className="mb-2 last:mb-0">{line}</p>)}</>;
    }
    // Escape special characters for regex and join with '|'
    const escapedKeywords = keywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
    
    return (
        <>
            {content.split('\n').map((line, lineIndex) => (
                <p key={lineIndex} className="mb-2 last:mb-0">
                    {line.split(regex).map((part, i) =>
                        escapedKeywords.some(kw => new RegExp(`^${kw}$`, 'i').test(part)) ? (
                            <span key={i} className="bg-amber-200 dark:bg-amber-700/50 rounded transition-colors px-1 py-0.5">
                                {part}
                            </span>
                        ) : (
                            <span key={i}>{part}</span>
                        )
                    )}
                </p>
            ))}
        </>
    );
};

export const TimelineEntryCard = ({ entry, onLoad, onDelete }: TimelineEntryCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [hoveredEchoKeywords, setHoveredEchoKeywords] = useState<string[]>([]);
    const hasEchoes = entry.echoes && entry.echoes.length > 0;

    return (
        <div className="relative pl-8 group">
            <div className="absolute top-0 left-3 h-full w-px bg-amber-300 dark:bg-stone-600"></div>
            <div className="absolute top-5 left-0 h-5 w-5 rounded-full bg-amber-500 dark:bg-amber-400 border-2 border-white dark:border-stone-800 shadow-sm"></div>
            <div className="mb-8 ml-4">
                <div 
                    className={`bg-gradient-to-br from-white to-amber-50/50 dark:from-stone-800 dark:to-stone-800/50 backdrop-blur-sm border-2 ${isExpanded ? 'border-amber-500 dark:border-amber-400' : 'border-amber-400 dark:border-stone-700'} rounded-lg transition-all hover:shadow-lg hover:border-amber-500 dark:hover:border-amber-500 overflow-hidden`}
                >
                    <div 
                        className={`p-4 ${hasEchoes ? 'cursor-pointer' : ''}`}
                        onClick={() => hasEchoes && setIsExpanded(!isExpanded)}
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <time className="mb-1 text-sm font-normal leading-none text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </time>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-stone-100">{entry.title}</h3>
                                {!isExpanded && <p className="text-sm text-gray-600 dark:text-stone-400 line-clamp-2 mt-1">{entry.content}</p>}
                            </div>
                            <div className="flex items-center flex-shrink-0">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onLoad(); }}
                                    aria-label="Edit entry"
                                    className="p-2 text-gray-400 dark:text-stone-500 hover:bg-amber-100 dark:hover:bg-stone-700 hover:text-amber-600 dark:hover:text-amber-400 rounded-full transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); if (confirm('Are you sure you want to delete this entry?')) onDelete(); }}
                                    aria-label="Delete entry"
                                    className="p-2 text-gray-400 dark:text-stone-500 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        {hasEchoes && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                                <Star className="w-4 h-4" />
                                <span>{entry.echoes.length} echoes discovered</span>
                                <ChevronDown className={`w-4 h-4 ml-auto transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 border-t border-amber-200/50 dark:border-stone-700/50 space-y-4">
                                    <div className="prose prose-sm dark:prose-invert prose-p:text-stone-700 dark:prose-p:text-stone-300 font-serif leading-relaxed">
                                        <HighlightedContent content={entry.content} keywords={hoveredEchoKeywords} />
                                    </div>
                                    {hasEchoes && (
                                        <div>
                                            <h4 className="font-semibold text-sm mb-2 text-amber-800 dark:text-amber-300">Historical Echoes:</h4>
                                            <div className="space-y-4">
                                                {entry.echoes.map(echo => (
                                                    <TimelineEchoCard 
                                                        key={echo.id} 
                                                        echo={echo} 
                                                        onHover={(keywords) => setHoveredEchoKeywords(keywords)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}