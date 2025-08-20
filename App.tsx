import React, { useState, useCallback } from 'react';
import type { DiaryEntry } from './types';
import { useDiary } from './hooks/useDiary';
import { useGithubSync } from './hooks/useGithubSync';
import { Feather, Plus, Save, Search, Edit, LayoutDashboard, Settings, Sun, Moon } from './components/Icons';
import { ImportModal } from './components/ImportModal';
import { ImmersiveDashboard } from './components/ImmersiveDashboard';
import { EditorView } from './components/EditorView';
import { SettingsModal } from './components/SettingsModal';
import { useToast } from './contexts/ToastContext';
import { ToastContainer } from './components/ToastContainer';
import { useTheme } from './contexts/ThemeContext';
import { motion } from 'framer-motion';

type View = 'editor' | 'dashboard';

const App = () => {
  const [currentView, setCurrentView] = useState<View>('editor');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const { showToast } = useToast();
  const { config, saveConfig, clearConfig, isConfigured } = useGithubSync();
  const { theme, toggleTheme } = useTheme();

  const {
    diaryEntry,
    entryTitle,
    setEntryTitle,
    handleDiaryChange,
    historicalEchoes,
    isLoading,
    isSyncing,
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
    isSaved,
    syncFromGithub,
    syncToGithub,
  } = useDiary(config, showToast);

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
    showToast('Diary exported successfully!', 'success');
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
    showToast(`${importedEntries.length} entries imported.`, 'success');
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 dark:from-stone-900 dark:via-stone-800 dark:to-gray-900 p-6 font-sans text-stone-800 dark:text-stone-200 transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
              <div className="flex justify-between items-center mb-4">
                  <div className="w-1/3"></div>
                  <div className="w-1/3 text-center">
                      <div className="flex items-center justify-center gap-3">
                          <Feather className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                          <h1 className="text-4xl font-serif text-amber-900 dark:text-amber-200">{isHebrewText ? 'יומן הדי העבר' : 'Echo Chamber Diary'}</h1>
                          <Feather className="w-8 h-8 text-amber-600 dark:text-amber-400 scale-x-[-1]" />
                      </div>
                  </div>
                  <div className="w-1/3 flex justify-end items-center gap-2">
                       <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleTheme} className="p-2 hover:bg-amber-100 dark:hover:bg-stone-700 rounded-full transition-colors" aria-label="Toggle theme">
                         {theme === 'light' ? <Moon className="w-6 h-6 text-amber-700" /> : <Sun className="w-6 h-6 text-amber-400" />}
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowSettingsModal(true)} className="p-2 hover:bg-amber-100 dark:hover:bg-stone-700 rounded-full transition-colors" aria-label="Open sync settings">
                          <Settings className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                      </motion.button>
                  </div>
              </div>
            <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCreateNewEntry} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md dark:shadow-black/20"><Plus className="w-4 h-4" />{isHebrewText ? 'רשומה חדשה' : 'New Entry'}</motion.button>
              {currentView === 'editor' && (
                <>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={fetchEchoes} disabled={isLoading || diaryEntry.trim().length < 20 || hasBeenAnalyzed} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-md dark:shadow-black/20"><Search className="w-4 h-4" />{isHebrewText ? 'מצא הדים' : 'Find Echoes'}</motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={saveEntry} disabled={!diaryEntry.trim() || isSaved} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-md dark:shadow-black/20"><Save className="w-4 h-4" />{isHebrewText ? 'שמור' : 'Save'}</motion.button>
                </>
              )}
              <div className="p-1 bg-amber-200/50 dark:bg-stone-700/50 rounded-lg flex items-center gap-1">
                <button onClick={() => setCurrentView('editor')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${currentView === 'editor' ? 'bg-white/80 dark:bg-stone-800 text-amber-800 dark:text-amber-200 shadow' : 'text-stone-600 dark:text-stone-400 hover:bg-white/50 dark:hover:bg-stone-600/50'}`}>
                  <Edit className="w-4 h-4" /> {isHebrewText ? 'עורך' : 'Editor'}
                </button>
                 <button onClick={() => setCurrentView('dashboard')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${currentView === 'dashboard' ? 'bg-white/80 dark:bg-stone-800 text-amber-800 dark:text-amber-200 shadow' : 'text-stone-600 dark:text-stone-400 hover:bg-white/50 dark:hover:bg-stone-600/50'}`}>
                  <LayoutDashboard className="w-4 h-4" /> {isHebrewText ? 'לוח מחוונים' : 'Dashboard'}
                </button>
              </div>
            </div>
            {currentView === 'editor' && (
              <div className="flex items-center justify-center gap-4">
                <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="px-3 py-2 border border-amber-300 dark:border-stone-600 rounded-lg bg-white/80 dark:bg-stone-700/50 text-amber-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500"/>
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

          {showSettingsModal && (
              <SettingsModal
                  isOpen={showSettingsModal}
                  onClose={() => setShowSettingsModal(false)}
                  onSave={saveConfig}
                  onClear={clearConfig}
                  initialConfig={config}
                  showToast={showToast}
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
                  isGithubConfigured={isConfigured}
                  onSyncFromGithub={syncFromGithub}
                  onSyncToGithub={syncToGithub}
                  isSyncing={isSyncing}
              />
          )}
        </div>
      </div>
    </>
  );
};

export default App;