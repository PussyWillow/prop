
import React, { useState, useEffect } from 'react';
import type { GithubSyncConfig } from '../types';
import { X, Info, CheckCircle } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: GithubSyncConfig) => void;
  onClear: () => void;
  initialConfig: GithubSyncConfig | null;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const SettingsModal = ({ isOpen, onClose, onSave, onClear, initialConfig, showToast }: SettingsModalProps) => {
  const [config, setConfig] = useState<GithubSyncConfig>(initialConfig || {
    username: '',
    repo: '',
    filePath: 'diary.json',
    token: ''
  });

  // This effect ensures the form is populated with the saved settings whenever the modal is opened.
  useEffect(() => {
    if (isOpen) {
      setConfig(initialConfig || {
        username: '',
        repo: '',
        filePath: 'diary.json',
        token: ''
      });
    }
  }, [initialConfig, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (Object.values(config).every(field => field.trim() !== '')) {
      onSave(config);
      showToast('Settings saved successfully!', 'success');
      onClose();
    } else {
      showToast('Please fill in all fields.', 'error');
    }
  };
  
  const handleClear = () => {
      const confirmation = prompt('To clear all sync settings, please type "clear" and click OK.');
      if (confirmation === 'clear') {
        onClear();
        setConfig({ username: '', repo: '', filePath: 'diary.json', token: '' });
        showToast('Sync settings cleared.', 'info');
        onClose();
      } else if (confirmation !== null) {
        showToast('Clear operation cancelled.', 'info');
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b dark:border-stone-700 flex justify-between items-center">
          <h3 className="text-xl font-serif text-gray-800 dark:text-stone-200">GitHub Sync Settings</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-stone-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-stone-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-stone-300">GitHub Username</label>
                <input type="text" name="username" id="username" value={config.username} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-200 dark:placeholder:text-stone-500 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" placeholder="your-github-name"/>
            </div>
            <div>
                <label htmlFor="repo" className="block text-sm font-medium text-gray-700 dark:text-stone-300">Repository Name</label>
                <input type="text" name="repo" id="repo" value={config.repo} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-200 dark:placeholder:text-stone-500 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" placeholder="my-private-diary-repo"/>
            </div>
            <div>
                <label htmlFor="filePath" className="block text-sm font-medium text-gray-700 dark:text-stone-300">File Path</label>
                <input type="text" name="filePath" id="filePath" value={config.filePath} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-200 dark:placeholder:text-stone-500 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" placeholder="diary.json"/>
            </div>
            <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-stone-300">Personal Access Token</label>
                <input type="password" name="token" id="token" value={config.token} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-200 dark:placeholder:text-stone-500 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" placeholder="ghp_..."/>
                 <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <span>Make sure your token has the full <strong>`repo`</strong> scope to allow syncing.</span>
                </div>
            </div>

            <div className="mt-4 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800 text-sm text-sky-800 dark:text-sky-300 flex items-start gap-3">
              <Info className="w-8 h-8 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0"/>
              <span>Use this link to create a <a href="https://github.com/settings/tokens/new?scopes=repo&description=EchoChamberDiarySync" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-sky-900 dark:hover:text-sky-200">new Personal Access Token</a>. It automatically selects the correct permissions for you.</span>
            </div>

            <div className="mt-6 flex justify-between items-center gap-4">
                <button onClick={handleClear} className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  Clear Settings
                </button>
                <div className="flex gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-stone-600 dark:hover:bg-stone-500 dark:text-stone-200 rounded-lg transition-colors">
                    Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Save Settings
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};