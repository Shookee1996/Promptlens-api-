import { QualityTier, ColorDef } from '../types';

export const TIERS: QualityTier[] = [
  { k: '1K', w: 1920, h: 1080, mp: 2.1 },
  { k: '2K', w: 2560, h: 1440, mp: 3.7 },
  { k: '4K', w: 3840, h: 2160, mp: 8.3 },
  { k: '5K', w: 5120, h: 2880, mp: 14.7 },
  { k: '6K', w: 6144, h: 3456, mp: 21.2 },
  { k: '8K', w: 7680, h: 4320, mp: 33.2 },
  { k: '12K', w: 11520, h: 6480, mp: 74.6 },
];

export const PRECISION = {
  std: { size: 1024, q: 0.85, temp: 0.5, passes: 1 },
  high: { size: 1600, q: 0.9, temp: 0.3, passes: 1 },
  max: { size: 2048, q: 0.93, temp: 0.2, passes: 2 },
};

export function hex2rgb(h: string): [number, number, number] {
  return [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
}

export function rgb2hex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
      .join('')
  );
}

export function lumOf(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const RAW_COLORS: [string, string, string, string, string][] = [
  ['#0d0d10', 'الأسود', 'deep black', 'noir profond', 'negro profundo'],
  ['#f7f6f2', 'الأبيض', 'pure white', 'blanc pur', 'blanco puro'],
  ['#8a8d91', 'الرمادي', 'neutral gray', 'gris neutre', 'gris neutro'],
  ['#c9ccd1', 'الفضي', 'soft silver', 'argenté', 'plateado'],
  ['#f1e6cf', 'الكريمي', 'soft cream', 'crème', 'crema'],
  ['#d3bd96', 'البيج', 'warm beige', 'beige chaud', 'beige cálido'],
  ['#7a4e2d', 'البني', 'earthy brown', 'brun terreux', 'marrón terroso'],
  ['#5b2330', 'العنابي', 'deep maroon', 'bordeaux', 'burdeos'],
  ['#b7410e', 'الصدئي', 'burnt rust', 'rouille', 'óxido'],
  ['#f28c28', 'البرتقالي', 'vivid orange', 'orange vif', 'naranja vivo'],
  ['#ffbf3f', 'العنبري', 'glowing amber', 'ambre doré', 'ámbar dorado'],
  ['#f5d547', 'الأصفر', 'sunny yellow', 'jaune solaire', 'amarillo soleado'],
  ['#77804c', 'الزيتوني', 'muted olive', 'olive', 'oliva'],
  ['#3e9b4f', 'الأخضر', 'fresh green', 'vert frais', 'verde fresco'],
  ['#2ecc87', 'الزمردي', 'emerald green', 'émeraude', 'esmeralda'],
  ['#17a398', 'الفيروزي', 'deep teal', 'bleu sarcelle', 'verde azulado'],
  ['#22d3ee', 'السماوي', 'bright cyan', 'cyan lumineux', 'cian brillante'],
  ['#7ec8e3', 'أزرق السماء', 'sky blue', 'bleu ciel', 'azul cielo'],
  ['#2e7cd6', 'الأزرق', 'vivid azure', 'azur', 'azul intenso'],
  ['#1b2a5b', 'الكحلي', 'deep navy', 'bleu marine', 'azul marino'],
  ['#7c4dcc', 'البنفسجي', 'rich violet', 'violet intense', 'violeta intenso'],
  ['#d63ac2', 'الماجنتا', 'electric magenta', 'magenta électrique', 'magenta eléctrico'],
  ['#f27ba8', 'الوردي', 'soft pink', 'rose tendre', 'rosa suave'],
  ['#e0393e', 'الأحمر', 'bold red', 'rouge franc', 'rojo intenso'],
  ['#a61c3c', 'القرمزي', 'deep crimson', 'cramoisi', 'carmesí'],
];

export const COLORS: ColorDef[] = RAW_COLORS.map((c) => ({
  hex: c[0],
  ar: c[1],
  en: c[2],
  fr: c[3],
  es: c[4],
  rgb: hex2rgb(c[0]),
}));

// Fast sRGB -> CIE XYZ -> CIELAB converter with numerical stability
export function rgb2lab(r: number, g: number, b: number): [number, number, number] {
  let rL = r / 255;
  let gL = g / 255;
  let bL = b / 255;

  rL = rL > 0.04045 ? Math.pow((rL + 0.055) / 1.055, 2.4) : rL / 12.92;
  gL = gL > 0.04045 ? Math.pow((gL + 0.055) / 1.055, 2.4) : gL / 12.92;
  bL = bL > 0.04045 ? Math.pow((bL + 0.055) / 1.055, 2.4) : bL / 12.92;

  // D65 Standard Illuminant reference white point
  const X = (rL * 0.4124564 + gL * 0.3575761 + bL * 0.1804375) / 0.95047;
  const Y = (rL * 0.2126729 + gL * 0.7151522 + bL * 0.0721750) / 1.00000;
  const Z = (rL * 0.0193339 + gL * 0.1191920 + bL * 0.9503041) / 1.08883;

  const fX = X > 0.008856 ? Math.cbrt(X) : 7.787 * X + 16 / 116;
  const fY = Y > 0.008856 ? Math.cbrt(Y) : 7.787 * Y + 16 / 116;
  const fZ = Z > 0.008856 ? Math.cbrt(Z) : 7.787 * Z + 16 / 116;

  const L = Math.max(0, Math.min(100, 116 * fY - 16));
  const A = Math.max(-128, Math.min(127, 500 * (fX - fY)));
  const B = Math.max(-128, Math.min(127, 200 * (fY - fZ)));

  return [L, A, B];
}

export function deltaE76(lab1: [number, number, number], lab2: [number, number, number]): number {
  const dL = lab1[0] - lab2[0];
  const da = lab1[1] - lab2[1];
  const db = lab1[2] - lab2[2];
  return Math.sqrt(dL * dL + da * da + db * db);
}

// Pre-computed CIELAB representations for color vocabulary
const LAB_COLORS = COLORS.map((col) => ({
  ...col,
  lab: rgb2lab(col.rgb[0], col.rgb[1], col.rgb[2]),
}));

export function nearestColorLab(hex: string, lang: 'en' | 'ar' | 'fr' | 'es'): string {
  const rgb = hex2rgb(hex);
  const lab = rgb2lab(rgb[0], rgb[1], rgb[2]);
  let best = LAB_COLORS[0];
  let minDelta = 1e9;

  for (const col of LAB_COLORS) {
    const dE = deltaE76(lab, col.lab);
    if (dE < minDelta) {
      minDelta = dE;
      best = col;
    }
  }
  return best[lang] || best.en;
}

// Estimates correlated color temperature in Kelvin using McCamy's cubic approximation
export function rgb2kelvin(r: number, g: number, b: number): number {
  const sum = r + g + b;
  if (sum === 0) return 5500;
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / (sum * 0.95);
  const y = (0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / (sum * 1.0);
  const n = (x - 0.3320) / (0.1858 - y);
  const cct = 449 * Math.pow(n, 3) + 3525 * Math.pow(n, 2) + 6823.3 * n + 5520.33;
  return Math.max(2000, Math.min(12000, Math.round(cct)));
}

export function nearestColor(hex: string, lang: 'en' | 'ar' | 'fr' | 'es'): string {
  return nearestColorLab(hex, lang);
}

export const SAMPLES = [
  {
    key: 'falcon',
    name: 'falcon',
    url: 'https://images.unsplash.com/photo-1549608276-5786777e6587?auto=format&fit=crop&w=1200&q=80',
    color: '#ffb454',
  },
  {
    key: 'oasis',
    name: 'oasis',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    color: '#ff8a5b',
  },
  {
    key: 'mist',
    name: 'misty forest',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    color: '#7fa39b',
  },
];

export const OWNER_EMAIL = 'Shookee1996@gmail.com';
