
import React from 'react';
import type { DiaryEntry } from '../types';
import { Calendar, Trash2, Star, Edit } from './Icons';

interface TimelineEntryCardProps {
    entry: DiaryEntry;
    onLoad: () => void;
    onDelete: () => void;
}

export const TimelineEntryCard = ({ entry, onLoad, onDelete }: TimelineEntryCardProps) => (
    <div className="relative pl-8 group">
        <div className="absolute top-0 left-3 h-full w-px bg-amber-300"></div>
        <div className="absolute top-5 left-0 h-5 w-5 rounded-full bg-amber-500 border-2 border-white shadow-sm"></div>
        <div className="mb-8 ml-4">
            <div className="bg-gradient-to-br from-white to-amber-50/50 backdrop-blur-sm border-2 border-amber-400 rounded-lg p-4 transition-all hover:shadow-lg hover:border-amber-500">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <time className="mb-1 text-sm font-normal leading-none text-amber-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </time>
                        <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{entry.content}</p>
                    </div>
                    <div className="flex items-center flex-shrink-0">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onLoad(); }}
                            aria-label="Edit entry"
                            className="p-2 text-gray-400 hover:bg-amber-100 hover:text-amber-600 rounded-full transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); if (confirm('Are you sure you want to delete this entry?')) onDelete(); }}
                            aria-label="Delete entry"
                            className="p-2 text-gray-400 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {entry.echoes && entry.echoes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-amber-200/50 flex items-center gap-2 text-xs text-amber-700">
                        <Star className="w-4 h-4" />
                        <span>{entry.echoes.length} echoes discovered</span>
                    </div>
                )}
            </div>
        </div>
    </div>
);