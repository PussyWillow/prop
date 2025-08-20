import { useState, useCallback, useRef } from 'react';
import type { DiaryEntry } from '../types';

export const useImportHandler = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setIsDragging(false);
    setSelectedFile(null);
    setError(null);
  }, []);

  const validateAndParseFile = useCallback((file: File) => {
    if (file.type !== 'application/json') {
      setError("Invalid file type. Please upload a '.json' file.");
      setSelectedFile(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File could not be read");
        const importedEntries = JSON.parse(text);

        const isValid = Array.isArray(importedEntries) && 
            (importedEntries.length === 0 || 
             (typeof importedEntries[0].id === 'number' &&
              typeof importedEntries[0].content === 'string' &&
              typeof importedEntries[0].title === 'string' &&
              typeof importedEntries[0].date === 'string'));

        if (isValid) {
          setSelectedFile(file);
          setError(null);
        } else {
          setError("Invalid backup file format. The JSON structure is incorrect.");
          setSelectedFile(null);
        }
      } catch (err) {
        console.error("Error parsing file:", err);
        setError("Failed to parse backup. The file may be corrupted or not valid JSON.");
        setSelectedFile(null);
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndParseFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [validateAndParseFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndParseFile(e.target.files[0]);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }, [validateAndParseFile]);
  
  const getParsedEntries = useCallback((): Promise<DiaryEntry[] | null> => {
    return new Promise((resolve) => {
        if (!selectedFile) {
            resolve(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                try {
                    const importedEntries = JSON.parse(text) as DiaryEntry[];
                    resolve(importedEntries);
                } catch {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        };
        reader.onerror = () => resolve(null);
        reader.readAsText(selectedFile);
    });
  }, [selectedFile]);

  return {
    isDragging,
    selectedFile,
    error,
    fileInputRef,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileSelect,
    getParsedEntries,
    reset,
  };
};