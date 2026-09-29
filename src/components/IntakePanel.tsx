import React, { useRef, useState, useEffect } from 'react';
import { Upload, Plus, Link, Copy, Eye, Sparkles } from 'lucide-react';
import { BatchItem, AdvancedFeatures } from '../types';
import { SAMPLES } from '../utils/constants';
import { I18N } from '../utils/i18n';

interface IntakePanelProps {
  item: BatchItem | null;
  lang: 'en' | 'ar' | 'fr' | 'es';
  adv: AdvancedFeatures;
  onFilesSelected: (files: FileList | File[]) => void;
  onUrlLoad: (url: string) => void;
  onSampleSelect: (sampleUrl: string) => void;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
}

export const IntakePanel: React.FC<IntakePanelProps> = ({
  item,
  lang,
  adv,
  onFilesSelected,
  onUrlLoad,
  onSampleSelect,
  onToast,
}) => {
  const t = I18N[lang].s;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [overlayMode, setOverlayMode] = useState<'edges' | 'regions' | 'grid' | 'golden' | 'depth' | 'none'>('edges');
  const [overlayOpacity, setOverlayOpacity] = useState(60);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render visual overlay when item or mode changes
  useEffect(() => {
    if (!item?.url || overlayMode === 'none' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const alpha = overlayOpacity / 100;

      if (overlayMode === 'edges') {
        const gray = new Float32Array(canvas.width * canvas.height);
        for (let i = 0; i < gray.length; i++) {
          const idx = i * 4;
          gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        }
        for (let y = 1; y < canvas.height - 1; y++) {
          for (let x = 1; x < canvas.width - 1; x++) {
            const idx = y * canvas.width + x;
            const gx = gray[idx + 1] - gray[idx - 1];
            const gy = gray[idx + canvas.width] - gray[idx - canvas.width];
            const mag = Math.sqrt(gx * gx + gy * gy);
            if (mag > 30) {
              const pidx = idx * 4;
              data[pidx] = 255;
              data[pidx + 1] = 180;
              data[pidx + 2] = 84;
              data[pidx + 3] = Math.min(255, data[pidx + 3] + 130 * alpha);
            }
          }
        }
        ctx.putImageData(imageData, 0, 0);
      } else if (overlayMode === 'regions') {
        const step = Math.max(3, Math.floor(Math.min(canvas.width, canvas.height) / 60));
        for (let y = 0; y < canvas.height - step; y += step) {
          for (let x = 0; x < canvas.width - step; x += step) {
            let r = 0,
              g = 0,
              b = 0,
              count = 0;
            for (let dy = 0; dy < step; dy++) {
              for (let dx = 0; dx < step; dx++) {
                const idx = ((y + dy) * canvas.width + (x + dx)) * 4;
                r += data[idx];
                g += data[idx + 1];
                b += data[idx + 2];
                count++;
              }
            }
            r /= count;
            g /= count;
            b /= count;
            ctx.strokeStyle = `rgba(55, 214, 192, ${alpha * 0.7})`;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, y, step, step);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.2})`;
            ctx.fillRect(x, y, step, step);
          }
        }
      } else if (overlayMode === 'grid') {
        ctx.strokeStyle = `rgba(255, 180, 84, ${alpha * 0.85})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        const w3 = canvas.width / 3;
        const h3 = canvas.height / 3;
        ctx.beginPath();
        ctx.moveTo(w3, 0);
        ctx.lineTo(w3, canvas.height);
        ctx.moveTo(w3 * 2, 0);
        ctx.lineTo(w3 * 2, canvas.height);
        ctx.moveTo(0, h3);
        ctx.lineTo(canvas.width, h3);
        ctx.moveTo(0, h3 * 2);
        ctx.lineTo(canvas.width, h3 * 2);
        ctx.stroke();
      } else if (overlayMode === 'golden') {
        // Golden Ratio Phi Grid & Spiral
        const phi = 1.6180339887;
        const phiX0 = canvas.width * (1 - 1 / phi);
        const phiX1 = canvas.width * (1 / phi);
        const phiY0 = canvas.height * (1 - 1 / phi);
        const phiY1 = canvas.height * (1 / phi);

        ctx.strokeStyle = `rgba(255, 217, 102, ${alpha * 0.9})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);

        ctx.beginPath();
        ctx.moveTo(phiX0, 0);
        ctx.lineTo(phiX0, canvas.height);
        ctx.moveTo(phiX1, 0);
        ctx.lineTo(phiX1, canvas.height);
        ctx.moveTo(0, phiY0);
        ctx.lineTo(canvas.width, phiY0);
        ctx.moveTo(0, phiY1);
        ctx.lineTo(canvas.width, phiY1);
        ctx.stroke();

        // Golden intersection nodes
        ctx.fillStyle = `rgba(255, 180, 84, ${alpha})`;
        [[phiX0, phiY0], [phiX1, phiY0], [phiX0, phiY1], [phiX1, phiY1]].forEach(([nx, ny]) => {
          ctx.beginPath();
          ctx.arc(nx, ny, 6, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (overlayMode === 'depth') {
        // Depth gradient simulation overlay
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, `rgba(55, 214, 192, ${alpha * 0.4})`);
        grad.addColorStop(0.5, `rgba(255, 180, 84, ${alpha * 0.2})`);
        grad.addColorStop(1, `rgba(255, 107, 122, ${alpha * 0.4})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };
    img.src = item.url;
  }, [item?.url, overlayMode, overlayOpacity]);

  const copyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      onToast(`${t.toastHex} ${hex}`, 'ok');
    } catch {
      onToast('Failed to copy', 'err');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const isAnalyzing = item?.status === 'analyzing' || item?.status === 'api' || item?.status === 'enhancing';

  return (
    <section className="panel intake flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-widest text-[#37d6c0] uppercase">
          {t.kIntake}
        </span>
        {item && (
          <span className="text-xs font-mono text-[#8faea5]">
            {item.name} · {(item.size / 1024 / 1024).toFixed(1)}MB
          </span>
        )}
      </div>

      {/* Drop Zone */}
      {!item ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#2f564e] hover:border-[#37d6c0] rounded-2xl p-8 text-center cursor-pointer bg-[#0c1917] hover:bg-[#0e1e1b] transition-all duration-300 flex flex-col items-center justify-center gap-3 group"
        >
          <Upload className="w-12 h-12 text-[#37d6c0] group-hover:text-[#ffb454] transition-colors duration-300 animate-bounce" />
          <h3 className="font-display text-2xl text-white font-normal">{t.dropTitle}</h3>
          <p className="text-xs text-[#8faea5] max-w-sm">{t.dropSub}</p>

          <span className="inline-flex items-center gap-2 bg-[#0f211e] border border-[#1f4a42] rounded-full px-3 py-1 text-[11px] font-mono text-[#37d6c0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#37d6c0] animate-ping" />
            {t.batchHint}
          </span>

          <button
            type="button"
            className="btn-amber px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md mt-1"
          >
            <Upload className="w-4 h-4" />
            <span>{t.browse}</span>
          </button>

          {/* URL loader */}
          <div
            className="flex items-center gap-2 mt-3 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && urlInput.trim()) {
                  onUrlLoad(urlInput.trim());
                  setUrlInput('');
                }
              }}
              placeholder={t.urlPlaceholder}
              className="flex-1 bg-[#0a1614] border border-[#22403a] focus:border-[#37d6c0] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
            />
            <button
              onClick={() => {
                if (urlInput.trim()) {
                  onUrlLoad(urlInput.trim());
                  setUrlInput('');
                }
              }}
              className="btn-ghost px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Link className="w-3.5 h-3.5" />
              <span>{t.loadBtn}</span>
            </button>
          </div>

          <div className="text-[10px] font-mono text-[#587a72] mt-1">{t.formats}</div>

          {/* Sample images */}
          <div className="flex items-center gap-2 flex-wrap justify-center mt-2">
            <span className="text-[11px] text-[#8faea5]">{t.sampleLabel}</span>
            {SAMPLES.map((sample) => (
              <button
                key={sample.key}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSampleSelect(sample.url);
                }}
                className="inline-flex items-center gap-1.5 bg-[#122421] border border-[#2a4a44] hover:border-[#37d6c0] text-[#cfe6df] rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sample.color }} />
                <span>{sample.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Stage Preview */
        <div className="flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden bg-[#0a1412] border border-[#23423c] group">
            <img
              src={item.url}
              alt={item.name}
              className="w-full max-h-[300px] object-contain bg-[#0a1412]"
            />

            {/* Scanline light effect */}
            {isAnalyzing && (
              <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-transparent via-[#ffb454] to-transparent shadow-[0_0_15px_#ffb454] animate-[scanLine_2s_linear_infinite]" />
            )}

            {/* Change / Add More */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-ghost bg-[#0e1d1acc] backdrop-blur px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-lg hover:border-[#37d6c0]"
              >
                <Plus className="w-3.5 h-3.5 text-[#37d6c0]" />
                <span>{t.addMore}</span>
              </button>
            </div>
          </div>

          {/* Visual Overlay Analysis */}
          <div className="bg-[#0e1d1a] border border-[#23423c] rounded-xl p-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[#8faea5] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#37d6c0]" />
                <span>Visual Overlay</span>
              </span>

              <div className="flex items-center gap-1 bg-[#0a1614] p-1 rounded-lg border border-[#1f3a34] flex-wrap">
                {(['edges', 'regions', 'grid', 'golden', 'depth', 'none'] as const).map((m) => {
                  const labels: Record<typeof m, string> = {
                    edges: 'حواف / Edges',
                    regions: 'تكتل / Color',
                    grid: 'شبكة 3×3',
                    golden: 'النسبة الذهبية φ',
                    depth: 'عمق / Depth',
                    none: 'إخفاء',
                  };
                  return (
                    <button
                      key={m}
                      onClick={() => setOverlayMode(m)}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer transition-all ${
                        overlayMode === m
                          ? 'bg-[#37d6c0] text-[#06231e] font-bold shadow-sm'
                          : 'text-[#8faea5] hover:text-white'
                      }`}
                    >
                      {labels[m]}
                    </button>
                  );
                })}
              </div>
            </div>

            {overlayMode !== 'none' && (
              <div className="rounded-lg overflow-hidden border border-[#1f3a34] bg-[#0a1412] relative">
                <canvas ref={canvasRef} className="w-full max-h-[220px] object-contain block" />
                <div className="p-2 bg-[#0e1d1a] border-t border-[#1f3a34] flex items-center justify-between text-[11px] text-[#8faea5]">
                  <span>Opacity</span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                    className="w-28 accent-[#37d6c0]"
                  />
                  <span>{overlayOpacity}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Metadata Chips */}
          {item.a && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-[#0e1d1a] border border-[#22403a] rounded-xl p-2.5">
                <span className="text-[10px] text-[#8faea5] block">{t.mDims}</span>
                <span className="font-mono text-xs text-white font-semibold">
                  {item.a.w} × {item.a.h}
                </span>
              </div>
              <div className="bg-[#0e1d1a] border border-[#22403a] rounded-xl p-2.5">
                <span className="text-[10px] text-[#8faea5] block">{t.mTier}</span>
                <span className="font-mono text-xs text-[#ffb454] font-bold">{item.a.tier}</span>
              </div>
              <div className="bg-[#0e1d1a] border border-[#22403a] rounded-xl p-2.5">
                <span className="text-[10px] text-[#8faea5] block">{t.mOrient}</span>
                <span className="font-mono text-xs text-white font-semibold capitalize">
                  {item.a.orient}
                </span>
              </div>
              <div className="bg-[#0e1d1a] border border-[#22403a] rounded-xl p-2.5">
                <span className="text-[10px] text-[#8faea5] block">{t.mSize}</span>
                <span className="font-mono text-xs text-white font-semibold">
                  {(item.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
            </div>
          )}

          {/* Analysis Steps */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {['Reading pixels', 'Extracting palette', 'Measuring light', 'Composing prompt'].map(
              (label, idx) => {
                const isDone = item.status === 'done' || item.step > idx + 1;
                const isActive = isAnalyzing && item.step === idx + 1;
                return (
                  <div
                    key={label}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] border whitespace-nowrap transition-all ${
                      isDone
                        ? 'border-[#1f5a50] text-[#37d6c0] bg-[#0e2e28]'
                        : isActive
                        ? 'border-[#8a5a22] text-[#ffb454] bg-[#3a2a12] animate-pulse'
                        : 'border-[#22403a] text-[#54736c] bg-[#0e1d1a]'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-[#16302b] flex items-center justify-center font-mono text-[9px]">
                      {idx + 1}
                    </span>
                    <span>{label}</span>
                  </div>
                );
              },
            )}
          </div>

          {/* Spectral Meters */}
          {item.a && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-[#0e1d1a] border border-[#22403a] rounded-xl p-3 text-xs">
              {[
                { label: t.mtBri, val: item.a.m.bri },
                { label: t.mtCon, val: item.a.m.con },
                { label: t.mtSat, val: item.a.m.sat },
                { label: t.mtWarm, val: item.a.m.warm },
                { label: t.mtDetail, val: item.a.m.detail },
                { label: t.mtColor, val: item.a.m.colorful },
                { label: t.mtDepth, val: item.a.m.depth },
                { label: 'النسبة الذهبية φ', val: item.a.m.goldenRatio || 0 },
                { label: t.mtText, val: item.a.m.textScore },
                { label: 'العمق الجوي / Fog', val: item.a.m.atmosphericDepth || 0 },
              ].map((meter) => (
                <div key={meter.label} className="flex items-center justify-between gap-2">
                  <span className="text-[#8faea5] text-[11px] truncate">{meter.label}</span>
                  <div className="flex-1 h-2 bg-[#0b1715] rounded-full overflow-hidden border border-[#1d3833]">
                    <div
                      className="h-full bg-gradient-to-r from-[#37d6c0] to-[#ffb454] rounded-full transition-all duration-500"
                      style={{ width: `${Math.round(meter.val * 100)}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-[#9fc3ba] w-6 text-right">
                    {Math.round(meter.val * 100)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Local Engine Photometric & Sensor Badges */}
          {item.a && (item.a.m.dynamicRangeEV || item.a.m.colorKelvin || item.a.m.lensFocalEstimate) && (
            <div className="bg-[#091513] border border-[#1d3833] rounded-xl p-2.5 flex items-center justify-between gap-2 flex-wrap text-[11px] font-mono">
              {item.a.m.lensFocalEstimate && (
                <span className="text-[#ffb454] bg-[#ffb45415] px-2 py-0.5 rounded border border-[#ffb45433]">
                  📷 {item.a.m.lensFocalEstimate}
                </span>
              )}
              {item.a.m.dynamicRangeEV && (
                <span className="text-[#37d6c0] bg-[#37d6c015] px-2 py-0.5 rounded border border-[#37d6c033]">
                  ⚡ {item.a.m.dynamicRangeEV} EV Range
                </span>
              )}
              {item.a.m.colorKelvin && (
                <span className="text-[#3ddc84] bg-[#3ddc8415] px-2 py-0.5 rounded border border-[#3ddc8433]">
                  🌡️ {item.a.m.colorKelvin}K Kelvin
                </span>
              )}
            </div>
          )}

          {/* Advanced Detection & Confidence Gauge */}
          {item.a && item.cls && (
            <div className="flex items-center gap-4 bg-[#0e1d1a] border border-[#22403a] rounded-xl p-3">
              {/* Circular confidence gauge */}
              {adv.conf && (
                <div className="relative w-16 h-16 flex-none flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" stroke="#16302b" strokeWidth="6" fill="none" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="url(#cg)"
                      strokeWidth="6"
                      strokeDasharray={163.36}
                      strokeDashoffset={163.36 * (1 - (item.conf || 80) / 100)}
                      strokeLinecap="round"
                      fill="none"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#37d6c0" />
                        <stop offset="100%" stopColor="#ffb454" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-display text-sm text-[#37d6c0] leading-none">
                    <span>{item.conf || 80}</span>
                    <span className="text-[8px] font-mono text-[#8faea5]">%</span>
                  </div>
                </div>
              )}

              {/* Trait chips */}
              <div className="flex-1 flex flex-wrap gap-1.5">
                {item.cls.symmetry && (
                  <span className="px-2.5 py-1 text-[10px] font-semibold bg-[#122421] border border-[#2a4a44] text-[#cfe6df] rounded-full">
                    {t.cSym}
                  </span>
                )}
                {item.cls.thirds && (
                  <span className="px-2.5 py-1 text-[10px] font-semibold bg-[#122421] border border-[#2a4a44] text-[#cfe6df] rounded-full">
                    {t.cThirds}
                  </span>
                )}
                {item.cls.bokeh && (
                  <span className="px-2.5 py-1 text-[10px] font-semibold bg-[#3a2a12] border border-[#8a5a22] text-[#ffd9a8] rounded-full">
                    {t.cBokeh}
                  </span>
                )}
                {item.cls.vignette && (
                  <span className="px-2.5 py-1 text-[10px] font-semibold bg-[#122421] border border-[#2a4a44] text-[#cfe6df] rounded-full">
                    {t.cVig}
                  </span>
                )}
                {item.cls.scheme && item.cls.scheme !== 'mix' && (
                  <span className="px-2.5 py-1 text-[10px] font-semibold bg-[#2a1a3a] border border-[#5a2a7a] text-[#d8c7ff] rounded-full">
                    {item.cls.scheme}
                  </span>
                )}
                {item.cls.texture && (
                  <span className="px-2.5 py-1 text-[10px] font-semibold bg-[#122421] border border-[#2a4a44] text-[#cfe6df] rounded-full">
                    {t.cTex}
                  </span>
                )}
                {item.cls.colorRich && (
                  <span className="px-2.5 py-1 text-[10px] font-semibold bg-[#3a2a12] border border-[#8a5a22] text-[#ffd9a8] rounded-full">
                    {t.cRich}
                  </span>
                )}
                {item.cls.hasText && (
                  <span className="px-2.5 py-1 text-[10px] font-semibold bg-[#0e2e28] border border-[#1f5a50] text-[#37d6c0] rounded-full">
                    {t.cText}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Dominant Palette */}
          {item.a && item.a.palette.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-[#8faea5] flex items-center justify-between">
                <span>{t.paletteTitle}</span>
                <span className="text-[10px] font-normal text-[#54736c]">Click to copy hex</span>
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {item.a.palette.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => copyHex(color.hex)}
                    style={{ backgroundColor: color.hex }}
                    className="flex-1 min-w-[65px] h-9 rounded-xl border border-white/20 hover:scale-105 transition-transform flex items-center justify-center font-mono text-[10px] font-bold text-white shadow-md drop-shadow cursor-pointer"
                  >
                    <span className="bg-black/40 px-1.5 py-0.5 rounded backdrop-blur">
                      {color.hex}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            onFilesSelected(e.target.files);
            e.target.value = '';
          }
        }}
      />
    </section>
  );
};
