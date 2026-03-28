import { NextResponse } from 'next/server';
import { docsAssistantConfig } from '@/config/docs-assistant';

export async function POST() {
    try {
        if (!process.env.OPENAI_API_KEY){
            throw new Error(`OPENAI_API_KEY is not set`);
        }

        const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(docsAssistantConfig),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${JSON.stringify(response)}`);
        }

        const data = await response.json();

        // Return the JSON response to the client
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching docs session data:", error);
        return NextResponse.json({ error: "Failed to fetch docs session data" }, { status: 500 });
    }
}
