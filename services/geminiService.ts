import { GoogleGenAI, Type } from "@google/genai";
import type { HistoricalEcho } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.INTEGER },
            type: { type: Type.STRING, description: "The type of historical record (e.g., 'poetry', 'diary', 'event')." },
            era: { type: Type.STRING, description: "The historical period (e.g., '1690s Edo Period', '1912')." },
            author: { type: Type.STRING, description: "The person or group associated with the echo." },
            text: { type: Type.STRING, description: "A short, representative quote or summary." },
            context: { type: Type.STRING, description: "A brief explanation of the historical significance." },
            location: { type: Type.STRING, description: "Where the echo took place." },
            theme: { type: Type.STRING, description: "A short, descriptive theme (2-4 words) that captures the emotional core of the connection (e.g., 'finding solace in solitude')." },
            icon: { type: Type.STRING, description: "A single emoji that visually represents the echo." },
            connection: { type: Type.STRING, description: "A concise, one-sentence explanation of why this historical echo is relevant to the user's diary entry." },
            triggeringKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of the exact words or short phrases from the user's diary entry that triggered this echo." },
        },
        required: ['id', 'type', 'era', 'author', 'text', 'context', 'location', 'theme', 'icon', 'connection', 'triggeringKeywords']
    },
};

export const getHistoricalEchoes = async (diaryText: string, pastThemes: string): Promise<HistoricalEcho[]> => {
    if (!API_KEY) {
        console.error("Gemini API key is not configured.");
        return [];
    }
    if (!diaryText || diaryText.trim().length < 20) {
        return [];
    }

    const prompt = `
        Analyze the following new diary entry. I will also provide a list of themes from the user's past diary entries. Your task is to act as a historical archivist connecting a person's life to the grand timeline of history.

        Find up to 6 historical echoes (diary entries, poems, events, quotes) that resonate with the new entry.

        Crucially, you should look for "familiar moments." This means if the new entry touches on a theme seen in the user's past (e.g., they often write about 'solitude'), try to find an echo that deepens this recurring theme, perhaps from a different angle or a different historical figure who also contemplated it. This makes the connection feel personal and part of an ongoing conversation with history.

        For each echo, you must provide these fields:
        1. 'theme': This is a critical field. Provide a short, descriptive phrase (2-4 words) that captures the emotional core, NOT a single word. Good example: 'the bittersweetness of memory'. Bad example: 'memory'.
        2. 'connection': This is the most critical field. It is a single sentence explaining *why* this echo connects to the user's entry. It MUST NOT be empty. For instance, if the user writes about feeling isolated while working late, and you find an echo from a lonely lighthouse keeper, the connection could be: 'This reflects your own sense of isolation, showing that this feeling has been shared by people in even the most remote circumstances throughout history.'
        3. 'triggeringKeywords': This is also critical. It MUST be an array of the exact words or short phrases from the user's diary entry that made you choose this echo. This helps the user understand the AI's reasoning. For example: ["working late", "isolated"].

        User's Past Themes (for context):
        "${pastThemes}"

        New Diary Entry:
        "${diaryText}"

        Return a JSON array of objects. The echoes should be diverse in era and culture. If no past themes are provided, focus solely on the new entry.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const echoes = JSON.parse(jsonText) as HistoricalEcho[];
        // Assign unique IDs client-side to avoid potential collisions from the model
        return echoes.map((echo, index) => ({ ...echo, id: Date.now() + index }));

    } catch (error) {
        console.error("Error fetching historical echoes:", error);
        return [];
    }
};