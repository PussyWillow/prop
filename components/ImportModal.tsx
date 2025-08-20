import React from 'react';
import type { DiaryEntry } from '../types';
import { Upload, X, CheckCircle, AlertTriangle, Info } from './Icons';
import { useImportHandler } from '../hooks/useImportHandler';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (entries: DiaryEntry[]) => void;
}

export const ImportModal = ({ isOpen, onClose, onImport }: ImportModalProps) => {
  const {
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
  } = useImportHandler();

  const handleClose = () => {
    reset();
    onClose();
  };
  
  const handleImportClick = async () => {
    const entries = await getParsedEntries();
    if (entries) {
        onImport(entries);
        handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in" onClick={handleClose}>
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b dark:border-stone-700 flex justify-between items-center">
          <h3 className="text-xl font-serif text-gray-800 dark:text-stone-200">Import Diary Entries</h3>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-stone-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-stone-400" />
          </button>
        </div>
        <div className="p-6">
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-300 dark:border-stone-600 hover:border-amber-400 dark:hover:border-amber-500'}`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".json"
              className="hidden"
            />
            <Upload className="w-12 h-12 text-gray-400 dark:text-stone-500 mx-auto mb-4" />
            <p className="font-semibold text-gray-700 dark:text-stone-300">Drag & drop your backup file here</p>
            <p className="text-sm text-gray-500 dark:text-stone-400">or click to select a file</p>
            <p className="text-xs text-gray-400 dark:text-stone-500 mt-2">Only '.json' files are accepted</p>
          </div>

          {selectedFile && !error && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800 dark:text-green-300">File ready for import:</p>
                <p className="text-sm text-green-700 dark:text-green-400 truncate">{selectedFile.name}</p>
              </div>
            </div>
          )}

          {error && (
             <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300">Import Error:</p>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800 text-sm text-sky-800 dark:text-sky-300 flex items-start gap-3">
            <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0"/>
            <span><strong>Heads up:</strong> This will add entries from your backup file to your current diary. Existing entries will be skipped to prevent duplicates.</span>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button onClick={handleClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-stone-600 dark:hover:bg-stone-500 dark:text-stone-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onClick={handleImportClick}
              disabled={!selectedFile || !!error}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-stone-500"
            >
              Import Entries
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};