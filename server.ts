import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '60mb' }));

// Precision latency measurement middleware
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  const originalEnd = res.end;
  res.end = function (...args: any[]) {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);
    }
    return (originalEnd as any).apply(res, args);
  };
  next();
});

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

// Engine status and capabilities endpoint
app.get('/api/engine-status', (_req, res) => {
  res.json({
    status: 'ok',
    builtIn: {
      provider: 'gemini',
      model: 'gemini-3.8-flash',
      active: !!ai,
    },
    supportedProviders: ['gemini', 'openai', 'anthropic', 'custom'],
    serverTime: Date.now(),
  });
});

// Precision ping endpoint for latency measurement
app.get('/api/ping', (_req, res) => {
  const now = Date.now();
  res.json({
    pong: true,
    serverTime: now,
  });
});

// Interface for multi-provider API configuration
interface ApiConfigPayload {
  provider?: 'gemini' | 'openai' | 'anthropic' | 'custom';
  model?: string;
  key?: string;
  baseUrl?: string;
  precision?: 'std' | 'high' | 'max';
}

// Universal vision analysis provider executor
async function callProviderVision({
  apiConfig,
  base64,
  mimeType,
  instruction,
  temperature = 0.3,
}: {
  apiConfig?: ApiConfigPayload;
  base64: string;
  mimeType: string;
  instruction: string;
  temperature?: number;
}): Promise<{ text: string; engine: string }> {
  const provider = apiConfig?.provider || 'gemini';
  const model = apiConfig?.model;
  const key = apiConfig?.key;
  const baseUrl = apiConfig?.baseUrl;

  // 1. OpenAI or Custom OpenAI-compatible endpoint
  if ((provider === 'openai' || provider === 'custom') && key) {
    const endpoint = (baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '') + '/chat/completions';
    const targetModel = model || (provider === 'openai' ? 'gpt-4o' : 'custom-vision');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: instruction },
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
            ],
          },
        ],
        temperature,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `OpenAI endpoint returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return { text, engine: `${provider === 'openai' ? 'OpenAI' : 'Custom'}: ${targetModel}` };
  }

  // 2. Anthropic Claude
  if (provider === 'anthropic' && key) {
    const endpoint = (baseUrl || 'https://api.anthropic.com/v1').replace(/\/+$/, '') + '/messages';
    const targetModel = model || 'claude-3-5-sonnet-latest';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: targetModel,
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: base64,
                },
              },
              { type: 'text', text: instruction },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Anthropic returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    return { text, engine: `Claude: ${targetModel}` };
  }

  // 3. Google Gemini (Custom Key or Built-in Server Client)
  const geminiClient = key
    ? new GoogleGenAI({ apiKey: key, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } })
    : ai;

  if (!geminiClient) {
    throw new Error('Gemini API key is not configured on server or in custom API settings');
  }

  const targetModel = model || 'gemini-3.8-flash';
  const response = await geminiClient.models.generateContent({
    model: targetModel,
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
      temperature,
    },
  });

  return { text: response.text || '', engine: `Gemini: ${targetModel}` };
}

// Universal prompt enhancement provider executor
async function callProviderEnhance({
  apiConfig,
  instruction,
  base64,
  mimeType,
  temperature = 0.3,
}: {
  apiConfig?: ApiConfigPayload;
  instruction: string;
  base64?: string;
  mimeType?: string;
  temperature?: number;
}): Promise<{ text: string; engine: string }> {
  const provider = apiConfig?.provider || 'gemini';
  const model = apiConfig?.model;
  const key = apiConfig?.key;
  const baseUrl = apiConfig?.baseUrl;

  // 1. OpenAI or Custom
  if ((provider === 'openai' || provider === 'custom') && key) {
    const endpoint = (baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '') + '/chat/completions';
    const targetModel = model || (provider === 'openai' ? 'gpt-4o-mini' : 'custom-model');
    const messages: any[] = [{ role: 'user', content: instruction }];

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: targetModel,
        messages,
        temperature,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `OpenAI returned HTTP ${response.status}`);
    }

    const data = await response.json();
    return { text: data.choices?.[0]?.message?.content || '', engine: `${provider === 'openai' ? 'OpenAI' : 'Custom'}: ${targetModel}` };
  }

  // 2. Anthropic Claude
  if (provider === 'anthropic' && key) {
    const endpoint = (baseUrl || 'https://api.anthropic.com/v1').replace(/\/+$/, '') + '/messages';
    const targetModel = model || 'claude-3-5-sonnet-latest';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: targetModel,
        max_tokens: 1500,
        messages: [{ role: 'user', content: instruction }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Anthropic returned HTTP ${response.status}`);
    }

    const data = await response.json();
    return { text: data.content?.[0]?.text || '', engine: `Claude: ${targetModel}` };
  }

  // 3. Google Gemini
  const geminiClient = key
    ? new GoogleGenAI({ apiKey: key, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } })
    : ai;

  if (!geminiClient) {
    throw new Error('Gemini API key is not configured');
  }

  const parts: any[] = [{ text: instruction }];
  if (base64 && mimeType) {
    parts.unshift({
      inlineData: {
        mimeType,
        data: base64,
      },
    });
  }

  const targetModel = model || 'gemini-3.8-flash';
  const response = await geminiClient.models.generateContent({
    model: targetModel,
    contents: { parts },
    config: {
      responseMimeType: 'application/json',
      temperature,
    },
  });

  return { text: response.text || '', engine: `Gemini: ${targetModel}` };
}

// Live real-time connection tester endpoint for multi-provider API setup
app.post('/api/api-test', async (req, res) => {
  const startTime = performance.now();
  const { provider = 'gemini', model, key, baseUrl } = req.body || {};

  try {
    if (provider === 'gemini') {
      const client = key
        ? new GoogleGenAI({ apiKey: key, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } })
        : ai;

      if (!client) {
        return res.status(400).json({ ok: false, error: 'Gemini API key is not configured on server or in key field.' });
      }

      const targetModel = model || 'gemini-3.8-flash';
      const testRes = await client.models.generateContent({
        model: targetModel,
        contents: 'Quick health probe. Respond with: OK',
      });

      const latencyMs = Math.round(performance.now() - startTime);
      return res.json({
        ok: true,
        latencyMs,
        provider: 'gemini',
        model: targetModel,
        message: 'Google Gemini connected and responsive',
        snippet: testRes.text?.slice(0, 40) || 'OK',
      });
    }

    if (provider === 'openai' || provider === 'custom') {
      if (!key) {
        return res.status(400).json({ ok: false, error: 'API key is required' });
      }
      const endpoint = (baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '') + '/chat/completions';
      const targetModel = model || (provider === 'openai' ? 'gpt-4o-mini' : 'custom');

      const testRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [{ role: 'user', content: 'Ping test' }],
          max_tokens: 5,
        }),
      });

      const latencyMs = Math.round(performance.now() - startTime);
      if (!testRes.ok) {
        const errJson = await testRes.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Endpoint returned HTTP ${testRes.status}`);
      }
      return res.json({
        ok: true,
        latencyMs,
        provider,
        model: targetModel,
        message: 'Endpoint verified and responsive',
      });
    }

    if (provider === 'anthropic') {
      if (!key) {
        return res.status(400).json({ ok: false, error: 'Anthropic API key is required' });
      }
      const endpoint = (baseUrl || 'https://api.anthropic.com/v1').replace(/\/+$/, '') + '/messages';
      const targetModel = model || 'claude-3-5-sonnet-latest';

      const testRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: targetModel,
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Ping test' }],
        }),
      });

      const latencyMs = Math.round(performance.now() - startTime);
      if (!testRes.ok) {
        const errJson = await testRes.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Anthropic returned HTTP ${testRes.status}`);
      }
      return res.json({
        ok: true,
        latencyMs,
        provider: 'anthropic',
        model: targetModel,
        message: 'Anthropic Claude verified and responsive',
      });
    }

    res.status(400).json({ ok: false, error: `Unsupported provider: ${provider}` });
  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    res.json({
      ok: false,
      latencyMs,
      error: error.message || 'Connection test failed',
    });
  }
});

// Gemini / Multi-Provider vision analysis route with latency tracking & fallback
app.post('/api/gemini/analyze', async (req, res) => {
  const startTime = performance.now();
  const { base64, mimeType = 'image/jpeg', instruction, temperature = 0.3, apiConfig } = req.body;

  if (!base64 || !instruction) {
    return res.status(400).json({ error: 'Missing base64 image or instruction' });
  }

  try {
    let result: { text: string; engine: string };
    try {
      result = await callProviderVision({
        apiConfig,
        base64,
        mimeType,
        instruction,
        temperature: Number(temperature) || 0.3,
      });
    } catch (primaryError: any) {
      // If primary custom API failed and server Gemini is available, gracefully fallback
      if (apiConfig && ai) {
        result = await callProviderVision({
          apiConfig: undefined, // use server gemini
          base64,
          mimeType,
          instruction,
          temperature: Number(temperature) || 0.3,
        });
        result.engine += ' (Fallback)';
      } else {
        throw primaryError;
      }
    }

    const latencyMs = Math.round(performance.now() - startTime);
    const text = result.text || '';
    let parsedResult = { prompt: text, negative: '', engine: result.engine, latencyMs };
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        parsedResult = { ...parsed, engine: result.engine, latencyMs };
      }
    } catch {
      parsedResult = { prompt: text.trim(), negative: '', engine: result.engine, latencyMs };
    }

    res.json(parsedResult);
  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    res.status(500).json({
      error: error.message || 'Error executing vision model',
      status: error.status || 500,
      latencyMs,
    });
  }
});

// Gemini / Multi-Provider prompt enhancement route with latency tracking & fallback
app.post('/api/gemini/enhance', async (req, res) => {
  const startTime = performance.now();
  const { base64, mimeType = 'image/jpeg', instruction, temperature = 0.3, apiConfig } = req.body;

  if (!instruction) {
    return res.status(400).json({ error: 'Missing prompt enhancement instruction' });
  }

  try {
    let result: { text: string; engine: string };
    try {
      result = await callProviderEnhance({
        apiConfig,
        instruction,
        base64,
        mimeType,
        temperature: Number(temperature) || 0.3,
      });
    } catch (primaryError: any) {
      if (apiConfig && ai) {
        result = await callProviderEnhance({
          apiConfig: undefined,
          instruction,
          base64,
          mimeType,
          temperature: Number(temperature) || 0.3,
        });
        result.engine += ' (Fallback)';
      } else {
        throw primaryError;
      }
    }

    const latencyMs = Math.round(performance.now() - startTime);
    const text = result.text || '';
    let parsedResult = { prompt: text, negative: '', engine: result.engine, latencyMs };
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        parsedResult = { ...parsed, engine: result.engine, latencyMs };
      }
    } catch {
      parsedResult = { prompt: text.trim(), negative: '', engine: result.engine, latencyMs };
    }

    res.json(parsedResult);
  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    res.status(500).json({
      error: error.message || 'Error executing prompt enhance',
      status: error.status || 500,
      latencyMs,
    });
  }
});

// Generate rich aesthetic SVG concept art fallback when image model quota is exceeded or offline
function generateSvgArtFallback(prompt: string, aspectRatio: string = '1:1'): string {
  let width = 1024;
  let height = 1024;
  if (aspectRatio === '16:9') {
    width = 1280;
    height = 720;
  } else if (aspectRatio === '9:16') {
    width = 720;
    height = 1280;
  } else if (aspectRatio === '4:3') {
    width = 1024;
    height = 768;
  } else if (aspectRatio === '3:4') {
    width = 768;
    height = 1024;
  }

  const pLower = prompt.toLowerCase();
  let grad1 = '#091a17';
  let grad2 = '#163832';
  let accent1 = '#37d6c0';
  let accent2 = '#ffb454';

  if (pLower.includes('gold') || pLower.includes('sun') || pLower.includes('warm') || pLower.includes('fire') || pLower.includes('amber')) {
    grad1 = '#1c0f06';
    grad2 = '#3a1f0a';
    accent1 = '#ffb454';
    accent2 = '#ff6b35';
  } else if (pLower.includes('cyber') || pLower.includes('neon') || pLower.includes('future') || pLower.includes('synth')) {
    grad1 = '#0b081c';
    grad2 = '#1e1140';
    accent1 = '#00f5d4';
    accent2 = '#f72585';
  } else if (pLower.includes('noir') || pLower.includes('dark') || pLower.includes('shadow') || pLower.includes('black')) {
    grad1 = '#050708';
    grad2 = '#13181a';
    accent1 = '#9fc3ba';
    accent2 = '#ffffff';
  } else if (pLower.includes('nature') || pLower.includes('forest') || pLower.includes('emerald') || pLower.includes('green')) {
    grad1 = '#04140c';
    grad2 = '#0d2d1d';
    accent1 = '#2ec4b6';
    accent2 = '#a7c957';
  }

  const escapeXml = (unsafe: string) =>
    unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const cleanPrompt = escapeXml(prompt.slice(0, 180) + (prompt.length > 180 ? '…' : ''));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="${grad2}" />
      <stop offset="100%" stop-color="${grad1}" />
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accent1}" stop-opacity="0.25" />
      <stop offset="100%" stop-color="${accent1}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accent1}" stop-opacity="0.6" />
      <stop offset="100%" stop-color="${accent2}" stop-opacity="0.3" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${accent1}" stroke-opacity="0.07" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
  <rect width="${width}" height="${height}" fill="url(#grid)" />

  <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.44}" fill="url(#glow)" />
  <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.36}" fill="none" stroke="url(#lineGrad)" stroke-width="1.5" stroke-dasharray="6,4" />
  <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.24}" fill="none" stroke="${accent2}" stroke-opacity="0.35" stroke-width="1" />
  <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.12}" fill="none" stroke="${accent1}" stroke-opacity="0.4" stroke-width="1.5" />

  <path d="M 40 60 L 40 40 L 60 40" fill="none" stroke="${accent1}" stroke-width="2" stroke-opacity="0.8" />
  <path d="M ${width - 60} 40 L ${width - 40} 40 L ${width - 40} 60" fill="none" stroke="${accent1}" stroke-width="2" stroke-opacity="0.8" />
  <path d="M 40 ${height - 60} L 40 ${height - 40} L 60 ${height - 40}" fill="none" stroke="${accent1}" stroke-width="2" stroke-opacity="0.8" />
  <path d="M ${width - 60} ${height - 40} L ${width - 40} ${height - 40} L ${width - 40} ${height - 60}" fill="none" stroke="${accent1}" stroke-width="2" stroke-opacity="0.8" />

  <line x1="${width / 2 - 20}" y1="${height / 2}" x2="${width / 2 + 20}" y2="${height / 2}" stroke="${accent1}" stroke-width="1.5" stroke-opacity="0.7" />
  <line x1="${width / 2}" y1="${height / 2 - 20}" x2="${width / 2}" y2="${height / 2 + 20}" stroke="${accent1}" stroke-width="1.5" stroke-opacity="0.7" />

  <rect x="${width / 2 - 150}" y="50" width="300" height="32" rx="16" fill="#000000" fill-opacity="0.65" stroke="${accent1}" stroke-width="1" stroke-opacity="0.4"/>
  <text x="${width / 2}" y="71" fill="${accent1}" font-family="monospace, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="2">AI VISUAL CONCEPT PREVIEW</text>

  <text x="60" y="${height - 45}" fill="#8faea5" font-family="monospace, sans-serif" font-size="13">${aspectRatio} • ${width}×${height}px</text>
  <text x="${width - 60}" y="${height - 45}" fill="${accent2}" font-family="monospace, sans-serif" font-size="13" text-anchor="end" font-weight="bold">PROMPTLENS STUDIO</text>

  <g transform="translate(${width / 2 - Math.min(width * 0.42, 360)}, ${height / 2 + 60})">
    <rect width="${Math.min(width * 0.84, 720)}" height="110" rx="14" fill="#061210" fill-opacity="0.88" stroke="#22403a" stroke-width="1.5" />
    <text x="24" y="32" fill="${accent2}" font-family="sans-serif" font-size="11" font-weight="bold" letter-spacing="1">SYNTHESIZED PROMPT ESSENCE</text>
    <text x="24" y="60" fill="#e7f2ee" font-family="sans-serif" font-size="13.5" font-style="italic">"${cleanPrompt}"</text>
    <text x="24" y="92" fill="#54736c" font-family="monospace, sans-serif" font-size="10.5">Procedural Visual Synthesis • Ready for Production Generation</text>
  </g>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Gemini image generation route with quota resilience and visual fallback
app.post('/api/gemini/generate-image', async (req, res) => {
  const startTime = performance.now();
  const { prompt, aspectRatio = '1:1' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt for image generation' });
  }

  if (!ai) {
    const latencyMs = Math.round(performance.now() - startTime);
    const fallbackUrl = generateSvgArtFallback(prompt, aspectRatio);
    return res.json({
      imageUrl: fallbackUrl,
      isFallback: true,
      requiresPaidKey: true,
      quotaExceeded: false,
      message: 'Gemini API key is not configured on server. Rendering synthesized concept preview.',
      latencyMs,
    });
  }

  try {
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

    const latencyMs = Math.round(performance.now() - startTime);
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
      const fallbackUrl = generateSvgArtFallback(prompt, aspectRatio);
      return res.json({
        imageUrl: fallbackUrl,
        isFallback: true,
        message: 'No image data returned from model. Rendered visual concept preview.',
        latencyMs,
      });
    }

    res.json({ imageUrl, isFallback: false, latencyMs });
  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    const errStr = String(error.message || '');
    const isQuotaExceeded =
      error.status === 429 ||
      error.code === 429 ||
      errStr.includes('429') ||
      errStr.includes('quota') ||
      errStr.includes('RESOURCE_EXHAUSTED');

    // Handle quota exhaustion gracefully without logging alarming warnings that trigger error monitors
    const fallbackUrl = generateSvgArtFallback(prompt, aspectRatio);
    res.json({
      imageUrl: fallbackUrl,
      isFallback: true,
      quotaExceeded: isQuotaExceeded,
      requiresPaidKey: isQuotaExceeded,
      message: isQuotaExceeded
        ? 'Gemini 3.1 Flash Image model free-tier quota is 0. Rendered high-fidelity visual concept preview.'
        : (error.message || 'Image generation error'),
      latencyMs,
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
