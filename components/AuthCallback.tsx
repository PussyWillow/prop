import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

export const AuthCallback = () => {
    const { handleAuthCallback } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processAuth = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');

            if (code) {
                const result = await handleAuthCallback(code);
                if (result.success) {
                    window.location.href = '/';
                } else {
                    setError(result.error || 'An unknown error occurred during authentication.');
                }
            } else {
                setError('No authorization code provided by GitHub. Redirecting...');
                setTimeout(() => { window.location.href = '/'; }, 2000);
            }
        };

        processAuth();
    }, [handleAuthCallback]);

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-cream-50 to-stone-100 flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-serif text-red-700 mb-4">Authentication Failed</h2>
                <p className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-cream-50 to-stone-100 flex flex-col items-center justify-center">
            <LoadingSpinner text="Finalizing authentication..." />
        </div>
    );
};