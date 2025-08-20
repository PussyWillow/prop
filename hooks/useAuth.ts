import { useCallback, useEffect } from 'react';
import type { GitHubUser } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { exchangeCodeForUser, logoutUser } from '../services/authService';

export const useAuth = () => {
    const [user, setUser] = useLocalStorage<GitHubUser | null>('github-user', null);
    
    const isAuthenticated = !!user;

    // In a real app, this redirects to our backend, which then redirects to GitHub.
    const login = () => {
        // This will be handled by a backend endpoint that securely constructs the GitHub URL.
        window.location.href = '/api/auth/github';
    };

    // This function is called by the AuthCallback component with the code from GitHub.
    const handleAuthCallback = useCallback(async (code: string) => {
        try {
            const userData = await exchangeCodeForUser(code);
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error("Authentication failed:", error);
            setUser(null);
            return { success: false, error: 'Could not sign you in.' };
        }
    }, [setUser]);

    const logout = useCallback(async () => {
        try {
            // In a real app, you might want to notify the backend to invalidate a session
            await logoutUser();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setUser(null);
            // Redirect to home to ensure a clean state
            window.location.href = '/'; 
        }
    }, [setUser]);

    // This effect can be used to verify the session with the backend when the app loads.
    useEffect(() => {
        // You could add a call here to a `/api/me` endpoint to verify the user's session is still valid on the server.
    }, []);

    return {
        isAuthenticated,
        user,
        login,
        logout,
        handleAuthCallback,
    };
};