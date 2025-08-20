
import React, { useMemo } from 'react';
import type { DiaryEntry, HistoricalEcho } from '../types';
import { FileText, Star, Upload, Download, BarChart3, BookOpen, CloudUpload, CloudDownload } from './Icons';
import { StatCard } from './StatCard';
import { TimelineEntryCard } from './TimelineEntryCard';
import { TimelineEchoCard } from './TimelineEchoCard';
import LoadingSpinner from './LoadingSpinner';

interface DashboardProps {
  entries: DiaryEntry[];
  isHebrew: boolean;
  onLoadEntry: (entry: DiaryEntry) => void;
  onDeleteEntry: (id: number) => void;
  onImportClick: () => void;
  onExportClick: () => void;
  isGithubConfigured: boolean;
  onSyncFromGithub: () => void;
  onSyncToGithub: () => void;
  isSyncing: boolean;
}

type TimelineItem = 
    | { type: 'entry'; date: Date; data: DiaryEntry }
    | { type: 'echo'; date: Date; data: HistoricalEcho & { parentEntryTitle: string } };

export const ImmersiveDashboard = ({ 
    entries, 
    isHebrew, 
    onLoadEntry, 
    onDeleteEntry, 
    onImportClick, 
    onExportClick, 
    isGithubConfigured,
    onSyncFromGithub,
    onSyncToGithub,
    isSyncing,
}: DashboardProps) => {

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
                <div className="bg-white/60 backdrop-blur-sm border border-amber-200 rounded-lg p-6 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%23a16207%22%20fill-opacity%3D%220.05%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')]">
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
                                    <li key={theme} className="flex justify-between items-center text-sm bg-white/70 p-2 rounded-md border border-amber-200">
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
                        {isGithubConfigured ? (
                             <div className="relative">
                                {isSyncing && (
                                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg z-10">
                                        <div className="w-6 h-6 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <button onClick={onSyncFromGithub} disabled={isSyncing} className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-wait"><CloudDownload className="w-4 h-4" />Sync from GitHub</button>
                                <button onClick={onSyncToGithub} disabled={entries.length === 0 || isSyncing} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-wait"><CloudUpload className="w-4 h-4" />Sync to GitHub</button>
                            </div>
                        ) : (
                             <>
                                <button onClick={onImportClick} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"><Upload className="w-4 h-4" />{isHebrew ? 'ייבוא' : 'Import'}</button>
                                <button onClick={onExportClick} disabled={entries.length === 0} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm disabled:bg-gray-400"><Download className="w-4 h-4" />{isHebrew ? 'ייצוא' : 'Export'}</button>
                            </>
                        )}
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