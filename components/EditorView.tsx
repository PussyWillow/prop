
import React from 'react';
import type { HistoricalEcho } from '../types';
import { Clock } from './Icons';
import { EchoesTimeline } from './EchoesTimeline';
import LoadingSpinner from './LoadingSpinner';

interface EditorViewProps {
    entryTitle: string;
    setEntryTitle: (value: string) => void;
    diaryEntry: string;
    handleDiaryChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    isHebrewText: boolean;
    isLoading: boolean;
    hasBeenAnalyzed: boolean;
    historicalEchoes: HistoricalEcho[];
    isSaved: boolean;
    error: string | null;
}

export const EditorView = ({
    entryTitle,
    setEntryTitle,
    diaryEntry,
    handleDiaryChange,
    isHebrewText,
    isLoading,
    hasBeenAnalyzed,
    historicalEchoes,
    isSaved,
    error,
}: EditorViewProps) => (
    <main className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fade-in">
        <div className="flex-1 max-w-2xl mx-auto w-full">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl border border-amber-200 p-8 relative">
                <input type="text" value={entryTitle} onChange={(e) => setEntryTitle(e.target.value)} placeholder={isHebrewText ? 'כותרת הרשומה...' : 'Entry title...'} className={`w-full px-1 py-2 border-b-2 border-amber-200 bg-transparent text-xl font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 ${isHebrewText ? 'text-right' : 'text-left'}`} style={{ direction: isHebrewText ? 'rtl' : 'ltr' }}/>
                <textarea value={diaryEntry} onChange={handleDiaryChange} placeholder={isHebrewText ? "כתוב על היום שלך..." : "Write about your day..."} className={`w-full h-80 resize-none bg-transparent border-none outline-none text-gray-800 text-lg leading-relaxed font-serif placeholder:text-gray-400 placeholder:italic mt-4 ${isHebrewText ? 'text-right' : 'text-left'}`} style={{ direction: isHebrewText ? 'rtl' : 'ltr' }}/>
                {diaryEntry && (<div className="mt-6 pt-6 border-t border-amber-200"><div className="flex justify-between items-center text-sm text-amber-600">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                            {isLoading ? (isHebrewText ? 'מגלה הדים...' : 'Discovering...') : 
                             hasBeenAnalyzed ? (isHebrewText ? `${historicalEchoes.length} הדים התגלו` : `${historicalEchoes.length} echoes discovered`) :
                             (isHebrewText ? 'מוכן לניתוח' : 'Ready to analyze')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">{isSaved ? (<span className="text-green-600 font-medium">✓ Saved</span>) : (<span className="text-orange-600 font-medium">○ Unsaved</span>)}</div>
                </div></div>)}
            </div>
        </div>
        <div className="flex-1 max-w-2xl w-full h-96 lg:h-[30rem] relative">
            {isLoading ? <div className="absolute inset-0 flex items-center justify-center"><LoadingSpinner text={isHebrewText ? 'מגלה הדים מהעבר...' : 'Discovering echoes from the past...'} /></div> :
             historicalEchoes.length > 0 ? (
                <EchoesTimeline echoes={historicalEchoes} isHebrew={isHebrewText} />
            ) : (
                <div className="text-center h-full flex flex-col justify-center items-center bg-amber-50/50 rounded-lg border border-amber-200 p-8">
                    <h3 className="text-xl font-serif text-amber-900 mb-4">{isHebrewText ? 'איך זה עובד' : 'How it works'}</h3>
                    <div className="space-y-3 text-amber-700 text-left">
                        <p>📝 {isHebrewText ? 'כתוב על היום שלך (לפחות 20 תווים)' : 'Write about your day (at least 20 characters)'}</p>
                        <p>🔍 {isHebrewText ? "לחץ על 'מצא הדים' כדי לגלות קשרים" : "Click 'Find Echoes' to discover connections"}</p>
                        <p>⭐ {isHebrewText ? 'הדים היסטוריים יופיעו כאן' : 'Historical echoes will appear here'}</p>
                        <p>📖 {isHebrewText ? 'לחץ על כל הד כדי לחקור' : 'Click any echo to explore'}</p>
                    </div>
                </div>
            )}
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>
    </main>
);
