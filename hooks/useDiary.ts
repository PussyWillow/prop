import { useState, useEffect, useMemo, useCallback } from 'react';
import type { DiaryEntry, HistoricalEcho, GithubSyncConfig } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { getHistoricalEchoes } from '../services/geminiService';
import { getDiaryFile, updateDiaryFile } from '../services/githubService';

export const useDiary = (syncConfig: GithubSyncConfig | null) => {
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
  }, [diaryEntry, pastThemes]);
  
  const saveEntry = useCallback(() => {
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
  }, [diaryEntry, entryTitle, customDate, isHebrewText, historicalEchoes, currentEntryId, savedEntries, setSavedEntries]);

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
  }, []);

  const deleteEntry = useCallback((entryId: number) => {
      setSavedEntries(prev => prev.filter(e => e.id !== entryId));
      if (currentEntryId === entryId) {
        createNewEntry();
      }
  }, [currentEntryId, setSavedEntries, createNewEntry]);

  const isSaved = useMemo(() => {
      if (!currentEntryId) return false;
      const saved = savedEntries.find(e => e.id === currentEntryId);
      if (!saved) return false;
      return saved.content === diaryEntry && saved.title === entryTitle && saved.date === customDate && saved.echoes.length === historicalEchoes.length;
  }, [currentEntryId, savedEntries, diaryEntry, entryTitle, customDate, historicalEchoes]);

  // --- GitHub Sync Logic ---
  const syncFromGithub = useCallback(async () => {
    if (!syncConfig) {
        alert("GitHub Sync is not configured.");
        return;
    }
    setIsSyncing(true);
    setError(null);
    try {
        const githubData = await getDiaryFile(syncConfig);
        if (githubData && githubData.entries) {
            setSavedEntries(prev => {
                const combined = [...prev, ...githubData.entries];
                const uniqueMap = new Map<number, DiaryEntry>();
                combined.forEach(e => uniqueMap.set(e.id, e));
                return Array.from(uniqueMap.values()).sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
            });
            alert("Successfully synced from GitHub!");
        } else {
            alert("No data found on GitHub, or the file is empty. Pushing local entries instead.");
            await syncToGithub();
        }
    } catch (e: any) {
        setError(e.message);
        alert(`Error syncing from GitHub: ${e.message}`);
    } finally {
        setIsSyncing(false);
    }
  }, [syncConfig, setSavedEntries]);

  const syncToGithub = useCallback(async () => {
     if (!syncConfig) {
        alert("GitHub Sync is not configured.");
        return;
    }
    setIsSyncing(true);
    setError(null);
    try {
        await updateDiaryFile(syncConfig, savedEntries);
        alert("Successfully synced to GitHub!");
    } catch (e: any) {
        setError(e.message);
        alert(`Error syncing to GitHub: ${e.message}`);
    } finally {
        setIsSyncing(false);
    }
  }, [syncConfig, savedEntries]);

  // Initial sync on load
  useEffect(() => {
    if (syncConfig) {
      console.log("Sync config found, attempting initial sync from GitHub.");
      syncFromGithub();
    }
  }, [syncConfig]); // This will run only when syncConfig changes (i.e., on first load with config)


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