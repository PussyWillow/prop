
import React from 'react';
import type { HistoricalEcho } from '../types';
import { Clock, BookOpen, Search, Feather } from './Icons';
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

const HowItWorks = ({ isHebrewText }: { isHebrewText: boolean }) => (
    <div className="text-center h-full flex flex-col justify-center items-center bg-amber-50/50 dark:bg-stone-800/50 rounded-lg border-2 border-dashed border-amber-300 dark:border-stone-600 p-8">
        <div className="w-16 h-16 bg-amber-100 dark:bg-stone-700 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-xl font-serif text-amber-900 dark:text-amber-200 mb-4">{isHebrewText ? 'איך זה עובד' : 'How It Works'}</h3>
        <div className="space-y-3 text-amber-800 dark:text-stone-300 text-left max-w-xs text-sm">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-amber-200 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 rounded-full flex items-center justify-center font-bold text-xs">1</div>
                <p>{isHebrewText ? 'כתוב על היום שלך. ככל שתכתוב יותר, כך הקשרים יהיו טובים יותר.' : 'Write about your day. The more you write, the better the connections.'}</p>
            </div>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-amber-200 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 rounded-full flex items-center justify-center font-bold text-xs">2</div>
                <p>{isHebrewText ? "לחץ על 'מצא הדים' כדי לגלות קשרים היסטוריים." : "Click 'Find Echoes' to discover historical connections."}</p>
            </div>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-amber-200 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 rounded-full flex items-center justify-center font-bold text-xs">3</div>
                <p>{isHebrewText ? 'חקור את ההדים שיופיעו כאן כדי לראות את הסיפור שלך בהקשר רחב יותר.' : 'Explore the echoes that appear here to see your story in a grander context.'}</p>
            </div>
        </div>
    </div>
);


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
            <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm rounded-lg shadow-xl border border-amber-200 dark:border-stone-700 p-8 relative">
                <input type="text" value={entryTitle} onChange={(e) => setEntryTitle(e.target.value)} placeholder={isHebrewText ? 'כותרת הרשומה...' : 'Entry title...'} className={`w-full px-1 py-2 border-b-2 border-amber-200 dark:border-stone-600 bg-transparent text-2xl font-serif font-semibold text-gray-800 dark:text-stone-200 placeholder:text-gray-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 ${isHebrewText ? 'text-right' : 'text-left'}`} style={{ direction: isHebrewText ? 'rtl' : 'ltr' }}/>
                <textarea value={diaryEntry} onChange={handleDiaryChange} placeholder={isHebrewText ? "כתוב על היום שלך..." : "Write about your day..."} className={`w-full h-80 resize-none bg-transparent border-none outline-none text-gray-800 dark:text-stone-300 text-lg leading-relaxed font-serif placeholder:text-gray-400 dark:placeholder:text-stone-500 placeholder:italic mt-4 p-2 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 rounded-md transition-shadow focus:shadow-inner bg-amber-50/20 dark:bg-stone-700/50 ${isHebrewText ? 'text-right' : 'text-left'}`} style={{ direction: isHebrewText ? 'rtl' : 'ltr' }}/>
                {diaryEntry && (<div className="mt-6 pt-6 border-t border-amber-200 dark:border-stone-700"><div className="flex justify-between items-center text-sm text-amber-600 dark:text-amber-400">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                            {isLoading ? (isHebrewText ? 'מגלה הדים...' : 'Discovering...') : 
                             hasBeenAnalyzed ? (isHebrewText ? `${historicalEchoes.length} הדים התגלו` : `${historicalEchoes.length} echoes discovered`) :
                             (isHebrewText ? 'מוכן לניתוח' : 'Ready to analyze')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">{isSaved ? (<span className="text-green-600 dark:text-green-400 font-medium">✓ Saved</span>) : (<span className="text-orange-600 dark:text-orange-400 font-medium">○ Unsaved</span>)}</div>
                </div></div>)}
            </div>
        </div>
        <div className="flex-1 max-w-2xl w-full h-96 lg:h-[30rem] relative">
            {isLoading ? <div className="absolute inset-0 flex items-center justify-center"><LoadingSpinner text={isHebrewText ? 'מגלה הדים מהעבר...' : 'Discovering echoes from the past...'} /></div> :
             historicalEchoes.length > 0 ? (
                <EchoesTimeline echoes={historicalEchoes} isHebrew={isHebrewText} />
            ) : (
                <HowItWorks isHebrewText={isHebrewText} />
            )}
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>
    </main>
);