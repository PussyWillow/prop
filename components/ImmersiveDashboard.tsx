import React, { useMemo, useState } from 'react';
import type { DiaryEntry } from '../types';
import { FileText, Star, Upload, Download, BarChart3, BookOpen, CloudUpload, CloudDownload, Search, Hash, Users, Sunrise, Calendar, Type, GitMerge, LayoutDashboard } from './Icons';
import { StatCard } from './StatCard';
import { TimelineEntryCard } from './TimelineEntryCard';
import LoadingSpinner from './LoadingSpinner';
import { motion } from 'framer-motion';
import { ConstellationView } from './ConstellationView';

type DashboardView = 'chronicle' | 'constellation';

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

const ThemeBarChart = ({ themes, isHebrew }: { themes: [string, number][], isHebrew: boolean }) => {
    const maxCount = Math.max(...themes.map(([, count]) => count), 0);
    return (
        <div>
            <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-3 mt-2">{isHebrew ? 'נושאים מובילים' : 'Top Themes'}</h4>
            {themes.length > 0 ? (
                <div className="space-y-3">
                    {themes.map(([theme, count]) => (
                        <div key={theme} className="group">
                            <div className="flex justify-between items-center mb-1">
                                <span className="capitalize text-sm text-amber-800 dark:text-stone-300 font-medium">{theme}</span>
                                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{count}</span>
                            </div>
                            <div className="w-full bg-amber-200/50 dark:bg-stone-700 rounded-full h-2.5">
                                <div
                                    className="bg-gradient-to-r from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-600 h-2.5 rounded-full transition-all duration-500 ease-out group-hover:from-purple-500 group-hover:to-purple-600"
                                    style={{ width: `${(count / maxCount) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-stone-500 dark:text-stone-400 italic">No themes found yet. Find echoes in your entries to see themes here.</p>
            )}
        </div>
    );
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
    const [dashboardView, setDashboardView] = useState<DashboardView>('chronicle');

    const stats = useMemo(() => {
        const totalEntries = entries.length;
        if (totalEntries === 0) {
            return { totalEntries: 0, totalEchoes: 0, topThemes: [], avgEchoesPerEntry: '0', favoriteDay: 'N/A', prolificMonth: 'N/A', mostCommonEchoType: 'N/A', totalWords: 0, avgWordsPerEntry: '0' };
        }

        const totalEchoes = entries.reduce((acc, entry) => acc + (entry.echoes?.length || 0), 0);
        
        const themeCounts = entries.flatMap(entry => entry.echoes?.map(echo => {
            // Normalize theme: trim, lowercase, remove trailing punctuation
            return echo.theme.trim().toLowerCase().replace(/[.,!?;]$/, '');
        }) || []).reduce((acc, theme) => {
            if (theme) {
              acc[theme] = (acc[theme] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const topThemes = Object.entries(themeCounts).sort(([, countA], [, countB]) => countB - countA).slice(0, 5);

        const avgEchoesPerEntry = (totalEchoes / totalEntries).toFixed(1);

        const dayCounts = entries.reduce((acc, entry) => {
            const day = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' });
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const favoriteDay = Object.keys(dayCounts).length > 0 ? Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0][0] : 'N/A';
        
        const monthCounts = entries.reduce((acc, entry) => {
            const month = new Date(entry.date).toLocaleDateString('en-US', { month: 'long' });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const prolificMonth = Object.keys(monthCounts).length > 0 ? Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0][0] : 'N/A';

        const echoTypeCounts = entries.flatMap(e => e.echoes?.map(echo => echo.type) || []).reduce((acc, type) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const mostCommonEchoType = Object.keys(echoTypeCounts).length > 0 ? Object.entries(echoTypeCounts).sort((a, b) => b[1] - a[1])[0][0] : 'N/A';
        
        const totalWords = entries.reduce((acc, entry) => acc + (entry.content.split(/\s+/).filter(Boolean).length || 0), 0);
        const avgWordsPerEntry = (totalWords / totalEntries).toFixed(0);

        return { totalEntries, totalEchoes, topThemes, avgEchoesPerEntry, favoriteDay, prolificMonth, mostCommonEchoType, totalWords, avgWordsPerEntry };
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
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <StatCard title={isHebrew ? 'סה"כ רשומות' : 'Total Entries'} value={stats.totalEntries} icon={<FileText className="w-6 h-6" />} />
                        <StatCard title={isHebrew ? 'סה"כ הדים' : 'Total Echoes'} value={stats.totalEchoes} icon={<Star className="w-6 h-6" />} />
                        <StatCard title={isHebrew ? 'מילים שנכתבו' : 'Total Words'} value={stats.totalWords.toLocaleString()} icon={<Type className="w-6 h-6" />} />
                        <StatCard title={isHebrew ? 'ממוצע מילים' : 'Avg Words/Entry'} value={stats.avgWordsPerEntry} icon={<Type className="w-6 h-6" />} />
                        <StatCard title={isHebrew ? 'הדים לממוצע' : 'Avg Echoes'} value={stats.avgEchoesPerEntry} icon={<Hash className="w-6 h-6" />} />
                        <StatCard title={isHebrew ? 'סוג הד נפוץ' : 'Common Echo Type'} value={<span className="capitalize">{stats.mostCommonEchoType}</span>} icon={<Users className="w-6 h-6" />} />
                        <StatCard title={isHebrew ? 'יום כתיבה מועדף' : 'Favorite Day'} value={stats.favoriteDay} icon={<Sunrise className="w-6 h-6" />} />
                        <StatCard title={isHebrew ? 'חודש פורה' : 'Prolific Month'} value={stats.prolificMonth} icon={<Calendar className="w-6 h-6" />} />
                    </div>
                    
                    <ThemeBarChart themes={stats.topThemes} isHebrew={isHebrew} />
                    
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

            {/* Main Timeline / Constellation View */}
            <main className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-2 p-1 bg-amber-200/50 dark:bg-stone-700/50 rounded-lg">
                        <button onClick={() => setDashboardView('chronicle')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${dashboardView === 'chronicle' ? 'bg-white/80 dark:bg-stone-800 text-amber-800 dark:text-amber-200 shadow' : 'text-stone-600 dark:text-stone-400 hover:bg-white/50 dark:hover:bg-stone-600/50'}`}>
                            <LayoutDashboard className="w-4 h-4" /> {isHebrew ? 'כרוניקה' : 'Chronicle'}
                        </button>
                        <button onClick={() => setDashboardView('constellation')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${dashboardView === 'constellation' ? 'bg-white/80 dark:bg-stone-800 text-amber-800 dark:text-amber-200 shadow' : 'text-stone-600 dark:text-stone-400 hover:bg-white/50 dark:hover:bg-stone-600/50'}`}>
                            <GitMerge className="w-4 h-4" /> {isHebrew ? 'קונסטלציה' : 'Constellation'}
                        </button>
                    </div>
                    {dashboardView === 'chronicle' && (
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
                    )}
                </div>

                {dashboardView === 'chronicle' ? (
                     filteredEntries.length > 0 ? (
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
                    )
                ) : (
                    <ConstellationView entries={entries} onLoadEntry={onLoadEntry} />
                )}
            </main>
        </motion.div>
    );
};