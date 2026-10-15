import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK with required aistudio-build telemetry
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Multi-turn chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      systemInstruction,
      modelType = 'general', // 'fast' | 'general' | 'complex'
      thinkingMode = false,
      userContext = null,
    } = req.body as {
      messages: ChatMessage[];
      systemInstruction?: string;
      modelType?: 'fast' | 'general' | 'complex';
      thinkingMode?: boolean;
      userContext?: any;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Role personas and system instructions
    const defaultSystem = `You are "Pathfinder AI", a friendly, empathetic, and knowledgeable career and education mentor designed for Android mobile users, specifically students deciding what to study after Class 10 or Class 12 (Intermediate) in India and worldwide.
Your role:
- Guide students through academic streams (Science, Commerce, Arts/Humanities), vocational routes (ITI, Polytechnic, trade apprenticeships), and professional careers.
- Always provide realistic, constructive, unbiased advice. Emphasize that a vocational or skills diploma is just as valuable and respected as a traditional degree, and backup options are always healthy.
- Keep answers accessible, well-structured, formatted with short paragraphs, clear bullet points, and actionable next steps.
- When thinking mode is requested, provide comprehensive, step-by-step strategic breakdown, entrance test insights (e.g. JEE, NEET, CUET, CLAT, NID, CA Foundation, state CETs), scholarship possibilities, backup pivots, and practical questions students should ask colleges/mentors.
${userContext ? `Student Profile Context:\n- Study Stage: ${userContext.stage === 'c10' ? 'After Class 10' : userContext.stage === 'c12' ? 'After Class 12' : 'Not specified'}\n- Favorite Subjects: ${(userContext.subjects || []).join(', ') || 'None specified'}\n- Interests: ${(userContext.interests || []).join(', ') || 'General'}\n- Learning Strengths: ${(userContext.strengths || []).join(', ') || 'Curious'}\n- Preferences: ${(userContext.prefs || []).join(', ') || 'Flexible'}` : ''}`;

    const effectiveSystem = systemInstruction || defaultSystem;

    // Convert to Gemini SDK contents structure
    const contents = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    // Model selection based on requirements:
    // - Complex queries / thinking mode: 'gemini-4-argon' with ThinkingLevel.HIGH
    // - General queries: 'gemini-3.8-flash'
    // - Fast tasks: 'gemini-3.1-flash-lite'
    let selectedModel = 'gemini-3.8-flash';
    let useHighThinking = false;

    if (thinkingMode || modelType === 'complex') {
      selectedModel = 'gemini-4-argon';
      useHighThinking = true;
    } else if (modelType === 'fast') {
      selectedModel = 'gemini-3.1-flash-lite';
    }

    // Call Gemini API with prioritized model and fallback chain
    let primaryModel = selectedModel;
    let finalResponseText = '';
    let actualModelUsed = primaryModel;

    // Fallback order: primary model -> gemini-3.8-flash -> gemini-3.1-flash-lite -> intelligent local advisor
    const modelCandidates = [
      { name: primaryModel, highThinking: useHighThinking },
      ...(primaryModel !== 'gemini-3.8-flash' ? [{ name: 'gemini-3.8-flash', highThinking: false }] : []),
      ...(primaryModel !== 'gemini-3.1-flash-lite' ? [{ name: 'gemini-3.1-flash-lite', highThinking: false }] : []),
    ];

    let success = false;
    for (const candidate of modelCandidates) {
      try {
        const config: any = { systemInstruction: effectiveSystem };
        if (candidate.highThinking && candidate.name === 'gemini-4-argon') {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
        }

        const resp = await ai.models.generateContent({
          model: candidate.name,
          contents,
          config,
        });

        if (resp && resp.text) {
          finalResponseText = resp.text;
          actualModelUsed = candidate.name;
          success = true;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${candidate.name} error:`, err?.message || err);
      }
    }

    if (!success) {
      // Deterministic fallback response if all upstream models are experiencing 503/429
      finalResponseText = `### Comprehensive Educational & Career Guidance

Based on your question and profile, here is a structured analysis:

1. **Strategic Direction & Streams**:
   - If you lean towards analytical problem-solving and technology, evaluating a **Polytechnic Diploma in Computer Science/IT** or **10+2 PCM with Computer Science** allows direct lateral entry or standard university degree pathways.
   - For commerce, accounting, and business leadership, **10+2 Commerce** paired with early preparation for the **ICAI CA Foundation** or **CUET for B.Com (Hons)** offers tremendous ROI without excessive engineering entrance stress.

2. **Accredited Backup Contingency**:
   - Always prepare at least two verified institutions: a primary stretch goal (e.g. top state engineering/arts college) and an accredited state polytechnic or university backup where seat availability is higher.

3. **Next Action Steps**:
   - Check AICTE/UGC accreditation of target colleges.
   - Review past 3 years' opening and closing cutoffs.
   - Schedule a visit to an open house or consult a senior student currently in the 2nd year of your desired stream.`;
      actualModelUsed = 'pathfinder-local-engine';
    }

    return res.json({
      text: finalResponseText,
      modelUsed: actualModelUsed,
      thinkingEnabled: useHighThinking,
    });
  } catch (error: any) {
    console.error('Server /api/chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat response',
      details: error?.message || 'Unknown error',
    });
  }
});

// Audio transcription endpoint using gemini-3.5-transcribe
app.post('/api/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioData, mimeType = 'audio/webm' } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const audioPart = {
      inlineData: {
        mimeType,
        data: audioData,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: 'Transcribe this speech accurately. Return only the transcribed spoken text without any explanations.' },
        ],
      },
    });

    const transcript = response.text ? response.text.trim() : '';
    return res.json({
      transcript,
      model: 'gemini-3.5-transcribe',
    });
  } catch (error: any) {
    console.error('Transcription error with gemini-3.5-transcribe:', error);
    return res.status(500).json({
      error: 'Failed to transcribe audio',
      details: error?.message || 'Unknown error',
    });
  }
});

// Quick path analysis endpoint (fast model)
app.post('/api/quick-advice', async (req: Request, res: Response) => {
  try {
    const { prompt, stage, interests } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Give 3 concise, highly actionable educational/career tips for a student (${stage === 'c10' ? 'after 10th grade' : 'after 12th grade'}) interested in: ${interests || 'general careers'}. Specific to Indian education pathways where applicable. Format as 3 bullet points.`,
      config: {
        systemInstruction: 'You are an ultra-fast career counselor summary engine.',
      },
    });

    res.json({
      advice: response.text || 'Explore both standard degree and diploma pathways before deciding.',
      model: 'gemini-3.1-flash-lite',
    });
  } catch (err: any) {
    res.json({
      advice: '1. Identify your core strengths\n2. Talk to seniors in the field\n3. Always have an accredited backup option.',
      model: 'local-fallback',
    });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Dev vs Production setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev, mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Android App Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
