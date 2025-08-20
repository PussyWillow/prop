
import { useState } from 'react';
import type { GitHubUser } from '../types';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<GitHubUser | null>(null);

    // This is a placeholder login function.
    // In a real application, this would initiate the OAuth flow
    // with our backend service.
    const login = () => {
        // Simulate a successful login
        setUser({
            name: 'Jane Doe',
            avatarUrl: 'https://via.placeholder.com/150'
        });
        setIsAuthenticated(true);
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
    };

    return {
        isAuthenticated,
        user,
        login,
        logout,
    };
};
