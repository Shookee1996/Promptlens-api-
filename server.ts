import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
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

// Sliding window in-memory rate limiter to protect interface & API
interface RateLimitRecord {
  timestamps: number[];
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 35; // 35 requests per minute

function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'client';
  const now = Date.now();
  let record = rateLimitMap.get(clientIp);

  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(clientIp, record);
  }

  // Filter timestamps within the current window
  record.timestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - record.timestamps.length);
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil((now + RATE_LIMIT_WINDOW_MS) / 1000));

  if (record.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldestTimestamp = record.timestamps[0];
    const retryAfterSec = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldestTimestamp)) / 1000));
    res.setHeader('Retry-After', retryAfterSec);
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait a moment before sending more requests.',
      retryAfter: retryAfterSec,
      limit: MAX_REQUESTS_PER_WINDOW,
    });
  }

  record.timestamps.push(now);
  next();
}

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

// Precision ping endpoint for latency measurement
app.get('/api/ping', (_req, res) => {
  const now = Date.now();
  res.json({
    pong: true,
    serverTime: now,
  });
});

// Gemini vision analysis route with rate limiting and latency tracking
app.post('/api/gemini/analyze', rateLimiter, async (req, res) => {
  const startTime = performance.now();
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

    const latencyMs = Math.round(performance.now() - startTime);
    const text = response.text || '';
    let parsedResult = { prompt: text, negative: '', latencyMs };
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        parsedResult = { ...parsed, latencyMs };
      }
    } catch {
      parsedResult = { prompt: text.trim(), negative: '', latencyMs };
    }

    res.json(parsedResult);
  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    console.error('Gemini analyze error:', error);
    res.status(500).json({
      error: error.message || 'Error executing Gemini vision model',
      status: error.status || 500,
      latencyMs,
    });
  }
});

// Gemini prompt enhancement route
app.post('/api/gemini/enhance', rateLimiter, async (req, res) => {
  const startTime = performance.now();
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

    const latencyMs = Math.round(performance.now() - startTime);
    const text = response.text || '';
    let parsedResult = { prompt: text, negative: '', latencyMs };
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        parsedResult = { ...parsed, latencyMs };
      }
    } catch {
      parsedResult = { prompt: text.trim(), negative: '', latencyMs };
    }

    res.json(parsedResult);
  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    console.error('Gemini enhance error:', error);
    res.status(500).json({
      error: error.message || 'Error executing Gemini enhance',
      status: error.status || 500,
      latencyMs,
    });
  }
});

// Gemini contextual prompt suggestions generator
app.post('/api/gemini/suggestions', rateLimiter, async (req, res) => {
  const startTime = performance.now();
  try {
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key is not configured on server' });
    }

    const { currentPrompt, category, imageContext } = req.body;
    const promptReq = `As an elite AI prompt engineer, provide 4 distinct, evocative, high-impact text enhancement phrases/modifiers for this image generation prompt:
"${currentPrompt || 'photo of subject'}"
Focus category: ${category || 'general artistic style and composition'}.
${imageContext ? `Image context: ${JSON.stringify(imageContext)}` : ''}

Return STRICT JSON only:
{
  "suggestions": [
    {"label": "Short label", "text": "Precise evocative modifier phrase to append", "category": "${category || 'aesthetic'}"}
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [{ text: promptReq }],
      },
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const latencyMs = Math.round(performance.now() - startTime);
    const text = response.text || '';
    let suggestions: any[] = [];
    try {
      const parsed = JSON.parse(text);
      suggestions = parsed.suggestions || [];
    } catch {
      suggestions = [];
    }

    res.json({ suggestions, latencyMs });
  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    const { category = 'style' } = req.body || {};
    // Return curated contextual smart suggestions fallback
    const fallbackMap: Record<string, any[]> = {
      lighting: [
        { label: 'Volumetric Rays', text: 'volumetric god rays piercing through dense morning mist with dramatic chiaroscuro', category: 'lighting' },
        { label: 'Cinematic Rim', text: 'subtle moody cinematic rim light outlining edges against deep shadow contrast', category: 'lighting' },
        { label: 'Bioluminescent', text: 'vibrant bioluminescent neon accents with soft atmospheric ambient glow', category: 'lighting' },
        { label: 'Golden Hour', text: 'warm golden hour sun flare with gentle chromatic aberration and lens bloom', category: 'lighting' },
      ],
      camera: [
        { label: '85mm Portrait', text: 'shot on 85mm f/1.2 lens with shallow depth of field and creamy circular bokeh', category: 'camera' },
        { label: 'Macro 100mm', text: 'extreme 100mm macro close-up showcasing tactile micro-textures and fine details', category: 'camera' },
        { label: 'Wide-Angle', text: 'dramatic 16mm low-angle perspective emphasizing scale and heroic grandeur', category: 'camera' },
        { label: 'Tilt-Shift', text: 'artistic tilt-shift miniature depth-of-field optical rendering', category: 'camera' },
      ],
      mood: [
        { label: 'Ethereal Serenity', text: 'hauntingly ethereal atmosphere imbued with poetic silence and tranquil mystery', category: 'mood' },
        { label: 'Noir Mystery', text: 'gritty neo-noir tension with brooding low-key shadows and urban solitude', category: 'mood' },
        { label: 'Nostalgic 90s', text: 'warm nostalgic analog 1990s color palette with authentic film grain texture', category: 'mood' },
        { label: 'Dynamic Energy', text: 'electrifying high-velocity kinetic energy with motion blur highlights', category: 'mood' },
      ],
    };

    const suggestions = fallbackMap[category] || [
      { label: 'Octane 8K', text: 'Unreal Engine 5 Octane render with raytraced global illumination and 8k detail', category: 'style' },
      { label: 'Editorial Polish', text: 'award-winning magazine editorial photography with pristine color grading', category: 'style' },
      { label: 'Baroque Chiaroscuro', text: 'Caravaggio inspired dramatic high-contrast chiaroscuro lighting', category: 'style' },
      { label: 'Cyberpunk Neon', text: 'cyberpunk neon aesthetic with glossy rain reflections on wet asphalt', category: 'style' },
    ];

    res.json({ suggestions, latencyMs, fallback: true });
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
app.post('/api/gemini/generate-image', rateLimiter, async (req, res) => {
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

    console.warn(`Gemini image generation warning (${isQuotaExceeded ? 'Quota Exceeded' : 'API Error'}):`, error.message);

    // Gracefully fallback to high-fidelity synthesized visual concept preview
    const fallbackUrl = generateSvgArtFallback(prompt, aspectRatio);
    res.json({
      imageUrl: fallbackUrl,
      isFallback: true,
      quotaExceeded: isQuotaExceeded,
      requiresPaidKey: true,
      error: isQuotaExceeded
        ? 'Gemini 3.1 Flash Image model free-tier quota is 0. Rendered high-fidelity visual concept preview. Select a paid API key in AI Studio to enable direct Gemini image generation.'
        : (error.message || 'Image generation error'),
      latencyMs,
    });
  }
});

// Create HTTP server to attach both Express and WebSockets
const server = http.createServer(app);

// Real-Time Multi-User Collaboration WebSocket Server
interface Collaborator {
  id: string;
  name: string;
  color: string;
  status: 'idle' | 'editing' | 'analyzing' | 'batch';
  lastActive: number;
  ws: WebSocket;
}

interface RoomState {
  id: string;
  collaborators: Map<string, Collaborator>;
  currentPrompt: string;
  activeImageName: string | null;
  lastUpdated: number;
}

const rooms = new Map<string, RoomState>();

function getOrCreateRoom(roomId: string): RoomState {
  let room = rooms.get(roomId);
  if (!room) {
    room = {
      id: roomId,
      collaborators: new Map(),
      currentPrompt: '',
      activeImageName: null,
      lastUpdated: Date.now(),
    };
    rooms.set(roomId, room);
  }
  return room;
}

function broadcastToRoom(roomId: string, message: any, excludeWs?: WebSocket) {
  const room = rooms.get(roomId);
  if (!room) return;
  const data = JSON.stringify(message);
  for (const client of room.collaborators.values()) {
    if (client.ws !== excludeWs && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  }
}

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  let currentRoomId: string | null = null;
  let currentUserId: string | null = null;

  ws.on('message', (rawMessage: string) => {
    try {
      const msg = JSON.parse(rawMessage);
      switch (msg.type) {
        case 'join': {
          const { roomId, user } = msg;
          const targetRoomId: string = roomId || 'default-room';
          currentRoomId = targetRoomId;
          currentUserId = user.id;

          const room = getOrCreateRoom(targetRoomId);
          const collaborator: Collaborator = {
            id: user.id,
            name: user.name || 'Anonymous Artist',
            color: user.color || '#37d6c0',
            status: 'idle',
            lastActive: Date.now(),
            ws,
          };

          room.collaborators.set(user.id, collaborator);

          // Send current state to joining user
          const userList = Array.from(room.collaborators.values()).map((c) => ({
            id: c.id,
            name: c.name,
            color: c.color,
            status: c.status,
          }));

          ws.send(
            JSON.stringify({
              type: 'room:init',
              roomId: targetRoomId,
              users: userList,
              currentPrompt: room.currentPrompt,
              activeImageName: room.activeImageName,
            })
          );

          // Broadcast user joined to other room members
          broadcastToRoom(
            targetRoomId,
            {
              type: 'user:joined',
              user: {
                id: collaborator.id,
                name: collaborator.name,
                color: collaborator.color,
                status: collaborator.status,
              },
            },
            ws
          );
          break;
        }

        case 'prompt:update': {
          if (!currentRoomId || !currentUserId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          room.currentPrompt = msg.prompt;
          room.lastUpdated = Date.now();

          const client = room.collaborators.get(currentUserId);
          if (client) {
            client.status = 'editing';
            client.lastActive = Date.now();
          }

          broadcastToRoom(
            currentRoomId,
            {
              type: 'prompt:updated',
              prompt: msg.prompt,
              senderId: currentUserId,
              senderName: client?.name,
              cursor: msg.cursor,
            },
            ws
          );
          break;
        }

        case 'status:update': {
          if (!currentRoomId || !currentUserId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          const client = room.collaborators.get(currentUserId);
          if (client) {
            client.status = msg.status || 'idle';
            client.lastActive = Date.now();
          }

          broadcastToRoom(
            currentRoomId,
            {
              type: 'status:updated',
              userId: currentUserId,
              status: msg.status,
              details: msg.details,
            },
            ws
          );
          break;
        }

        case 'image:shared': {
          if (!currentRoomId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          room.activeImageName = msg.imageName;
          broadcastToRoom(
            currentRoomId,
            {
              type: 'image:shared',
              imageName: msg.imageName,
              senderName: msg.senderName,
            },
            ws
          );
          break;
        }
      }
    } catch (e) {
      console.error('WebSocket error:', e);
    }
  });

  ws.on('close', () => {
    if (currentRoomId && currentUserId) {
      const room = rooms.get(currentRoomId);
      if (room) {
        room.collaborators.delete(currentUserId);
        broadcastToRoom(currentRoomId, {
          type: 'user:left',
          userId: currentUserId,
        });
        if (room.collaborators.size === 0) {
          rooms.delete(currentRoomId);
        }
      }
    }
  });
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

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server and WebSocket running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
