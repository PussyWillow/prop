import React, { useMemo, useState } from 'react';
import type { DiaryEntry } from '../types';
import { FileText, Star, Upload, Download, BarChart3, BookOpen, CloudUpload, CloudDownload, Search } from './Icons';
import { StatCard } from './StatCard';
import { TimelineEntryCard } from './TimelineEntryCard';
import LoadingSpinner from './LoadingSpinner';
import { motion } from 'framer-motion';

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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

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
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredEntries = useMemo(() => {
        const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (!searchQuery) {
            return sortedEntries;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return sortedEntries.filter(entry =>
            entry.title.toLowerCase().includes(lowercasedQuery) ||
            entry.content.toLowerCase().includes(lowercasedQuery)
        );
    }, [entries, searchQuery]);

    if (isSyncing) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner text="Syncing with GitHub..." />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                        {stats.topThemes.length > 0 ? (
                            <ul className="space-y-2">
                                {stats.topThemes.map(([theme, count]) => (
                                    <li key={theme} className="text-sm flex justify-between items-center bg-amber-50/50 dark:bg-stone-700/30 px-3 py-1.5 rounded-md">
                                        <span className="capitalize text-amber-800 dark:text-stone-300">{theme}</span>
                                        <span className="font-semibold text-amber-600 dark:text-amber-400">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-stone-500 dark:text-stone-400 italic">No themes found yet. Find echoes in your entries to see themes here.</p>
                        )}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-amber-200 dark:border-stone-700">
                        <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-3">{isHebrew ? 'ניהול נתונים' : 'Data Management'}</h4>
                        <div className="flex flex-col gap-3">
                            {isGithubConfigured ? (
                                <>
                                    <button onClick={onSyncFromGithub} disabled={isSyncing} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors shadow disabled:opacity-50">
                                        <CloudDownload className="w-4 h-4" /> Sync from GitHub
                                    </button>
                                    <button onClick={onSyncToGithub} disabled={isSyncing} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors shadow disabled:opacity-50">
                                        <CloudUpload className="w-4 h-4" /> Sync to GitHub
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={onImportClick} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-lg transition-colors">
                                        <Upload className="w-4 h-4" /> {isHebrew ? 'ייבוא מגיבוי' : 'Import from Backup'}
                                    </button>
                                    <button onClick={onExportClick} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-800 dark:text-green-300 rounded-lg transition-colors">
                                        <Download className="w-4 h-4" /> {isHebrew ? 'ייצוא לגיבוי' : 'Export to Backup'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Timeline */}
            <main className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-serif text-amber-900 dark:text-amber-200 flex items-center gap-3">
                        <BookOpen className="w-6 h-6" />
                        {isHebrew ? 'הכרוניקה שלך' : 'Your Chronicle'}
                    </h3>
                    <div className="relative w-full max-w-xs">
                         <input
                            type="text"
                            placeholder={isHebrew ? 'חפש ברשומות...' : 'Search entries...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-2 border-amber-300 dark:border-stone-600 rounded-lg bg-white/80 dark:bg-stone-700/50 text-amber-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 transition-colors"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-amber-500 dark:text-stone-400" />
                        </div>
                    </div>
                </div>

                {filteredEntries.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {filteredEntries.map((entry) => (
                           <motion.div key={`entry-${entry.id}`} variants={itemVariants}>
                                <TimelineEntryCard 
                                    entry={entry} 
                                    onLoad={() => onLoadEntry(entry)} 
                                    onDelete={() => onDeleteEntry(entry.id)} 
                                />
                           </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center py-16 px-6 border-2 border-dashed border-amber-300 dark:border-stone-600 rounded-lg bg-amber-50/50 dark:bg-stone-800/30">
                         {searchQuery ? (
                            <>
                                <Search className="w-12 h-12 text-amber-400 dark:text-stone-500 mx-auto mb-4"/>
                                <h4 className="text-lg font-semibold text-amber-800 dark:text-stone-300">No Entries Found</h4>
                                <p className="text-sm text-amber-600 dark:text-stone-400 mt-2">Your search for "{searchQuery}" did not match any entries.</p>
                            </>
                        ) : (
                            <>
                                <FileText className="w-12 h-12 text-amber-400 dark:text-stone-500 mx-auto mb-4"/>
                                <h4 className="text-lg font-semibold text-amber-800 dark:text-stone-300">Your Chronicle is Empty</h4>
                                <p className="text-sm text-amber-600 dark:text-stone-400 mt-2">Write and save a new entry to begin your journey.</p>
                            </>
                        )}
                    </motion.div>
                )}
            </main>
        </motion.div>
    );
};