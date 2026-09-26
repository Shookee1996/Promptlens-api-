export interface QualityTier {
  k: string;
  w: number;
  h: number;
  mp: number;
}

export interface ColorDef {
  hex: string;
  ar: string;
  en: string;
  fr: string;
  es: string;
  rgb: [number, number, number];
}

export interface MetricData {
  bri: number;
  con: number;
  sat: number;
  warm: number;
  detail: number;
  centerRatio: number;
  bgVar: number;
  colorful: number;
  depth: number;
  sharp: number;
  sharpC: number;
  sharpE: number;
  sym: number;
  vig: number;
  thirdsRatio: number;
  textScore: number;
  flatRatio: number;
}

export interface PaletteItem {
  hex: string;
  pct: number;
}

export interface AnalysisData {
  w: number;
  h: number;
  tier: string;
  orient: 'landscape' | 'portrait' | 'square' | 'panorama';
  m: MetricData;
  palette: PaletteItem[];
  scheme: 'monochromatic' | 'complementary' | 'analogous' | 'mix';
  lines: 'horizontal' | 'vertical' | 'diagonal' | null;
  isDesign: boolean;
}

export interface ClassificationData {
  styleKey: 'mono' | 'design' | 'minimal' | 'vivid' | 'cinematic' | 'photoreal';
  compKey: 'center' | 'edge' | 'negative' | 'layered';
  lightKey: 'low' | 'dramatic' | 'bright' | 'golden' | 'soft' | 'balanced';
  moodKey: 'dreamy' | 'energetic' | 'nostalgic' | 'electric' | 'melancholic' | 'serene';
  detailKey: 'minimal' | 'clean' | 'moderate' | 'rich' | 'intricate';
  satKey: 'low' | 'high' | 'mid';
  bgKey: 'clean' | 'soft' | 'rich';
  thirds: boolean;
  symmetry: boolean;
  bokeh: boolean;
  vignette: boolean;
  focus: 'bokeh' | 'sharp' | 'soft' | null;
  tonal: 'high' | 'low' | null;
  texture: boolean;
  temperature: 'warm' | 'cool' | null;
  depth: boolean;
  colorRich: boolean;
  hasText: boolean;
  isDesign: boolean;
  layoutType: 'centered' | 'dynamic' | 'balanced';
  scheme: 'monochromatic' | 'complementary' | 'analogous' | 'mix';
  lines: 'horizontal' | 'vertical' | 'diagonal' | null;
}

export interface ApiInterface {
  id: string;
  name: string;
  provider: 'openai' | 'gemini' | 'anthropic' | 'custom';
  model: string;
  key: string;
  baseUrl?: string;
  precision: 'std' | 'high' | 'max';
  enabled: boolean;
  _encrypted?: boolean;
}

export interface LatencyMetrics {
  pixelDecodeMs: number;
  colorExtractionMs: number;
  compositionMs: number;
  apiRoundtripMs: number;
  totalMs: number;
  pingMs: number;
}

export interface BatchItem {
  id: number;
  name: string;
  file?: File;
  url: string;
  status: 'queued' | 'analyzing' | 'api' | 'enhancing' | 'done' | 'error';
  size: number;
  type: string;
  step: number;
  stepTimer?: any;
  a?: AnalysisData;
  cls?: ClassificationData;
  conf?: number;
  localPrompt?: string;
  finalPrompt?: string;
  finalNeg?: string | null;
  struct?: any;
  viaApi?: boolean;
  history?: string[];
  historyIndex?: number;
  latency?: LatencyMetrics;
}

export interface AdvancedFeatures {
  ultra: boolean;
  autoneg: boolean;
  twopass: boolean;
  jsonauto: boolean;
  typo: boolean;
  grid: boolean;
  depth: boolean;
  conf: boolean;
  dev: boolean;
  api: boolean;
  harmony: boolean;
  mood: boolean;
}

export interface AppOptions {
  style: 'mj' | 'sd' | 'dalle' | 'flux';
  detail: number; // 0: concise, 1: balanced, 2: exhaustive
  pLang: 'en' | 'ar' | 'fr' | 'es';
  enhance: boolean;
  target: number; // 0..6
  format: 'text' | 'json';
}

export interface CollaboratorUser {
  id: string;
  name: string;
  color: string;
  status: 'idle' | 'editing' | 'analyzing' | 'batch';
}

export interface RateLimitState {
  remaining: number;
  limit: number;
  resetSec: number;
  isLimited: boolean;
  cooldownSec: number;
}

export interface BatchWorkerConfig {
  concurrency: 1 | 2 | 4 | 8;
  isProcessing: boolean;
  isPaused: boolean;
  completedCount: number;
  failedCount: number;
  totalCount: number;
  avgTimePerItemMs: number;
  etaSeconds: number;
}
