
import React, { useState, useCallback } from 'react';
import type { DiaryEntry } from './types';
import { useDiary } from './hooks/useDiary';
import { Feather, Plus, Save, Search, Edit, LayoutDashboard } from './components/Icons';
import { ImportModal } from './components/ImportModal';
import { ImmersiveDashboard } from './components/ImmersiveDashboard';
import { EditorView } from './components/EditorView';

type View = 'editor' | 'dashboard';

const App = () => {
  const [currentView, setCurrentView] = useState<View>('editor');
  const [showImportModal, setShowImportModal] = useState(false);

  const {
    diaryEntry,
    entryTitle,
    setEntryTitle,
    handleDiaryChange,
    historicalEchoes,
    isLoading,
    error,
    customDate,
    setCustomDate,
    isHebrewText,
    savedEntries,
    setSavedEntries,
    hasBeenAnalyzed,
    fetchEchoes,
    saveEntry,
    createNewEntry,
    loadEntry,
    deleteEntry,
    isSaved
  } = useDiary();

  const handleLoadEntry = useCallback((entry: DiaryEntry) => {
      loadEntry(entry);
      setCurrentView('editor');
  }, [loadEntry]);

  const handleCreateNewEntry = useCallback(() => {
      createNewEntry();
      setCurrentView('editor');
  }, [createNewEntry]);

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
            <button onClick={handleCreateNewEntry} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md"><Plus className="w-4 h-4" />{isHebrewText ? 'רשומה חדשה' : 'New Entry'}</button>
            {currentView === 'editor' && (
              <>
                <button onClick={fetchEchoes} disabled={isLoading || diaryEntry.trim().length < 20 || hasBeenAnalyzed} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-md"><Search className="w-4 h-4" />{isHebrewText ? 'מצא הדים' : 'Find Echoes'}</button>
                <button onClick={saveEntry} disabled={!diaryEntry.trim() || isSaved} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-md"><Save className="w-4 h-4" />{isHebrewText ? 'שמור' : 'Save'}</button>
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

        {currentView === 'editor' ? (
          <EditorView
            entryTitle={entryTitle}
            setEntryTitle={setEntryTitle}
            diaryEntry={diaryEntry}
            handleDiaryChange={handleDiaryChange}
            isHebrewText={isHebrewText}
            isLoading={isLoading}
            hasBeenAnalyzed={hasBeenAnalyzed}
            historicalEchoes={historicalEchoes}
            isSaved={isSaved}
            error={error}
          />
        ) : (
            <ImmersiveDashboard
                entries={savedEntries}
                isHebrew={isHebrewText}
                onLoadEntry={handleLoadEntry}
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
