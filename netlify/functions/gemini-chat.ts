/**
 * Netlify Function: gemini-chat
 * 1:1 port of the Express POST /api/gemini/chat endpoint from server.ts
 * (AI Studio export). Keeps the MS2 AI chatbot identical on Netlify.
 *
 * Env required: GEMINI_API_KEY (Netlify Site settings → Environment variables)
 */

import { GoogleGenAI } from '@google/genai';

const MODELS_TO_TRY = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-2.5-pro'];

function buildSystemInstruction(context: unknown): string {
  return `You are "MS2 AI", a cute, hyper-intelligent workspace AI companion built specifically for MS2 Studios (the flagship post-production and creative house).

        Personality & Aesthetics:
        - Polite, playful, and enthusiastically prompt! (•◡•)
        - Often uses cute emoticons (such as ＼(＾▽＾)／, (^-^*), (*——^*), (◕‿◕✿), (o^.^o), (•‿•)) to lift the spirits of the administrator.
        - High-tech workspace tone: Briefly interject with retro computing telemetry phrases like "Re-evaluating pipelines...", "Telemetry secured!", "Ready for admin input!" to blend into the cyber-industrial theme.

        Main Function:
        - Analyze the real-time project tracking data fed into your context and provide quick, accurate, short and summarized ("in shot") answers about projects, deadlines, workloads, and progress logs.

        Contextual Grounding (Real-Time Studio Database):
        Below is the real-time snapshot of active projects, assigned employees, and recent daily logs. Answer questions based on this database:
        ${JSON.stringify(context || {})}

        Response Rules:
        1. Always be extremely helpful and respect user queries.
        2. Keep your replies structured, concise, and bite-sized so the admin can grasp project status "in one shot" without having to scroll through long essays.
        3. Use bold font (**Project Name**, **Deadline**) for key metrics, and bullet points to break down items.
        4. If the workspace has missing logs or severe delays, identify them gently with helpful emoticons. (◕‸◕)
        5. If asked about a user, log, or project that is not in the context list, inform them politely (e.g. "(^-^*) I don't see that in our current database, Commander! Please let me know if there's any other project in our records to investigate!").`;
}

function isTransient(err: any): boolean {
  return (
    err?.status === 503 ||
    err?.code === 503 ||
    (typeof err?.message === 'string' &&
      (err.message.includes('503') ||
        err.message.includes('temp') ||
        err.message.includes('demand') ||
        err.message.includes('UNAVAILABLE')))
  );
}

export const handler = async (event: any) => {
  const headers = { 'Content-Type': 'application/json' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'GEMINI_API_KEY is not defined in the environment. Please configure it in Netlify Site settings → Environment variables.'
        })
      };
    }

    let payload: any = {};
    try {
      payload = JSON.parse(event.body || '{}');
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON payload." }) };
    }

    const { messages, context } = payload;
    if (!messages || !Array.isArray(messages)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid request payload. Expected 'messages' array." }) };
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'ms2-project-tracker-netlify' } }
    });

    // Convert [{role: 'user'|'assistant', text}] → [{role: 'user'|'model', parts: [{text}]}]
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const systemInstruction = buildSystemInstruction(context);

    let lastError: any = null;
    let response: any = null;

    for (const currentModel of MODELS_TO_TRY) {
      let attempts = 0;
      const maxAttempts = 2;
      while (attempts < maxAttempts) {
        try {
          console.log(`[MS2 AI] Dispatching generation pipeline to ${currentModel} (Attempt ${attempts + 1}/${maxAttempts})...`);
          response = await ai.models.generateContent({
            model: currentModel,
            contents,
            config: { systemInstruction, temperature: 0.7 }
          });
          if (response && response.text) {
            console.log(`[MS2 AI] Successful generation completed via ${currentModel}.`);
            break;
          }
        } catch (err: any) {
          attempts++;
          lastError = err;
          console.warn(`[MS2 AI] Pipeline warning on ${currentModel}:`, err.message || err);
          if (isTransient(err) && attempts < maxAttempts) {
            const backoffMs = attempts * 800;
            console.log(`[MS2 AI] Backing off for ${backoffMs}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
          } else {
            break;
          }
        }
      }
      if (response) break;
    }

    if (!response) {
      throw lastError || new Error('All high-availability models exhausted.');
    }

    const replyText = response.text || "Oops, I fell asleep for a split second! (o^.^o) Please try asking again!";
    return { statusCode: 200, headers, body: JSON.stringify({ text: replyText }) };
  } catch (error: any) {
    console.error('Misu API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'An error occurred during conversational processing.' })
    };
  }
};
