import type { GitHubUser } from '../types';

/**
 * Sends the authorization code to the backend to be exchanged for a user session/token.
 * @param code The authorization code from GitHub's OAuth callback.
 * @returns A promise that resolves with the GitHub user's information.
 */
export const exchangeCodeForUser = async (code: string): Promise<GitHubUser> => {
    // This endpoint on our backend will handle the secure exchange with GitHub
    const response = await fetch(`/api/auth/callback?code=${code}`);
    
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Failed to exchange code for token.' }));
        throw new Error(errorBody.error);
    }
    
    const user: GitHubUser = await response.json();
    return user;
};

/**
 * Notifies the backend that the user is logging out.
 * This would invalidate the session/token on the server side.
 */
export const logoutUser = async (): Promise<void> => {
    try {
        // In a real application, you'd call a backend endpoint like this.
        // await fetch('/api/auth/logout', { method: 'POST' });
        console.log("User logged out. In a real app, this would also notify the backend.");
    } catch (error) {
        // It's okay if this fails; the client-side session will still be cleared.
        console.error("Failed to notify backend of logout:", error);
    }
};
