import type { GithubSyncConfig, DiaryEntry } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

interface GithubFile {
    content: string;
    sha: string;
}

// Helper to handle base64 encoding/decoding for Unicode strings
const base64 = {
    encode: (str: string) => window.btoa(unescape(encodeURIComponent(str))),
    decode: (str: string) => decodeURIComponent(escape(window.atob(str))),
}

/**
 * Fetches the diary file from GitHub.
 * @returns An object containing the parsed diary entries and the file's SHA.
 */
export const getDiaryFile = async (config: GithubSyncConfig): Promise<{ entries: DiaryEntry[], sha: string } | null> => {
    const url = `${GITHUB_API_BASE}/repos/${config.username}/${config.repo}/contents/${config.filePath}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${config.token}`,
            'Accept': 'application/vnd.github.v3+json',
        },
    });

    if (response.status === 404) {
        console.log("Diary file not found on GitHub. A new one will be created on the first sync-to-github.");
        return null;
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch from GitHub: ${errorData.message || response.statusText}`);
    }

    const data: GithubFile = await response.json();
    const decodedContent = base64.decode(data.content);
    
    try {
        const entries = JSON.parse(decodedContent) as DiaryEntry[];
        return { entries, sha: data.sha };
    } catch (e) {
        console.error("Failed to parse diary file content:", e);
        throw new Error("Could not parse diary file from GitHub. It might be corrupted.");
    }
};


/**
 * Updates the diary file on GitHub.
 * @param config The sync configuration.
 * @param entries The array of diary entries to save.
 */
export const updateDiaryFile = async (config: GithubSyncConfig, entries: DiaryEntry[]): Promise<void> => {
    const url = `${GITHUB_API_BASE}/repos/${config.username}/${config.repo}/contents/${config.filePath}`;
    
    // First, we need the latest SHA of the file to update it.
    let currentSha: string | undefined;
    try {
        const fileData = await getDiaryFile(config);
        currentSha = fileData?.sha;
    } catch (e) {
        // If the error is anything other than file not found, re-throw it.
        if (!e.message.includes('404')) {
            console.warn("Could not get latest file SHA, but proceeding with update attempt.", e);
        }
    }

    const content = JSON.stringify(entries, null, 2);
    const encodedContent = base64.encode(content);
    
    const body = {
        message: `Sync diary entries - ${new Date().toISOString()}`,
        content: encodedContent,
        sha: currentSha, // Include SHA if updating an existing file
    };

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update file on GitHub: ${errorData.message || response.statusText}`);
    }
};