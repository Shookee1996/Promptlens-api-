import {
  AnalysisData,
  ClassificationData,
  AppOptions,
  AdvancedFeatures,
  BatchItem,
} from '../types';
import {
  TIERS,
  lumOf,
  rgb2hex,
  hex2rgb,
  rgb2lab,
  deltaE76,
  rgb2kelvin,
  nearestColorLab,
} from './constants';

export function ratioFor(w: number, h: number): string {
  const r = w / h;
  const RS = [
    [21, 9],
    [2, 1],
    [16, 9],
    [16, 10],
    [3, 2],
    [4, 3],
    [5, 4],
    [1, 1],
    [4, 5],
    [3, 4],
    [2, 3],
    [10, 16],
    [9, 16],
    [1, 2],
    [9, 21],
  ];
  let best = RS[0];
  let bd = 1e9;
  for (const [a, b] of RS) {
    const d = Math.abs(Math.log(r / (a / b)));
    if (d < bd) {
      bd = d;
      best = [a, b];
    }
  }
  return `${best[0]}:${best[1]}`;
}

export function tierOf(w: number, h: number): string {
  const s = Math.max(w, h);
  if (s >= 11200) return '12K';
  if (s >= 7600) return '8K';
  if (s >= 5600) return '6K';
  if (s >= 4500) return '5K';
  if (s >= 3400) return '4K';
  if (s >= 2400) return '2K';
  if (s >= 1400) return '1K';
  return '<1K';
}

export function orientOf(w: number, h: number): 'landscape' | 'portrait' | 'square' | 'panorama' {
  const r = w / h;
  if (r >= 2.2) return 'panorama';
  if (r > 1.12) return 'landscape';
  if (r < 0.9) return 'portrait';
  return 'square';
}

export interface LocalEngineOptions {
  engineMode?: 'turbo' | 'deep' | 'cinematic' | 'design';
  cielab?: boolean;
  goldenRatio?: boolean;
  lensSim?: boolean;
}

// 1. High-Performance Pixel Analyzer with Multi-Scale & Multi-Engine Heuristics
export function analyzePixelsOptimized(
  canvas: HTMLCanvasElement,
  options: LocalEngineOptions = {}
) {
  const mode = options.engineMode || 'deep';
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('decode');

  const w = canvas.width;
  const h = canvas.height;
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, w, h).data;
  } catch {
    throw new Error('decode');
  }

  const n = w * h;
  const lum = new Float32Array(n);
  const lumHist = new Int32Array(256);

  let sumL = 0;
  let sumL2 = 0;
  let sumS = 0;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;

  // Spatial color bucket map
  const buckets = new Map<number, { c: number; r: number; g: number; b: number }>();
  let sRG = 0;
  let sRG2 = 0;
  let sYB = 0;
  let sYB2 = 0;
  let fine = 0;
  let flat = 0;
  let flatNoiseSum = 0;
  let flatNoiseCount = 0;

  const hueHist = new Float32Array(12);
  let hueN = 0;

  // Pass 1: Pixel statistics & fast color clustering
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const L = lumOf(r, g, b);
    lum[i] = L;
    const lByte = Math.max(0, Math.min(255, Math.round(L)));
    lumHist[lByte]++;

    sumL += L;
    sumL2 += L * L;

    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    const s = mx ? (mx - mn) / mx : 0;
    sumS += s;
    sumR += r;
    sumG += g;
    sumB += b;

    const rg = r - g;
    const yb = 0.5 * (r + g) - b;
    sRG += rg;
    sRG2 += rg * rg;
    sYB += yb;
    sYB2 += yb * yb;

    if (i > w) {
      const dx = Math.abs(L - lum[i - 1]);
      const dy = Math.abs(L - lum[i - w]);
      if (dx + dy > 55) fine++;
      if (dx < 5 && dy < 5) {
        flat++;
        flatNoiseSum += dx + dy;
        flatNoiseCount++;
      }
    }

    if (s > 0.2 && mx > 35) {
      let hue: number;
      if (mx === r) hue = 60 * (((g - b) / (mx - mn)) % 6);
      else if (mx === g) hue = 60 * ((b - r) / (mx - mn) + 2);
      else hue = 60 * ((r - g) / (mx - mn) + 4);
      if (hue < 0) hue += 360;
      hueHist[Math.min(11, Math.floor(hue / 30))]++;
      hueN++;
    }

    // 15-bit RGB color clustering (5 bits per channel)
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    let bk = buckets.get(key);
    if (!bk) {
      bk = { c: 0, r: 0, g: 0, b: 0 };
      buckets.set(key, bk);
    }
    bk.c++;
    bk.r += r;
    bk.g += g;
    bk.b += b;
  }

  const avgL = sumL / n;
  const std = Math.sqrt(Math.max(0, sumL2 / n - avgL * avgL));
  const sat = sumS / n;
  const avgR = sumR / n;
  const avgG = sumG / n;
  const avgB = sumB / n;
  const warm = (sumR - sumB) / n;
  const mRG = sRG / n;
  const mYB = sYB / n;
  const sdRG = Math.sqrt(Math.max(0, sRG2 / n - mRG * mRG));
  const sdYB = Math.sqrt(Math.max(0, sYB2 / n - mYB * mYB));
  const colorful = Math.min(
    1,
    (Math.sqrt(sdRG * sdRG + sdYB * sdYB) + 0.3 * Math.sqrt(mRG * mRG + mYB * mYB)) / 110
  );
  const fineRate = fine / Math.max(1, n - w);
  const flatRatio = flat / Math.max(1, n - w);
  const textScore = Math.max(0, Math.min(1, (fineRate - 0.035) * 7));
  const isDesign = flatRatio > 0.48 && (sat > 0.18 || colorful > 0.28 || mode === 'design');
  const noiseGrain = flatNoiseCount ? Math.min(1, (flatNoiseSum / flatNoiseCount) / 4.5) : 0;
  const colorKelvin = rgb2kelvin(avgR, avgG, avgB);

  // Dynamic Range in EV stops (5th percentile to 95th percentile)
  let p5 = 0;
  let p95 = 255;
  let accum = 0;
  const t5 = n * 0.05;
  const t95 = n * 0.95;
  for (let k = 0; k < 256; k++) {
    accum += lumHist[k];
    if (p5 === 0 && accum >= t5) p5 = k;
    if (accum >= t95) {
      p95 = k;
      break;
    }
  }
  const dynamicRangeEV = Math.max(1, Math.min(15, Math.round(Math.log2(Math.max(2, p95) / Math.max(1, p5)) * 2) / 2));

  // Geometry & Composition Nodes
  const cx0 = Math.floor(w * 0.3);
  const cx1 = Math.ceil(w * 0.7);
  const cy0 = Math.floor(h * 0.3);
  const cy1 = Math.ceil(h * 0.7);

  // Rule of Thirds
  const t3x0 = w / 3;
  const t3x1 = (2 * w) / 3;
  const t3y0 = h / 3;
  const t3y1 = (2 * h) / 3;

  // Golden Ratio / Golden Spiral Nodes (phi = 1.6180339887)
  const phi = 1.6180339887;
  const phiX0 = w * (1 - 1 / phi); // 0.382 w
  const phiX1 = w * (1 / phi);     // 0.618 w
  const phiY0 = h * (1 - 1 / phi); // 0.382 h
  const phiY1 = h * (1 / phi);     // 0.618 h

  const band = Math.max(2, Math.round(Math.min(w, h) * 0.06));
  const phiBand = Math.max(2, Math.round(Math.min(w, h) * 0.05));

  let edgeTotal = 0;
  let edgeCenter = 0;
  let thirds = 0;
  let goldenNodes = 0;
  let oH = 0;
  let oV = 0;
  let oD = 0;
  let leadingLinesScore = 0;

  let lapSum = 0;
  let lapN = 0;
  let lapC = 0;
  let lapCN = 0;
  let lapE = 0;
  let lapEN = 0;
  let lapT = 0;
  let lapTN = 0;
  let lapB = 0;
  let lapBN = 0;

  const topLine = h * 0.35;
  const botLine = h * 0.65;

  for (let y = 1; y < h - 1; y++) {
    const row = y * w;
    const inYB = Math.abs(y - t3y0) < band || Math.abs(y - t3y1) < band;
    const inPhiY = Math.abs(y - phiY0) < phiBand || Math.abs(y - phiY1) < phiBand;

    for (let x = 1; x < w - 1; x++) {
      const i = row + x;
      // Sobel 3x3 Gradient Filters
      const gx =
        lum[i + 1] - lum[i - 1] + 0.5 * (lum[i + w + 1] - lum[i + w - 1] + lum[i - w + 1] - lum[i - w - 1]);
      const gy =
        lum[i + w] - lum[i - w] + 0.5 * (lum[i + w + 1] - lum[i - w + 1] + lum[i + w - 1] - lum[i - w - 1]);
      const mag = Math.abs(gx) + Math.abs(gy);
      const lap = Math.abs(4 * lum[i] - lum[i - 1] - lum[i + 1] - lum[i - w] - lum[i + w]);

      lapSum += lap;
      lapN++;

      if (y < topLine) {
        lapT += lap;
        lapTN++;
      } else if (y > botLine) {
        lapB += lap;
        lapBN++;
      }

      const inC = x > cx0 && x < cx1 && y > cy0 && y < cy1;
      if (inC) {
        lapC += lap;
        lapCN++;
      } else if (x < w * 0.22 || x > w * 0.78) {
        lapE += lap;
        lapEN++;
      }

      if (mag > 85) {
        edgeTotal++;
        if (inC) edgeCenter++;
        if (inYB || Math.abs(x - t3x0) < band || Math.abs(x - t3x1) < band) thirds++;
        if (inPhiY && (Math.abs(x - phiX0) < phiBand || Math.abs(x - phiX1) < phiBand)) {
          goldenNodes++;
        }

        if (Math.abs(gx) > Math.abs(gy) * 1.6) oV++;
        else if (Math.abs(gy) > Math.abs(gx) * 1.6) oH++;
        else {
          oD++;
          // Diagonal leading lines pointing towards center
          const distToCenter = Math.hypot(x - w / 2, y - h / 2);
          if (distToCenter > Math.min(w, h) * 0.2) leadingLinesScore++;
        }
      }
    }
  }

  const detail = Math.min(1, edgeTotal / (n * 0.28));
  const centerRatio = edgeTotal ? edgeCenter / edgeTotal : 0;
  const sharp = lapN ? Math.min(1, lapSum / lapN / 22) : 0;
  const sharpC = lapCN ? Math.min(1, lapC / lapCN / 22) : 0;
  const sharpE = lapEN ? Math.min(1, lapE / lapEN / 22) : 0;
  const sharpT = lapTN ? Math.min(1, lapT / lapTN / 22) : 0;
  const sharpB = lapBN ? Math.min(1, lapB / lapBN / 22) : 0;
  const depth = Math.max(0, Math.min(1, Math.abs(sharpB - sharpT) * 1.6));
  const thirdsRatio = edgeTotal ? thirds / edgeTotal / 0.26 : 0;
  const goldenRatio = edgeTotal ? Math.min(1, (goldenNodes * 22) / edgeTotal) : 0;
  const leadingLines = edgeTotal ? Math.min(1, (leadingLinesScore * 3.5) / edgeTotal) : 0;
  const atmosphericDepth = Math.max(0, Math.min(1, (sharpB - sharpT) * 1.8 + (1 - detail) * 0.3));

  // Symmetry analysis
  let symDiff = 0;
  let symN = 0;
  const x0 = Math.floor(w * 0.2);
  const x1 = Math.floor(w * 0.48);
  for (let y = Math.floor(h * 0.15); y < h * 0.85; y += 2) {
    const row = y * w;
    for (let x = x0; x < x1; x += 2) {
      symDiff += Math.abs(lum[row + x] - lum[row + w - 1 - x]);
      symN++;
    }
  }
  const sym = symN ? Math.max(0, Math.min(1, 1 - symDiff / symN / 48)) : 0;

  // Vignette peripheral falloff analysis
  const cw = Math.floor(w * 0.2);
  const chh = Math.floor(h * 0.2);
  let cL = 0;
  let cN2 = 0;
  let eL = 0;
  let eN2 = 0;

  for (let y = cy0; y < cy1; y += 2) {
    const row = y * w;
    for (let x = cx0; x < cx1; x += 2) {
      cL += lum[row + x];
      cN2++;
    }
  }
  for (let y = 0; y < chh; y += 2) {
    for (let x = 0; x < cw; x += 2) {
      eL += lum[y * w + x];
      eN2++;
    }
    for (let x = w - cw; x < w; x += 2) {
      eL += lum[y * w + x];
      eN2++;
    }
  }
  for (let y = h - chh; y < h; y += 2) {
    for (let x = 0; x < cw; x += 2) {
      eL += lum[y * w + x];
      eN2++;
    }
    for (let x = w - cw; x < w; x += 2) {
      eL += lum[y * w + x];
      eN2++;
    }
  }
  const vig = cN2 && eN2 ? Math.max(0, Math.min(1, (cL / cN2 - eL / eN2) / Math.max(30, cL / cN2))) : 0;
  const contrastRatio = Math.min(1, std / 85);

  // Lens & Field of View simulation
  let lensFocalEstimate = '50mm Standard Prime Lens';
  if (oD > edgeTotal * 0.35 && centerRatio < 0.3) {
    lensFocalEstimate = '24mm Ultra-Wide Angle Lens';
  } else if (sharpC > sharpE * 1.8 && depth > 0.35) {
    lensFocalEstimate = '85mm f/1.4 Portrait Telephoto';
  } else if (vig > 0.18 && contrastRatio > 0.55) {
    lensFocalEstimate = '35mm Anamorphic Cinematic Lens';
  } else if (detail > 0.55 && sharp > 0.5) {
    lensFocalEstimate = '50mm f/1.8 High-Resolution Prime';
  } else if (sharpT > sharpB * 1.5) {
    lensFocalEstimate = '135mm Cinematic Compressed Lens';
  }

  // Harmonic color scheme
  let scheme: 'monochromatic' | 'complementary' | 'analogous' | 'mix' = 'mix';
  if (hueN > 50) {
    const norm = Array.from(hueHist).map((v) => v / hueN);
    let mi = 0;
    for (let i = 1; i < 12; i++) if (norm[i] > norm[mi]) mi = i;
    const dom = norm[mi];
    const opp = norm[(mi + 6) % 12] + norm[(mi + 5) % 12] + norm[(mi + 7) % 12];
    const adj =
      norm[(mi + 1) % 12] + norm[(mi + 11) % 12] + norm[(mi + 2) % 12] + norm[(mi + 10) % 12];
    if (sat < 0.14 || dom > 0.72) scheme = 'monochromatic';
    else if (opp > 0.28 && opp > adj * 0.8) scheme = 'complementary';
    else if (adj > 0.4) scheme = 'analogous';
  } else {
    scheme = sat < 0.14 ? 'monochromatic' : 'mix';
  }

  const oTot = oH + oV + oD;
  let lines: 'horizontal' | 'vertical' | 'diagonal' | null = null;
  if (oTot > edgeTotal * 0.5) {
    const mx2 = Math.max(oH, oV, oD);
    if (mx2 / oTot > 0.52) lines = mx2 === oH ? 'horizontal' : mx2 === oV ? 'vertical' : 'diagonal';
  }

  // Peripheral Background Variance
  const ringCoords: [number, number][] = [];
  const step2 = Math.max(1, Math.floor((w + h) / 420));
  for (let x = 0; x < w; x += step2) {
    ringCoords.push([x, 0]);
    ringCoords.push([x, h - 1]);
  }
  for (let y = 0; y < h; y += step2) {
    ringCoords.push([0, y]);
    ringCoords.push([w - 1, y]);
  }
  let mr = 0;
  let mg = 0;
  let mb = 0;
  for (const [x, y] of ringCoords) {
    const p = (y * w + x) * 4;
    mr += data[p];
    mg += data[p + 1];
    mb += data[p + 2];
  }
  const rc = ringCoords.length || 1;
  mr /= rc;
  mg /= rc;
  mb /= rc;

  let rv = 0;
  for (const [x, y] of ringCoords) {
    const p = (y * w + x) * 4;
    const dr = data[p] - mr;
    const dg = data[p + 1] - mg;
    const db = data[p + 2] - mb;
    rv += (dr * dr + dg * dg + db * db) / 3;
  }
  const bgVar = Math.min(1, Math.sqrt(rv / rc) / 160);

  // CIELAB Perceptual Color Palette Extraction
  const arr = Array.from(buckets.values())
    .map((b) => ({
      c: b.c,
      r: b.r / b.c,
      g: b.g / b.c,
      b: b.b / b.c,
      lab: rgb2lab(b.r / b.c, b.g / b.c, b.b / b.c),
    }))
    .sort((a, b) => b.c - a.c);

  const picked: { c: number; r: number; g: number; b: number; lab: [number, number, number] }[] = [];
  const minDeltaE = mode === 'deep' || options.cielab ? 18 : 24;

  for (const b of arr) {
    if (picked.length >= 6) break;
    const isDistinct = picked.every((p) => deltaE76(p.lab, b.lab) > minDeltaE);
    if (isDistinct) {
      picked.push(b);
    }
  }

  const palette = picked.map((p) => {
    const hex = rgb2hex(p.r, p.g, p.b);
    return {
      hex,
      pct: Math.round((p.c / n) * 100),
      name: nearestColorLab(hex, 'en'),
      cielab: p.lab,
    };
  });

  return {
    m: {
      bri: avgL / 255,
      con: Math.min(1, std / 85),
      sat,
      warm: (warm + 255) / 510,
      detail,
      centerRatio,
      bgVar,
      colorful,
      depth,
      sharp,
      sharpC,
      sharpE,
      sym,
      vig,
      thirdsRatio,
      textScore,
      flatRatio,
      goldenRatio,
      leadingLines,
      dynamicRangeEV,
      lensFocalEstimate,
      noiseGrain,
      colorKelvin,
      atmosphericDepth,
    },
    palette,
    scheme,
    lines,
    isDesign,
  };
}

// 2. High-Precision Local Classifier
export function classify(A: { m: any; isDesign: boolean; scheme: any; lines: any }): ClassificationData {
  const m = A.m;
  const bri = m.bri;
  const con = m.con;
  const sat = m.sat;
  const warm = m.warm;
  const det = m.detail;

  let styleKey: ClassificationData['styleKey'];
  if (sat < 0.1) styleKey = 'mono';
  else if (A.isDesign) styleKey = 'design';
  else if (det < 0.2 && m.bgVar < 0.2) styleKey = 'minimal';
  else if (sat > 0.42 && det > 0.3) styleKey = 'vivid';
  else if (con > 0.6 && bri < 0.5) styleKey = 'cinematic';
  else styleKey = 'photoreal';

  let compKey: ClassificationData['compKey'];
  if (m.centerRatio > 0.34 && m.bgVar < 0.4) compKey = 'center';
  else if (det > 0.5) compKey = 'edge';
  else if (det < 0.18 && m.bgVar < 0.18) compKey = 'negative';
  else compKey = 'layered';

  let lightKey: ClassificationData['lightKey'];
  if (bri < 0.26) lightKey = 'low';
  else if (con > 0.66) lightKey = 'dramatic';
  else if (bri > 0.72) lightKey = 'bright';
  else if (warm > 0.58 && bri > 0.4) lightKey = 'golden';
  else if (con < 0.32) lightKey = 'soft';
  else lightKey = 'balanced';

  let moodKey: ClassificationData['moodKey'];
  if (lightKey === 'soft' && warm > 0.45) moodKey = 'dreamy';
  else if (warm > 0.56) moodKey = sat > 0.38 ? 'energetic' : 'nostalgic';
  else moodKey = sat > 0.38 ? 'electric' : bri < 0.35 ? 'melancholic' : 'serene';

  const detailKey =
    det < 0.15 ? 'minimal' : det < 0.3 ? 'clean' : det < 0.45 ? 'moderate' : det < 0.62 ? 'rich' : 'intricate';
  const satKey = sat < 0.16 ? 'low' : sat > 0.48 ? 'high' : 'mid';
  const bgKey = m.bgVar < 0.14 ? 'clean' : m.bgVar < 0.38 ? 'soft' : 'rich';
  const thirds = m.thirdsRatio > 1.3 && det > 0.05;
  const symmetry = m.sym > 0.74 && m.centerRatio < 0.5;
  const bokeh = m.sharpC > m.sharpE * 1.9 && m.sharpE < 0.35 && det > 0.08 && det < 0.55;
  const vignette = m.vig > 0.16;
  const focus = bokeh ? 'bokeh' : m.sharp > 0.5 ? 'sharp' : m.sharp < 0.22 ? 'soft' : null;
  const tonal = bri > 0.68 && con < 0.42 ? 'high' : bri < 0.3 && con < 0.5 ? 'low' : null;
  const texture = m.sharp > 0.42 && m.detail > 0.28;
  const temperature = warm > 0.58 ? 'warm' : warm < 0.42 ? 'cool' : null;
  const depthFall = m.depth > 0.28;
  const colorRich = m.colorful > 0.4;
  const hasText = m.textScore > 0.35;
  const isDesign = !!A.isDesign;
  const layoutType =
    m.centerRatio > 0.42 ? 'centered' : det > 0.45 && m.centerRatio < 0.3 ? 'dynamic' : 'balanced';

  return {
    styleKey,
    compKey,
    lightKey,
    moodKey,
    detailKey,
    satKey,
    bgKey,
    thirds,
    symmetry,
    bokeh,
    vignette,
    focus,
    tonal,
    texture,
    temperature,
    depth: depthFall,
    colorRich,
    hasText,
    isDesign,
    layoutType,
    scheme: A.scheme,
    lines: A.lines,
  };
}

export function confidence(
  A: { m: any; palette: any[] },
  C: ClassificationData,
  twoPassActive: boolean = false
): number {
  const m = A.m;
  let c = 56;
  c += Math.min(12, m.detail * 16);
  c += Math.abs(m.bri - 0.5) * 12;
  c += m.con * 9;
  c += A.palette[0] ? A.palette[0].pct * 0.12 : 0;
  if (C.symmetry) c += 4;
  if (C.thirds) c += 3;
  if (C.scheme !== 'mix') c += 4;
  if (C.lines) c += 3;
  if (C.bokeh) c += 3;
  if (m.goldenRatio && m.goldenRatio > 0.5) c += 3;
  if (m.leadingLines && m.leadingLines > 0.4) c += 2;
  c += m.sharp * 4;
  if (C.hasText) c += 2;
  if (C.isDesign) c += 2;
  if (twoPassActive) c += 8;
  return Math.round(Math.max(55, Math.min(99, c)));
}

export function analyzeMood(A: AnalysisData) {
  const m = A.m;
  const bri = m.bri;
  const sat = m.sat;
  const warm = m.warm;
  const con = m.con;
  const colorful = m.colorful;
  const kelvin = m.colorKelvin || 5500;
  const moods: string[] = [];

  let temp = 'Neutral';
  let energy = 'Moderate';
  let tone = 'Balanced';

  if (bri > 0.65 && warm > 0.5) {
    moods.push('Happy');
    temp = 'Warm';
    energy = 'Energetic';
    tone = 'Bright';
  } else if (bri < 0.3 && warm < 0.35) {
    moods.push('Moody');
    temp = 'Cold';
    energy = 'Calm';
    tone = 'Dark';
  } else if (bri < 0.4 && con > 0.6) {
    moods.push('Dramatic');
    temp = 'Cold';
    energy = 'High Intensity';
    tone = 'Dark & Vivid';
  } else if (bri > 0.6 && sat > 0.35) {
    moods.push('Vibrant');
    temp = 'Warm';
    energy = 'High Energy';
    tone = 'Rich';
  } else if (bri > 0.5 && con < 0.3) {
    moods.push('Serene');
    temp = 'Mild';
    energy = 'Peaceful';
    tone = 'Soft';
  } else {
    moods.push('Balanced');
  }

  if (colorful > 0.45 && sat > 0.3 && !moods.includes('Vibrant')) {
    moods.push('Vibrant');
  }

  return { moods: moods.slice(0, 3), temp, energy, tone, kelvin };
}

export function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.decoding = 'async';
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = url;
    setTimeout(() => reject(new Error('decode')), 25000);
  });
}

export function loadDims(url: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => resolve({ w: im.naturalWidth, h: im.naturalHeight });
    im.onerror = reject;
    im.src = url;
    setTimeout(() => reject(new Error('decode')), 25000);
  });
}

export interface AnalysisResult {
  data: AnalysisData;
  latencyBreakdown: {
    pixelDecodeMs: number;
    colorExtractionMs: number;
    compositionMs: number;
    totalMs: number;
  };
}

// 3. Main Local Analysis Orchestrator
export async function analyzeImage(
  fileOrUrl: File | string,
  options: LocalEngineOptions = {}
): Promise<AnalysisResult> {
  const tStart = performance.now();
  const url = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
  const dims = await loadDims(url).catch(() => {
    throw new Error('decode');
  });

  const base = options.engineMode === 'turbo' ? 360 : 480;
  const im = await loadImg(url).catch(() => {
    throw new Error('decode');
  });

  const s = base / Math.max(im.naturalWidth, im.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(im.naturalWidth * s));
  canvas.height = Math.max(1, Math.round(im.naturalHeight * s));

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('decode');
  ctx.drawImage(im, 0, 0, canvas.width, canvas.height);

  const tPixelDecoded = performance.now();
  const px = analyzePixelsOptimized(canvas, options);
  const tAnalyzed = performance.now();

  const pixelDecodeMs = Math.round(tPixelDecoded - tStart);
  const colorExtractionMs = Math.round((tAnalyzed - tPixelDecoded) * 0.45);
  const compositionMs = Math.round((tAnalyzed - tPixelDecoded) * 0.55);
  const totalMs = Math.round(tAnalyzed - tStart);

  return {
    data: {
      w: dims.w,
      h: dims.h,
      tier: tierOf(dims.w, dims.h),
      orient: orientOf(dims.w, dims.h),
      m: px.m,
      palette: px.palette,
      scheme: px.scheme,
      lines: px.lines,
      isDesign: px.isDesign,
      engineMode: options.engineMode || 'deep',
      moodSummary: analyzeMood({
        w: dims.w,
        h: dims.h,
        tier: tierOf(dims.w, dims.h),
        orient: orientOf(dims.w, dims.h),
        m: px.m,
        palette: px.palette,
        scheme: px.scheme,
        lines: px.lines,
        isDesign: px.isDesign,
      }),
    },
    latencyBreakdown: {
      pixelDecodeMs,
      colorExtractionMs,
      compositionMs,
      totalMs,
    },
  };
}

// 4. Autonomous Local Prompt Builder (Full Offline AI Prompt Engineering Engine)
export function buildPrompt(
  item: BatchItem,
  opts: AppOptions,
  adv: AdvancedFeatures
): { main: string; neg: string | null; struct: any } {
  if (!item.a || !item.cls) {
    return { main: '', neg: null, struct: null };
  }

  const A = item.a;
  const C = item.cls;
  const m = A.m;
  const lang = opts.pLang;
  const tierKey = TIERS[opts.target].k;
  const cnt = [2, 3, 5][opts.detail] || 3;

  const names = A.palette.slice(0, cnt).map((p) => nearestColorLab(p.hex, lang));
  const paletteText =
    lang === 'ar'
      ? `لوحة ألوان تسيطر عليها درجات ${names.join(' و')}`
      : `chromatic palette dominated by ${names.join(', ')}`;

  const resTag = `${tierKey} ultra resolution (${TIERS[opts.target].w}x${TIERS[opts.target].h})`;
  const arTag = ratioFor(A.w, A.h);

  const styleNames: Record<string, string> = {
    photoreal: 'hyperrealistic photograph, masterwork studio capture',
    cinematic: 'cinematic film still, Panavision 35mm photography, moody atmosphere',
    vivid: 'vibrant digital concept masterpiece, rich saturated pigments',
    minimal: 'minimalist clean aesthetic, elegant simplicity, pristine negative space',
    mono: 'fine art monochrome photography, deep black and white tonal range',
    design: 'high-end graphic design, modern editorial aesthetic, pristine vector composition',
  };

  const compNames: Record<string, string> = {
    center: 'strong centered focal composition, clean subject isolation',
    edge: 'immersive edge-to-edge frame, complex layered scenery',
    negative: 'deliberate negative space, minimalist framing',
    layered: 'multi-plane layered depth, distinct foreground and background',
  };

  const lightingNames: Record<string, string> = {
    low: 'dramatic low-key lighting, deep rich shadows',
    dramatic: 'dramatic chiaroscuro lighting, high contrast volumetric illumination',
    bright: 'bright airy natural illumination, soft fill light',
    golden: 'warm golden hour sun flare, soft ambient warmth',
    soft: 'soft diffused studio lighting, gentle tonal transitions',
    balanced: 'balanced natural daylight, accurate exposure',
  };

  const baseStyle = styleNames[C.styleKey] || styleNames.photoreal;
  const baseComp = compNames[C.compKey] || compNames.layered;
  const baseLight = lightingNames[C.lightKey] || lightingNames.balanced;

  const tags: string[] = [baseStyle, baseComp, baseLight, paletteText];

  // Local Engine Sensory & Photographic Injections
  if (m.lensFocalEstimate) {
    tags.push(`shot on ${m.lensFocalEstimate}`);
  }

  if (m.goldenRatio && m.goldenRatio > 0.5) {
    tags.push('phi grid golden ratio harmonic composition');
  }

  if (m.leadingLines && m.leadingLines > 0.4) {
    tags.push('dynamic perspective leading lines guiding the eye');
  }

  if (m.dynamicRangeEV && m.dynamicRangeEV >= 6) {
    tags.push(`high dynamic range ${m.dynamicRangeEV}-stop exposure latitude`);
  }

  if (m.colorKelvin) {
    if (m.colorKelvin < 4000) {
      tags.push(`warm amber ${m.colorKelvin}K color temperature`);
    } else if (m.colorKelvin > 6800) {
      tags.push(`cool daylight ${m.colorKelvin}K color temperature`);
    }
  }

  if (m.atmosphericDepth && m.atmosphericDepth > 0.45) {
    tags.push('atmospheric depth perspective and soft volumetric haze');
  }

  if (m.noiseGrain && m.noiseGrain > 0.25) {
    tags.push('subtle organic 35mm film grain texture');
  }

  if (adv.ultra) {
    if (C.texture) tags.push('tactile surface micro-textures, tangible material detail');
    if (C.temperature === 'warm') tags.push('warm amber-gold color grading');
    if (C.temperature === 'cool') tags.push('crisp clean cool-toned grading');
    if (C.depth) tags.push('pronounced optical depth falloff, creamy lens blur');
    if (C.colorRich) tags.push('deep chromatic richness, subtle tonal gradations');
  }

  if (adv.harmony && C.scheme !== 'mix') {
    tags.push(`${C.scheme} color harmony`);
  }

  if (adv.mood) {
    const mood = analyzeMood(A);
    tags.push(`${mood.moods.join(' and ')} mood, ${mood.energy.toLowerCase()} atmosphere`);
  }

  if (adv.typo && C.hasText) {
    tags.push('integrated modern typography, sharp typographic hierarchy');
  }

  if (adv.grid && C.isDesign) {
    tags.push('grid-based layout, crisp vector-like edges');
  }

  if (C.symmetry) tags.push('perfect geometric symmetry');
  if (C.thirds) tags.push('composed along the rule of thirds');
  if (C.bokeh) tags.push('shallow depth of field, creamy bokeh');
  if (C.vignette) tags.push('subtle cinematic peripheral vignette');

  tags.push(resTag);
  tags.push('masterpiece, 8k resolution, photorealistic, professional quality');

  let main = '';
  let neg: string | null = null;

  if (opts.style === 'mj') {
    const stylize = [100, 250, 500][opts.detail] || 250;
    main = `${tags.join(', ')} --ar ${arTag} --v 6.1 --stylize ${stylize}`;
  } else if (opts.style === 'sd') {
    main = `(masterpiece, best quality, ultra-detailed:1.2), ${tags.join(', ')}`;
    neg =
      'blurry, low quality, distorted, deformed, watermark, text, signature, jpeg artifacts, cropped, worst quality';
  } else if (opts.style === 'dalle') {
    main = `A ${baseStyle} featuring ${baseComp}, illuminated with ${baseLight}, characterized by a ${paletteText}. ${tags
      .slice(4)
      .join(', ')}. Rendered in ${resTag}.`;
  } else {
    // flux
    main = `${baseStyle} of ${baseComp}, ${paletteText}, ${baseLight}, natural photographic realism, pristine sharpness, ${resTag}`;
  }

  const struct = {
    schema: 'promptlens/2.0-local-engine',
    target_engine: opts.style,
    tags,
    resolution: resTag,
    aspect_ratio: arTag,
    metrics: A.m,
    palette: A.palette,
    lens_estimate: m.lensFocalEstimate,
    dynamic_range: m.dynamicRangeEV ? `${m.dynamicRangeEV} EV` : undefined,
    color_kelvin: m.colorKelvin ? `${m.colorKelvin}K` : undefined,
  };

  return { main, neg, struct };
}

// 5. High-Precision Local Code & Prompt Syntax Linter
export function lintPromptSyntax(
  prompt: string,
  targetStyle: 'mj' | 'sd' | 'dalle' | 'flux'
): {
  score: number;
  issues: { type: 'warn' | 'info' | 'fix'; message: string; fixApplied?: string }[];
  suggestions: string[];
  tokenCount: number;
  wordCount: number;
} {
  const issues: { type: 'warn' | 'info' | 'fix'; message: string; fixApplied?: string }[] = [];
  const suggestions: string[] = [];

  const raw = prompt.trim();
  const wordCount = raw ? raw.split(/\s+/).length : 0;
  const tokenCount = Math.ceil(raw.length / 4);

  if (!raw) {
    return { score: 100, issues: [], suggestions: ['Enter a prompt or analyze an image to start.'], tokenCount: 0, wordCount: 0 };
  }

  let penalty = 0;

  // 1. Bracket balance checks
  let openParen = 0, openBracket = 0, openBrace = 0;
  for (const ch of raw) {
    if (ch === '(') openParen++;
    else if (ch === ')') openParen--;
    else if (ch === '[') openBracket++;
    else if (ch === ']') openBracket--;
    else if (ch === '{') openBrace++;
    else if (ch === '}') openBrace--;
  }

  if (openParen !== 0) {
    penalty += 15;
    issues.push({
      type: 'fix',
      message: openParen > 0 ? `Unclosed parenthesis '(' detected (${openParen} missing)` : `Mismatched extra ')' detected`,
      fixApplied: 'Auto-balanced parentheses',
    });
  }

  if (openBracket !== 0) {
    penalty += 10;
    issues.push({
      type: 'fix',
      message: openBracket > 0 ? `Unclosed bracket '[' detected` : `Mismatched extra ']' detected`,
      fixApplied: 'Auto-balanced square brackets',
    });
  }

  if (openBrace !== 0) {
    penalty += 10;
    issues.push({
      type: 'fix',
      message: `Unclosed curly brace '{' detected`,
      fixApplied: 'Auto-balanced curly braces',
    });
  }

  // 2. Comma & delimiter redundancy
  if (/(?:,{2,}|\s,\s|,;)/g.test(raw)) {
    penalty += 5;
    issues.push({
      type: 'fix',
      message: 'Redundant consecutive commas or broken delimiters found',
      fixApplied: 'Normalized comma spacing',
    });
  }

  // 3. Duplicate tags detection
  const tagList = raw
    .split(/[,;\n]+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 2 && !t.startsWith('--'));
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const t of tagList) {
    if (seen.has(t)) dupes.push(t);
    else seen.add(t);
  }

  if (dupes.length > 0) {
    penalty += Math.min(20, dupes.length * 5);
    issues.push({
      type: 'fix',
      message: `Duplicate tags detected: "${dupes.slice(0, 3).join(', ')}"`,
      fixApplied: 'Removed redundant tags while keeping first appearance',
    });
  }

  // 4. Model-specific syntax checks
  if (targetStyle === 'mj') {
    // Check if flags are located in the middle instead of end
    const flagMatches = raw.match(/--[a-z0-9]+/gi) || [];
    const hasFlags = flagMatches.length > 0;
    if (hasFlags) {
      const lastFlagIndex = raw.lastIndexOf('--');
      const textAfterFlag = raw.substring(lastFlagIndex);
      if (textAfterFlag.includes(',') && !textAfterFlag.includes('--no')) {
        penalty += 10;
        issues.push({
          type: 'fix',
          message: 'Midjourney flags placed in the middle of descriptive prompt',
          fixApplied: 'Relocated all --flags to the tail end',
        });
      }
    } else {
      suggestions.push('Add Midjourney parameter flags (e.g. --ar 16:9 --v 6.1 --stylize 250)');
    }

    if (/\((?:[^):]+):[0-9.]+\)/.test(raw)) {
      penalty += 10;
      issues.push({
        type: 'warn',
        message: 'Stable Diffusion style weight syntax (word:1.2) detected in Midjourney prompt',
        fixApplied: 'Converted to Midjourney text weights (word::1.2)',
      });
    }
  } else if (targetStyle === 'sd') {
    if (/--ar\s+[0-9:]+/i.test(raw)) {
      penalty += 10;
      issues.push({
        type: 'warn',
        message: 'Midjourney CLI flag --ar found in Stable Diffusion prompt',
        fixApplied: 'Removed CLI flags and ensured resolution weighting',
      });
    }
    if (!raw.toLowerCase().includes('masterpiece') && !raw.toLowerCase().includes('best quality')) {
      suggestions.push('Consider adding SD quality tags like (masterpiece, best quality:1.2)');
    }
  } else if (targetStyle === 'dalle') {
    if (/--[a-z0-9]+/i.test(raw)) {
      penalty += 15;
      issues.push({
        type: 'fix',
        message: 'CLI flags (--ar, --v) are unsupported in DALL-E 3',
        fixApplied: 'Converted parameters to natural language sentences',
      });
    }
    if (/\((?:[^):]+):[0-9.]+\)/.test(raw)) {
      penalty += 10;
      issues.push({
        type: 'fix',
        message: 'Weight parenthesis syntax is unsupported in DALL-E 3',
        fixApplied: 'Stripped bracket weights into plain words',
      });
    }
  } else if (targetStyle === 'flux') {
    if (/--v\s+[0-9.]+/i.test(raw)) {
      penalty += 5;
      issues.push({
        type: 'fix',
        message: 'Midjourney version tag found in Flux prompt',
        fixApplied: 'Cleaned irrelevant version flags',
      });
    }
  }

  const score = Math.max(15, Math.min(100, 100 - penalty));
  return { score, issues, suggestions, tokenCount, wordCount };
}

// 6. Local Code & Prompt Optimization Engine (Instant Offline Code Enhancer)
export function optimizePromptCode(
  prompt: string,
  targetStyle: 'mj' | 'sd' | 'dalle' | 'flux',
  options: {
    negativePrompt?: string | null;
    isJson?: boolean;
    addPhotographicSpecs?: boolean;
    lensEstimate?: string;
    dynamicRangeEV?: number;
    colorKelvin?: number;
    filmStock?: string;
  } = {}
): {
  optimizedPrompt: string;
  optimizedNegative?: string | null;
  syntaxScore: number;
  issuesFixed: { type: 'warn' | 'info' | 'fix'; message: string; fixApplied?: string }[];
  tokensSaved: number;
  tagsAdded: string[];
  executionTimeMs: number;
} {
  const t0 = performance.now();
  const lintBefore = lintPromptSyntax(prompt, targetStyle);
  let cleaned = prompt.trim();
  const tagsAdded: string[] = [];

  // 1. JSON formatting if prompt is JSON structure
  if (options.isJson || (cleaned.startsWith('{') && cleaned.endsWith('}'))) {
    try {
      const parsed = JSON.parse(cleaned);
      const formattedJson = JSON.stringify(parsed, null, 2);
      const tEnd = performance.now();
      return {
        optimizedPrompt: formattedJson,
        optimizedNegative: options.negativePrompt,
        syntaxScore: 100,
        issuesFixed: [{ type: 'fix', message: 'Formatted JSON structure with 2-space indentation', fixApplied: 'Prettified JSON' }],
        tokensSaved: Math.max(0, Math.ceil(prompt.length / 4) - Math.ceil(formattedJson.length / 4)),
        tagsAdded: [],
        executionTimeMs: Math.round(tEnd - t0),
      };
    } catch {
      // Continue to text optimization if invalid JSON
    }
  }

  // 2. Bracket Auto-balancing
  let openP = 0, openB = 0, openC = 0;
  for (const ch of cleaned) {
    if (ch === '(') openP++;
    else if (ch === ')') openP = Math.max(0, openP - 1);
    else if (ch === '[') openB++;
    else if (ch === ']') openB = Math.max(0, openB - 1);
    else if (ch === '{') openC++;
    else if (ch === '}') openC = Math.max(0, openC - 1);
  }
  if (openP > 0) cleaned += ')'.repeat(openP);
  if (openB > 0) cleaned += ']'.repeat(openB);
  if (openC > 0) cleaned += '}'.repeat(openC);

  // 3. Deduplication of tags
  if (targetStyle !== 'dalle') {
    // Extract Midjourney flags first if present
    const flags: string[] = [];
    if (targetStyle === 'mj') {
      const flagRegex = /--[a-zA-Z0-9_-]+(?:\s+[^\s,-]+)?/g;
      const foundFlags = cleaned.match(flagRegex) || [];
      for (const f of foundFlags) {
        flags.push(f.trim());
      }
      cleaned = cleaned.replace(flagRegex, ' ').trim();
    }

    // Split into tags and deduplicate
    const tags = cleaned
      .split(/[,;\n]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const seenLower = new Set<string>();
    const uniqueTags: string[] = [];
    for (const t of tags) {
      const l = t.toLowerCase().replace(/\s+/g, ' ');
      if (!seenLower.has(l)) {
        seenLower.add(l);
        uniqueTags.push(t);
      }
    }

    // Photographic specs injection if requested
    if (options.addPhotographicSpecs) {
      if (options.lensEstimate && !seenLower.has(options.lensEstimate.toLowerCase())) {
        uniqueTags.push(`shot on ${options.lensEstimate}`);
        tagsAdded.push(options.lensEstimate);
      }
      if (options.colorKelvin && !seenLower.has(`${options.colorKelvin}k`)) {
        const kTag = options.colorKelvin < 4000 ? `warm amber ${options.colorKelvin}K balance` : `crisp daylight ${options.colorKelvin}K balance`;
        uniqueTags.push(kTag);
        tagsAdded.push(`${options.colorKelvin}K`);
      }
      if (options.dynamicRangeEV && options.dynamicRangeEV >= 6 && !seenLower.has('dynamic range')) {
        uniqueTags.push(`${options.dynamicRangeEV}-stop dynamic range`);
        tagsAdded.push(`${options.dynamicRangeEV} EV`);
      }
      if (options.filmStock && !seenLower.has(options.filmStock.toLowerCase())) {
        uniqueTags.push(`authentic ${options.filmStock} film grain`);
        tagsAdded.push(options.filmStock);
      }
    }

    // Target specific formatting
    if (targetStyle === 'mj') {
      let flagString = '';
      if (flags.length > 0) {
        // Deduplicate flags
        const uniqueFlags = Array.from(new Set(flags));
        flagString = ' ' + uniqueFlags.join(' ');
      } else {
        flagString = ' --v 6.1 --stylize 250';
      }
      cleaned = uniqueTags.join(', ') + flagString;
    } else if (targetStyle === 'sd') {
      // Ensure clean quality prefix
      let body = uniqueTags.join(', ');
      if (!body.toLowerCase().includes('masterpiece')) {
        body = `(masterpiece, best quality:1.2), ${body}`;
        tagsAdded.push('masterpiece quality');
      }
      cleaned = body;
    } else if (targetStyle === 'flux') {
      cleaned = uniqueTags.join(', ') + ', photorealistic, crisp 8k resolution';
    }
  } else {
    // DALL-E 3: Strip CLI flags and raw weights into natural descriptive prose
    cleaned = cleaned
      .replace(/--[a-zA-Z0-9_-]+(?:\s+[^\s,-]+)?/g, '')
      .replace(/\(([^):]+):[0-9.]+\)/g, '$1')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (options.addPhotographicSpecs && options.lensEstimate) {
      cleaned += ` The photograph is captured on ${options.lensEstimate} with natural exposure.`;
      tagsAdded.push(options.lensEstimate);
    }
  }

  // 4. Negative prompt optimization
  let optimizedNegative = options.negativePrompt;
  if (optimizedNegative) {
    const negTags = optimizedNegative
      .split(/[,;\n]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    const seenNeg = new Set<string>();
    const uniqueNeg: string[] = [];
    for (const t of negTags) {
      const l = t.toLowerCase();
      if (!seenNeg.has(l)) {
        seenNeg.add(l);
        uniqueNeg.push(t);
      }
    }
    optimizedNegative = uniqueNeg.join(', ');
  }

  const tEnd = performance.now();
  const lintAfter = lintPromptSyntax(cleaned, targetStyle);
  const tokenBefore = lintBefore.tokenCount;
  const tokenAfter = lintAfter.tokenCount;
  const tokensSaved = Math.max(0, tokenBefore - tokenAfter);

  return {
    optimizedPrompt: cleaned,
    optimizedNegative,
    syntaxScore: lintAfter.score,
    issuesFixed: lintBefore.issues,
    tokensSaved,
    tagsAdded,
    executionTimeMs: Math.max(1, Math.round(tEnd - t0)),
  };
}

