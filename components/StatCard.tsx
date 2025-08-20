import React from 'react';

export const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
            <div className="text-amber-600 dark:text-amber-400">{icon}</div>
            <div>
                <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">{title}</p>
                <p className="text-2xl font-semibold text-amber-900 dark:text-amber-200">{value}</p>
            </div>
        </div>
    </div>
);