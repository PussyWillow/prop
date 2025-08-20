import { useCallback } from 'react';
import type { GithubSyncConfig } from '../types';
import { useLocalStorage } from './useLocalStorage';

export const useGithubSync = () => {
    const [config, setConfig] = useLocalStorage<GithubSyncConfig | null>('github-sync-config', null);
    
    const isConfigured = !!(config && config.token && config.username && config.repo);

    const saveConfig = useCallback((newConfig: GithubSyncConfig) => {
        setConfig(newConfig);
    }, [setConfig]);
    
    const clearConfig = useCallback(() => {
        setConfig(null);
    }, [setConfig]);


    return {
        config,
        saveConfig,
        clearConfig,
        isConfigured,
    };
};
