import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { DiaryEntry, HistoricalEcho } from './types';
import { getHistoricalEchoes } from './services/geminiService';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Feather, Plus, Save, Search, Edit, LayoutDashboard, Clock } from './components/Icons';
import { ImportModal } from './components/ImportModal';
import { EchoesTimeline } from './components/EchoesTimeline';
import { ImmersiveDashboard } from './components/ImmersiveDashboard';
import LoadingSpinner from './components/LoadingSpinner';

type View = 'editor' | 'dashboard';

const App = () => {
  const [currentView, setCurrentView] = useState<View>('editor');
  
  const [diaryEntry, setDiaryEntry] = useState('');
  const [entryTitle, setEntryTitle] = useState('');
  const [historicalEchoes, setHistoricalEchoes] = useState<HistoricalEcho[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [isHebrewText, setIsHebrewText] = useState(false);
  
  const [savedEntries, setSavedEntries] = useLocalStorage<DiaryEntry[]>('diary-entries', []);
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [hasBeenAnalyzed, setHasBeenAnalyzed] = useState(false);

  useEffect(() => {
    const hebrewPattern = /[\u0590-\u05FF]/;
    setIsHebrewText(hebrewPattern.test(diaryEntry));
  }, [diaryEntry]);

  const handleDiaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDiaryEntry(e.target.value);
      setHasBeenAnalyzed(false);
      if (historicalEchoes.length > 0) {
        setHistoricalEchoes([]);
      }
  }

  const pastThemes = useMemo(() => {
    if (savedEntries.length === 0) return '';
    const recentThemes = savedEntries.slice(0, 10).flatMap(entry => entry.echoes?.map(echo => echo.theme) || []).filter(Boolean);
    if (recentThemes.length === 0) return '';
    const themeCounts = recentThemes.reduce((acc, theme) => {
        const lowerTheme = theme.toLowerCase();
        acc[lowerTheme] = (acc[lowerTheme] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const topThemes = Object.entries(themeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(entry => entry[0]);
    return topThemes.join(', ');
  }, [savedEntries]);

  const fetchEchoes = async () => {
    if (diaryEntry.trim().length < 20) {
      setError("Please write at least 20 characters to find echoes.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const echoes = await getHistoricalEchoes(diaryEntry, pastThemes);
      setHistoricalEchoes(echoes);
      setHasBeenAnalyzed(true);
    } catch (err) {
      setError('Failed to fetch historical echoes. Please try again.');
      console.error(err);
      setHasBeenAnalyzed(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveEntry = () => {
    if (!diaryEntry.trim()) return;
    
    const entryData: Omit<DiaryEntry, 'id' | 'savedAt'> = {
      title: entryTitle || (isHebrewText ? 'רשומה ללא כותרת' : 'Untitled Entry'),
      content: diaryEntry,
      date: customDate,
      isHebrew: isHebrewText,
      echoes: historicalEchoes
    };

    if (currentEntryId && savedEntries.some(e => e.id === currentEntryId)) {
      setSavedEntries(prev => prev.map(e => e.id === currentEntryId ? { ...e, ...entryData, savedAt: new Date().toISOString() } : e));
    } else {
      const newEntry: DiaryEntry = { ...entryData, id: Date.now(), savedAt: new Date().toISOString() };
      setSavedEntries(prev => [newEntry, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setCurrentEntryId(newEntry.id);
    }
  };

  const createNewEntry = () => {
    setDiaryEntry('');
    setEntryTitle('');
    setHistoricalEchoes([]);
    setCurrentEntryId(null);
    setCustomDate(new Date().toISOString().split('T')[0]);
    setHasBeenAnalyzed(false);
    setCurrentView('editor');
  };
  
  const loadEntry = (entry: DiaryEntry) => {
    setDiaryEntry(entry.content);
    setEntryTitle(entry.title);
    setCurrentEntryId(entry.id);
    setCustomDate(entry.date);
    setHistoricalEchoes(entry.echoes || []);
    setHasBeenAnalyzed(entry.echoes && entry.echoes.length > 0);
    setCurrentView('editor');
  };

  const deleteEntry = (entryId: number) => {
      setSavedEntries(prev => prev.filter(e => e.id !== entryId));
      if (currentEntryId === entryId) {
        createNewEntry();
      }
  };

  const handleExport = () => {
    if (savedEntries.length === 0) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(savedEntries, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "echo-chamber-diary-backup.json";
    link.click();
  };

  const handleConfirmImport = (importedEntries: DiaryEntry[]) => {
    setSavedEntries(prevEntries => {
      const allEntries = [...prevEntries, ...importedEntries];
      const uniqueEntriesMap = new Map<number, DiaryEntry>();
      for (const entry of allEntries) {
        if (!uniqueEntriesMap.has(entry.id)) {
          uniqueEntriesMap.set(entry.id, entry);
        }
      }
      const mergedEntries = Array.from(uniqueEntriesMap.values());
      mergedEntries.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
      return mergedEntries;
    });
    setShowImportModal(false);
  };

  const EditorView = () => (
    <main className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex-1 max-w-2xl mx-auto w-full">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl border border-amber-200 p-8 relative">
                <input type="text" value={entryTitle} onChange={(e) => setEntryTitle(e.target.value)} placeholder={isHebrewText ? 'כותרת הרשומה...' : 'Entry title...'} className={`w-full px-1 py-2 border-b-2 border-amber-200 bg-transparent text-xl font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 ${isHebrewText ? 'text-right' : 'text-left'}`} style={{ direction: isHebrewText ? 'rtl' : 'ltr' }}/>
                <textarea value={diaryEntry} onChange={handleDiaryChange} placeholder={isHebrewText ? "כתוב על היום שלך..." : "Write about your day..."} className={`w-full h-80 resize-none bg-transparent border-none outline-none text-gray-800 text-lg leading-relaxed font-serif placeholder:text-gray-400 placeholder:italic mt-4 ${isHebrewText ? 'text-right' : 'text-left'}`} style={{ direction: isHebrewText ? 'rtl' : 'ltr' }}/>
                {diaryEntry && (<div className="mt-6 pt-6 border-t border-amber-200"><div className="flex justify-between items-center text-sm text-amber-600">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                            {isLoading ? (isHebrewText ? 'מגלה הדים...' : 'Discovering...') : 
                             hasBeenAnalyzed ? (isHebrewText ? `${historicalEchoes.length} הדים התגלו` : `${historicalEchoes.length} echoes discovered`) :
                             (isHebrewText ? 'מוכן לניתוח' : 'Ready to analyze')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">{savedEntries.some(e => e.id === currentEntryId) ? (<span className="text-green-600 font-medium">✓ Saved</span>) : (<span className="text-orange-600 font-medium">○ Unsaved</span>)}</div>
                </div></div>)}
            </div>
        </div>
        <div className="flex-1 max-w-2xl w-full h-96 lg:h-[30rem] relative">
            {isLoading ? <div className="absolute inset-0 flex items-center justify-center"><LoadingSpinner text={isHebrewText ? 'מגלה הדים מהעבר...' : 'Discovering echoes from the past...'} /></div> :
             historicalEchoes.length > 0 ? (
                <EchoesTimeline echoes={historicalEchoes} isHebrew={isHebrewText} />
            ) : (
                <div className="text-center h-full flex flex-col justify-center items-center bg-amber-50/50 rounded-lg border border-amber-200 p-8">
                    <h3 className="text-xl font-serif text-amber-900 mb-4">{isHebrewText ? 'איך זה עובד' : 'How it works'}</h3>
                    <div className="space-y-3 text-amber-700 text-left">
                        <p>📝 {isHebrewText ? 'כתוב על היום שלך (לפחות 20 תווים)' : 'Write about your day (at least 20 characters)'}</p>
                        <p>🔍 {isHebrewText ? "לחץ על 'מצא הדים' כדי לגלות קשרים" : "Click 'Find Echoes' to discover connections"}</p>
                        <p>⭐ {isHebrewText ? 'הדים היסטוריים יופיעו כאן' : 'Historical echoes will appear here'}</p>
                        <p>📖 {isHebrewText ? 'לחץ על כל הד כדי לחקור' : 'Click any echo to explore'}</p>
                    </div>
                </div>
            )}
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>
    </main>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-cream-50 to-stone-100 p-6 font-sans text-stone-800">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Feather className="w-8 h-8 text-amber-600" />
            <h1 className="text-4xl font-serif text-amber-900">{isHebrewText ? 'יומן הדי העבר' : 'Echo Chamber Diary'}</h1>
            <Feather className="w-8 h-8 text-amber-600 scale-x-[-1]" />
          </div>
          <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
            <button onClick={createNewEntry} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md"><Plus className="w-4 h-4" />{isHebrewText ? 'רשומה חדשה' : 'New Entry'}</button>
            {currentView === 'editor' && (
              <>
                <button onClick={fetchEchoes} disabled={isLoading || diaryEntry.trim().length < 20 || hasBeenAnalyzed} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-md"><Search className="w-4 h-4" />{isHebrewText ? 'מצא הדים' : 'Find Echoes'}</button>
                <button onClick={saveEntry} disabled={!diaryEntry.trim()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-md"><Save className="w-4 h-4" />{isHebrewText ? 'שמור' : 'Save'}</button>
              </>
            )}
             <button onClick={() => setCurrentView(currentView === 'editor' ? 'dashboard' : 'editor')} className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-md">
                {currentView === 'editor' ? <><LayoutDashboard className="w-4 h-4" />{isHebrewText ? 'תצוגת כרוניקה' : 'Chronicle View'}</> : <><Edit className="w-4 h-4" />{isHebrewText ? 'עורך' : 'Editor'}</>}
             </button>
          </div>
          {currentView === 'editor' && (
             <div className="flex items-center justify-center gap-4 mb-4">
               <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="px-3 py-2 border border-amber-300 rounded-lg bg-white/80 text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-400"/>
             </div>
          )}
        </header>

        {showImportModal && (
            <ImportModal 
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleConfirmImport}
            />
        )}

        {currentView === 'editor' ? <EditorView /> : (
            <ImmersiveDashboard
                entries={savedEntries}
                isHebrew={isHebrewText}
                onLoadEntry={loadEntry}
                onDeleteEntry={deleteEntry}
                onImportClick={() => setShowImportModal(true)}
                onExportClick={handleExport}
            />
        )}
      </div>
    </div>
  );
};

export default App;