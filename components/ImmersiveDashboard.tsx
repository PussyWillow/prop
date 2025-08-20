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
                <div className="bg-white/60 dark:bg-stone-800/50 backdrop-blur-sm border border-amber-200 dark:border-stone-700 rounded-lg p-6 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%23a16207%22%20fill-opacity%3D%220.05%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')]">
                     <h3 className="text-2xl font-serif text-amber-900 dark:text-amber-200 border-b dark:border-stone-600 pb-3 mb-4 flex items-center gap-3">
                        <BarChart3 className="w-6 h-6" />
                        {isHebrew ? 'תובנות' : 'Insights'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 mb-6">
                        <StatCard title={isHebrew ? 'סה"כ רשומות' : 'Total Entries'} value={stats.totalEntries} icon={<FileText className="w-6 h-6" />} />
                        <StatCard title={isHebrew ? 'סה"כ הדים' : 'Total Echoes'} value={stats.totalEchoes} icon={<Star className="w-6 h-6" />} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-3 mt-2">{isHebrew ? 'נושאים מובילים' : 'Top Themes'}</h4>
                        {stats.topThemes.length >