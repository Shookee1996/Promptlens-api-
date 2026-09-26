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

export function nearestColor(hex: string, lang: 'en' | 'ar' | 'fr' | 'es'): string {
  const c = hex2rgb(hex);
  let best = COLORS[0];
  let bd = 1e9;
  for (const col of COLORS) {
    const dr = c[0] - col.rgb[0];
    const dg = c[1] - col.rgb[1];
    const db = c[2] - col.rgb[2];
    const d = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
    if (d < bd) {
      bd = d;
      best = col;
    }
  }
  return best[lang] || best.en;
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
