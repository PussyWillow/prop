import React, { useMemo } from 'react';
import type { DiaryEntry, HistoricalEcho } from '../types';
import { FileText, Star, Upload, Download, BarChart3, Calendar, Trash2, BookOpen } from './Icons';

interface DashboardProps {
  entries: DiaryEntry[];
  isHebrew: boolean;
  onLoadEntry: (entry: DiaryEntry) => void;
  onDeleteEntry: (id: number) => void;
  onImportClick: () => void;
  onExportClick: () => void;
}

type TimelineItem = 
    | { type: 'entry'; date: Date; data: DiaryEntry }
    | { type: 'echo'; date: Date; data: HistoricalEcho & { parentEntryTitle: string } };

const getThemeColor = (theme?: string): string => {
    const colors: { [key: string]: string } = {
      impermanence: 'from-pink-400 to-rose-300',
      friendship: 'from-green-400 to-emerald-300',
      solitude: 'from-blue-400 to-indigo-300',
      longing: 'from-purple-400 to-violet-300',
      community: 'from-orange-400 to-amber-300',
      creativity: 'from-red-400 to-pink-300',
      inspiration: 'from-yellow-400 to-orange-300',
      discovery: 'from-cyan-400 to-blue-300',
      wonder: 'from-indigo-400 to-purple-300',
      hope: 'from-emerald-400 to-green-300',
      artistry: 'from-violet-400 to-purple-300',
    };
    return theme ? colors[theme.toLowerCase()] || 'from-gray-400 to-slate-300' : 'from-gray-400 to-slate-300';
};


const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-amber-100/50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
            <div className="text-amber-600">{icon}</div>
            <div>
                <p className="text-sm text-amber-800 font-medium">{title}</p>
                <p className="text-2xl font-semibold text-amber-900">{value}</p>
            </div>
        </div>
    </div>
);

const TimelineEntryCard = ({ entry, onLoad, onDelete }: { entry: DiaryEntry, onLoad: () => void, onDelete: () => void }) => (
    <div className="relative pl-8 group cursor-pointer" onClick={onLoad}>
        <div className="absolute top-0 left-3 h-full w-px bg-amber-300"></div>
        <div className="absolute top-5 left-0 h-5 w-5 rounded-full bg-amber-500 border-2 border-white shadow-sm"></div>
        <div className="mb-8 ml-4">
            <div className="bg-white/60 backdrop-blur-sm border-2 border-amber-400 rounded-lg p-4 transition-shadow hover:shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <time className="mb-1 text-sm font-normal leading-none text-amber-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </time>
                        <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{entry.content}</p>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); if (confirm('Are you sure you want to delete this entry?')) onDelete(); }}
                        className="p-2 text-gray-400 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
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

const TimelineEchoCard = ({ echo }: { echo: HistoricalEcho & { parentEntryTitle: string } }) => (
    <div className="relative pl-8 group">
        <div className="absolute top-0 left-3 h-full w-px bg-stone-200"></div>
        <div className="absolute top-5 left-1 h-3 w-3 rounded-full bg-stone-400 border-2 border-white"></div>
        <div className="mb-8 ml-4">
            <div className="bg-stone-50/80 backdrop-blur-sm border border-stone-200 rounded-lg p-4">
                <time className="mb-1 text-sm font-normal leading-none text-stone-500">{echo.era}</time>
                <div className="flex items-start gap-3 mt-1">
                    <span className="text-2xl mt-1">{echo.icon}</span>
                    <div>
                        <h3 className="font-semibold text-gray-800">{echo.author}</h3>
                        <p className="text-sm text-gray-600 italic">"{echo.text}"</p>
                    </div>
                </div>
                <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getThemeColor(echo.theme)}`}>
                    <Star className="w-3 h-3"/>
                    <span className="capitalize">{echo.theme}</span>
                </div>
                <p className="text-xs text-stone-500 mt-2 pt-2 border-t border-stone-200">Echo found in: "{echo.parentEntryTitle}"</p>
            </div>
        </div>
    </div>
);


export const ImmersiveDashboard = ({ entries, isHebrew, onLoadEntry, onDeleteEntry, onImportClick, onExportClick }: DashboardProps) => {

    const stats = useMemo(() => {
        const totalEntries = entries.length;
        const totalEchoes = entries.reduce((acc, entry) => acc + (entry.echoes?.length || 0), 0);
        const themeCounts = entries.flatMap(entry => entry.echoes?.map(echo => echo.theme.toLowerCase()) || []).reduce((acc, theme) => {
                acc[theme] = (acc[theme] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
        const topThemes = Object.entries(themeCounts).sort(([, countA], [, countB]) => countB - countA).slice(0, 5);
        return { totalEntries, totalEchoes, topThemes };
    }, [entries]);
    
    const timelineItems = useMemo(() => {
        const items: TimelineItem[] = [];
        const yearRegex = /\b\d{4}\b/;

        entries.forEach(entry => {
            items.push({ type: 'entry', date: new Date(entry.date), data: entry });
            if (entry.echoes) {
                entry.echoes.forEach(echo => {
                    const match = echo.era.match(yearRegex);
                    const year = match ? parseInt(match[0], 10) : new Date(entry.date).getFullYear();
                    items.push({
                        type: 'echo',
                        date: new Date(year, 0, 1),
                        data: { ...echo, parentEntryTitle: entry.title }
                    });
                });
            }
        });
        
        return items.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [entries]);

    return (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Insights Panel */}
            <aside className="lg:col-span-1 lg:sticky top-6 self-start">
                <div className="bg-white/60 backdrop-blur-sm border border-amber-200 rounded-lg p-6">
                     <h3 className="text-2xl font-serif text-amber-900 border-b pb-3 mb-4 flex items-center gap-3">
                        <BarChart3 className="w-6 h-6" />
                        {isHebrew ? 'תובנות' : 'Insights'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 mb-6">
                        <StatCard title={isHebrew ? 'סה"כ רשומות' : 'Total Entries'} value={stats.totalEntries} icon={<FileText className="w-6 h-6" />} />
                        <StatCard title={isHebrew ? 'סה"כ הדים' : 'Total Echoes'} value={stats.totalEchoes} icon={<Star className="w-6 h-6" />} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-amber-800 mb-3 mt-2">{isHebrew ? 'נושאים מובילים' : 'Top Themes'}</h4>
                        {stats.topThemes.length > 0 ? (
                            <ul className="space-y-2">
                                {stats.topThemes.map(([theme, count]) => (
                                    <li key={theme} className="flex justify-between items-center text-sm bg-white p-2 rounded-md border">
                                        <span className="capitalize text-gray-700">{theme}</span>
                                        <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 italic">{isHebrew ? 'אין נושאים עדיין' : 'No themes yet.'}</p>
                        )}
                    </div>
                    <div className="mt-6 pt-6 border-t border-amber-200 flex flex-col sm:flex-row lg:flex-col gap-3">
                         <button onClick={onImportClick} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"><Upload className="w-4 h-4" />{isHebrew ? 'ייבוא' : 'Import'}</button>
                         <button onClick={onExportClick} disabled={entries.length === 0} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm disabled:bg-gray-400"><Download className="w-4 h-4" />{isHebrew ? 'ייצוא' : 'Export'}</button>
                    </div>
                </div>
            </aside>
            
            {/* Timeline Panel */}
            <main className="lg:col-span-2">
                 <h3 className="text-2xl font-serif text-amber-900 mb-6 flex items-center gap-3">
                    <BookOpen className="w-6 h-6" />
                    {isHebrew ? 'הכרוניקה שלך' : 'Your Chronicle'}
                </h3>
                <div>
                    {timelineItems.length > 0 ? (
                        timelineItems.map((item, index) =>
                            item.type === 'entry' ? (
                                <TimelineEntryCard 
                                    key={`entry-${item.data.id}`} 
                                    entry={item.data} 
                                    onLoad={() => onLoadEntry(item.data)}
                                    onDelete={() => onDeleteEntry(item.data.id)}
                                />
                            ) : (
                                <TimelineEchoCard 
                                    key={`echo-${item.data.id}-${index}`} 
                                    echo={item.data}
                                />
                            )
                        )
                    ) : (
                        <div className="text-center py-16 px-6 bg-white/50 rounded-lg border border-amber-200">
                             <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">Your chronicle is empty.</p>
                             <p className="text-gray-400 text-sm mt-2">Write a new entry to begin your journey through time.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};