import React from 'react';

export const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-amber-100/50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
            <div className="text-amber-600">{icon}</div>
            <div>
                <p className="text-sm text-amber-800 font-medium">{title}</p>
                <p className="text-2xl font-semibold text-amber-900">{value}</p>
            </div>
        </div>
    </div>
);
