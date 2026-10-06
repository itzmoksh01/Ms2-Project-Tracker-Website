/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Secure Server-side API endpoint for our cute "MS2 AI" Chatbot
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not defined in the environment secrets. Please configure it in Settings.'
        });
      }

      const { messages, context } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid request payload. Expected 'messages' array." });
      }

      // Initialize GoogleGenAI SDK on the server with recommended User-Agent
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Prepare contents list for @google/genai compatibility.
      // Convert [{role: 'user'|'assistant', text: '...'}] to [{role: 'user'|'model', parts: [{text: '...'}]}]
      const contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      // Structure a highly personalized, cute system instruction adhering to user request
      const systemInstruction = 
        `You are "MS2 AI", a cute, hyper-intelligent workspace AI companion built specifically for MS2 Studios (the flagship post-production and creative house).
        
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

      // Request GenerateContent from the model with resilience and fallbacks
      const modelsToTry = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-2.5-pro'];
      let lastError: any = null;
      let response = null;

      for (const currentModel of modelsToTry) {
        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
          try {
            console.log(`[MS2 AI] Dispatching generation pipeline to ${currentModel} (Attempt ${attempts + 1}/${maxAttempts})...`);
            
            response = await ai.models.generateContent({
              model: currentModel,
              contents,
              config: {
                systemInstruction,
                temperature: 0.7,
              }
            });

            if (response && response.text) {
              console.log(`[MS2 AI] Successful generation completed via ${currentModel}.`);
              break;
            }
          } catch (err: any) {
            attempts++;
            lastError = err;
            console.warn(`[MS2 AI] Pipeline warning on ${currentModel}:`, err.message || err);

            const isTransient = err.status === 503 || err.code === 503 || (err.message && (err.message.includes('503') || err.message.includes('temp') || err.message.includes('demand') || err.message.includes('UNAVAILABLE')));
            
            if (isTransient && attempts < maxAttempts) {
              const backoffMs = attempts * 800;
              console.log(`[MS2 AI] Backing off for ${backoffMs}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, backoffMs));
            } else {
              break;
            }
          }
        }

        if (response) {
          break;
        }
      }

      if (!response) {
        throw lastError || new Error('All high-availability models exhausted.');
      }

      const replyText = response.text || 'Oops, I fell asleep for a split second! (o^.^o) Please try asking again!';
      res.json({ text: replyText });

    } catch (error: any) {
      console.error('Misu API Error:', error);
      res.status(500).json({ error: error.message || 'An error occurred during conversational processing.' });
    }
  });

  // Integrate Vite Dev/Prod Server Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.all('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FULL-STACK] MS2 Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start full-stack server:', err);
});
