
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { DiaryEntry, HistoricalEcho, GithubSyncConfig } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { getHistoricalEchoes } from '../services/geminiService';
import { getDiaryFile, updateDiaryFile } from '../services/githubService';

export const useDiary = (syncConfig: GithubSyncConfig | null, showToast: (message: string, type: 'success' | 'error' | 'info') => void) => {
  const [diaryEntry, setDiaryEntry] = useState('');
  const [entryTitle, setEntryTitle] = useState('');
  const [historicalEchoes, setHistoricalEchoes] = useState<HistoricalEcho[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [isHebrewText, setIsHebrewText] = useState(false);
  
  const [savedEntries, setSavedEntries] = useLocalStorage<DiaryEntry[]>('diary-entries', []);
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);
  const [hasBeenAnalyzed, setHasBeenAnalyzed] = useState(false);

  useEffect(() => {
    const hebrewPattern = /[\u0590-\u05FF]/;
    setIsHebrewText(hebrewPattern.test(diaryEntry) || hebrewPattern.test(entryTitle));
  }, [diaryEntry, entryTitle]);

  const handleDiaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDiaryEntry(e.target.value);
      setHasBeenAnalyzed(false);
      if (historicalEchoes.length > 0) {
        setHistoricalEchoes([]);
      }
  };

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

  const fetchEchoes = useCallback(async () => {
    if (diaryEntry.trim().length < 20) {
      setError("Please write at least 20 characters to find echoes.");
      showToast("Please write at least 20 characters to find echoes.", "info");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const echoes = await getHistoricalEchoes(diaryEntry, pastThemes);
      setHistoricalEchoes(echoes);
      setHasBeenAnalyzed(true);
      if (echoes.length > 0) {
          showToast(`Discovered ${echoes.length} new historical echoes!`, 'success');
      } else {
          showToast(`No specific echoes found, but your entry is saved.`, 'info');
      }
    } catch (err) {
      setError('Failed to fetch historical echoes. Please try again.');
      showToast('Failed to fetch historical echoes. Please try again.', 'error');
      console.error(err);
      setHasBeenAnalyzed(false);
    } finally {
      setIsLoading(false);
    }
  }, [diaryEntry, pastThemes, showToast]);
  
  const saveEntry = useCallback(() => {
    if (!diaryEntry.trim()) return;
    
    const entryData: Omit<DiaryEntry, 'id' | 'savedAt'> = {
      title: entryTitle || (isHebrewText ? 'רשומה ללא כותרת' : 'Untitled Entry'),
      content: diaryEntry,
      date: customDate,
      isHebrew: isHebrewText,
      echoes: historicalEchoes
    };

    let isNew = false;
    if (currentEntryId && savedEntries.some(e => e.id === currentEntryId)) {
      setSavedEntries(prev => prev.map(e => e.id === currentEntryId ? { ...e, ...entryData, savedAt: new Date().toISOString() } : e));
    } else {
      isNew = true;
      const newEntry: DiaryEntry = { ...entryData, id: Date.now(), savedAt: new Date().toISOString() };
      setSavedEntries(prev => [newEntry, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setCurrentEntryId(newEntry.id);
    }

    showToast(isNew ? 'New entry saved!' : 'Entry updated successfully!', 'success');
  }, [diaryEntry, entryTitle, customDate, isHebrewText, historicalEchoes, currentEntryId, savedEntries, setSavedEntries, showToast]);

  const createNewEntry = useCallback(() => {
    setDiaryEntry('');
    setEntryTitle('');
    setHistoricalEchoes([]);
    setCurrentEntryId(null);
    setCustomDate(new Date().toISOString().split('T')[0]);
    setHasBeenAnalyzed(false);
    setError(null);
  }, []);
  
  const loadEntry = useCallback((entry: DiaryEntry) => {
    setDiaryEntry(entry.content);
    setEntryTitle(entry.title);
    setCurrentEntryId(entry.id);
    setCustomDate(entry.date);
    setHistoricalEchoes(entry.echoes || []);
    setHasBeenAnalyzed(entry.echoes && entry.echoes.length > 0);
    setError(null);
    showToast(`Loaded entry: "${entry.title}"`, 'info');
  }, [showToast]);

  const deleteEntry = useCallback((entryId: number) => {
      setSavedEntries(prev => prev.filter(e => e.id !== entryId));
      showToast('Entry deleted.', 'success');
      if (currentEntryId === entryId) {
        createNewEntry();
      }
  }, [currentEntryId, setSavedEntries, createNewEntry, showToast]);

  const isSaved = useMemo(() => {
      if (!currentEntryId) return false;
      const saved = savedEntries.find(e => e.id === currentEntryId);
      if (!saved) return false;
      return saved.content === diaryEntry && saved.title === entryTitle && saved.date === customDate && saved.echoes.length === historicalEchoes.length;
  }, [currentEntryId, savedEntries, diaryEntry, entryTitle, customDate, historicalEchoes]);

  // --- GitHub Sync Logic ---
  const syncFromGithub = useCallback(async () => {
    if (!syncConfig) {
        showToast("GitHub Sync is not configured.", "error");
        return;
    }
    setIsSyncing(true);
    setError(null);
    try {
        const githubData = await getDiaryFile(syncConfig);
        if (githubData && githubData.entries) {
            let newEntriesCount = 0;
            setSavedEntries(prev => {
                const combined = [...prev, ...githubData.entries];
                const uniqueMap = new Map<number, DiaryEntry>();
                combined.forEach(e => uniqueMap.set(e.id, e));
                const merged = Array.from(uniqueMap.values()).sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
                newEntriesCount = merged.length - prev.length;
                return merged;
            });
            showToast(newEntriesCount > 0 ? `Synced ${newEntriesCount} new entries from GitHub!` : "Diary is already up to date.", 'success');
        } else {
            showToast("No data on GitHub. Pushing local entries...", "info");
            await syncToGithub();
        }
    } catch (e: any) {
        setError(e.message);
        showToast(`Error syncing from GitHub: ${e.message}`, "error");
    } finally {
        setIsSyncing(false);
    }
  }, [syncConfig, setSavedEntries, showToast]);

  const syncToGithub = useCallback(async () => {
     if (!syncConfig) {
        showToast("GitHub Sync is not configured.", "error");
        return;
    }
    if (savedEntries.length === 0) {
        showToast("No entries to sync.", "info");
        return;
    }
    setIsSyncing(true);
    setError(null);
    try {
        await updateDiaryFile(syncConfig, savedEntries);
        showToast("Successfully synced to GitHub!", "success");
    } catch (e: any) {
        setError(e.message);
        showToast(`Error syncing to GitHub: ${e.message}`, "error");
    } finally {
        setIsSyncing(false);
    }
  }, [syncConfig, savedEntries, showToast]);

  return {
    diaryEntry,
    setDiaryEntry,
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
    currentEntryId,
    hasBeenAnalyzed,
    fetchEchoes,
    saveEntry,
    createNewEntry,
    loadEntry,
    deleteEntry,
    isSaved,
    syncFromGithub,
    syncToGithub,
  };
};