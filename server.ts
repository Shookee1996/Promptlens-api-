import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '60mb' }));

// Initialize GoogleGenAI if key available
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// Gemini vision analysis route
app.post('/api/gemini/analyze', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key is not configured on server' });
    }

    const { base64, mimeType = 'image/jpeg', instruction, temperature = 0.3 } = req.body;
    if (!base64 || !instruction) {
      return res.status(400).json({ error: 'Missing base64 image or instruction' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64,
            },
          },
          {
            text: instruction,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        temperature: Number(temperature) || 0.3,
      },
    });

    const text = response.text || '';
    let parsedResult = { prompt: text, negative: '' };
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // fallback to plain text prompt
      parsedResult = { prompt: text.trim(), negative: '' };
    }

    res.json(parsedResult);
  } catch (error: any) {
    console.error('Gemini analyze error:', error);
    res.status(500).json({
      error: error.message || 'Error executing Gemini vision model',
      status: error.status || 500,
    });
  }
});

// Gemini prompt enhancement route
app.post('/api/gemini/enhance', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key is not configured on server' });
    }

    const { base64, mimeType = 'image/jpeg', instruction, temperature = 0.3 } = req.body;
    if (!instruction) {
      return res.status(400).json({ error: 'Missing prompt enhancement instruction' });
    }

    const parts: any[] = [{ text: instruction }];
    if (base64) {
      parts.unshift({
        inlineData: {
          mimeType,
          data: base64,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        temperature: Number(temperature) || 0.3,
      },
    });

    const text = response.text || '';
    let parsedResult = { prompt: text, negative: '' };
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      }
    } catch {
      parsedResult = { prompt: text.trim(), negative: '' };
    }

    res.json(parsedResult);
  } catch (error: any) {
    console.error('Gemini enhance error:', error);
    res.status(500).json({
      error: error.message || 'Error executing Gemini enhance',
      status: error.status || 500,
    });
  }
});

// Gemini image generation route
app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key is not configured on server' });
    }

    const { prompt, aspectRatio = '1:1' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt for image generation' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    let imageUrl: string | null = null;
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: 'No image data returned from Gemini' });
    }

    res.json({ imageUrl });
  } catch (error: any) {
    console.error('Gemini image generation error:', error);
    res.status(500).json({
      error: error.message || 'Error generating image with Gemini',
      status: error.status || 500,
    });
  }
});

// Vite middleware or static serving
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
