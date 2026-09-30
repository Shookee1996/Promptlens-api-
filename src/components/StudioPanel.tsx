import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Share2,
  Copy,
  RotateCcw,
  Download,
  FileText,
  Undo2,
  Redo2,
  Columns2,
  Rocket,
  Zap,
  Cpu,
  Code,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Wand2,
  Sliders,
  ChevronDown,
  Check,
} from 'lucide-react';
import {
  BatchItem,
  AppOptions,
  AdvancedFeatures,
  ApiInterface,
  SessionTokenStats,
} from '../types';
import { I18N } from '../utils/i18n';
import { optimizePromptCode, lintPromptSyntax } from '../utils/analyzer';

interface StudioPanelProps {
  item: BatchItem | null;
  opts: AppOptions;
  adv: AdvancedFeatures;
  lang: 'en' | 'ar' | 'fr' | 'es';
  apis?: ApiInterface[];
  activeApiId?: string | null;
  onSelectApi?: (id: string | null) => void;
  onOpenApiModal?: () => void;
  onAdvToggle?: (key: keyof AdvancedFeatures, value?: any) => void;
  tokenStats?: SessionTokenStats;
  isProcessing?: boolean;
  onOptsChange: (newOpts: Partial<AppOptions>) => void;
  onPromptChange: (newPrompt: string) => void;
  onEnhance: () => void;
  onShare: () => void;
  onRegen: () => void;
  onDownload: () => void;
  onExportMulti: () => void;
  onOpenCompare: () => void;
  onOpenGen: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
  onOpenCommandPalette?: () => void;
}

export const StudioPanel: React.FC<StudioPanelProps> = ({
  item,
  opts,
  adv,
  lang,
  apis = [],
  activeApiId = null,
  onSelectApi,
  onOpenApiModal,
  onAdvToggle,
  tokenStats,
  isProcessing = false,
  onOptsChange,
  onPromptChange,
  onEnhance,
  onShare,
  onRegen,
  onDownload,
  onExportMulti,
  onOpenCompare,
  onOpenGen,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onToast,
  onOpenCommandPalette,
}) => {
  const t = I18N[lang].s;
  const promptText = item?.finalPrompt || '';
  const negText = item?.finalNeg || '';
  const isJson = opts.format === 'json';

  const [showEngineMenu, setShowEngineMenu] = useState(false);
  const [showCodeOptimizerMenu, setShowCodeOptimizerMenu] = useState(false);

  const wordsCount = promptText.trim() ? promptText.trim().split(/\s+/).length : 0;
  const charsCount = promptText.length;
  const tokensEst = Math.ceil(charsCount / 4);

  const localEngineMode = adv.localEngineMode || 'deep';

  // Live Prompt Syntax Linting
  const syntaxReport = useMemo(() => {
    return lintPromptSyntax(promptText, opts.style);
  }, [promptText, opts.style]);

  const copyToClipboard = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onToast(msg, 'ok');
    } catch {
      onToast('Failed to copy', 'err');
    }
  };

  // Run Local Code & Prompt Optimization Engine
  const handleLocalCodeOptimize = (customOptions: { addPhotographicSpecs?: boolean; filmStock?: string } = {}) => {
    if (!promptText.trim()) {
      onToast('Prompt is empty — analyze an image first', 'err');
      return;
    }

    const res = optimizePromptCode(promptText, opts.style, {
      negativePrompt: negText,
      isJson,
      addPhotographicSpecs: customOptions.addPhotographicSpecs ?? true,
      lensEstimate: item?.a?.m?.lensFocalEstimate,
      dynamicRangeEV: item?.a?.m?.dynamicRangeEV,
      colorKelvin: item?.a?.m?.colorKelvin,
      filmStock: customOptions.filmStock,
    });

    onPromptChange(res.optimizedPrompt);
    const fixesCount = res.issuesFixed.length;
    const tokensInfo = res.tokensSaved > 0 ? ` (${res.tokensSaved} tok saved)` : '';
    const tagsInfo = res.tagsAdded && res.tagsAdded.length > 0 ? ` · Added ${res.tagsAdded.slice(0, 2).join(', ')}` : '';

    onToast(
      `⚡ Code Optimized in ${res.executionTimeMs}ms! Score: ${res.syntaxScore}%${tokensInfo}${tagsInfo}`,
      'ok'
    );
  };

  return (
    <section className="panel studio flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-widest text-[#37d6c0] uppercase">
          {t.kStudio}
        </span>
        <span className="font-display text-xl text-white font-normal">{t.studioTitle}</span>
      </div>

      {/* Target Engine Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { key: 'dalle', label: 'DALL·E 3' },
          { key: 'mj', label: 'Midjourney' },
          { key: 'sd', label: 'Stable Diffusion' },
          { key: 'flux', label: 'Flux' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => onOptsChange({ style: tab.key as any })}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 ${
              opts.style === tab.key
                ? 'bg-[#ffb45415] border border-[#8a5a22] text-[#ffb454] shadow-[0_0_12px_rgba(255,180,84,0.15)] -translate-y-0.5'
                : 'bg-[#0e1d1a] border border-[#22403a] text-[#8faea5] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="flex items-end gap-3 flex-wrap">
        {/* Format */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-[#8faea5]">{t.fmtLabel}</span>
          <div className="flex bg-[#0c1917] p-1 rounded-xl border border-[#22403a] gap-1">
            <button
              onClick={() => onOptsChange({ format: 'text' })}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                !isJson
                  ? 'bg-gradient-to-b from-[#ffc267] to-[#ff9a3d] text-[#2a1706] font-bold'
                  : 'text-[#8faea5] hover:text-white'
              }`}
            >
              {t.fmtText}
            </button>
            <button
              onClick={() => onOptsChange({ format: 'json' })}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                isJson
                  ? 'bg-gradient-to-b from-[#ffc267] to-[#ff9a3d] text-[#2a1706] font-bold'
                  : 'text-[#8faea5] hover:text-white'
              }`}
            >
              JSON
            </button>
          </div>
        </div>

        {/* Detail Level */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-[#8faea5]">{t.detailLabel}</span>
          <div className="flex bg-[#0c1917] p-1 rounded-xl border border-[#22403a] gap-1">
            {[
              { idx: 0, label: t.dConcise },
              { idx: 1, label: t.dBalanced },
              { idx: 2, label: t.dExhaustive },
            ].map((lvl) => (
              <button
                key={lvl.idx}
                onClick={() => onOptsChange({ detail: lvl.idx })}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                  opts.detail === lvl.idx
                    ? 'bg-gradient-to-b from-[#ffc267] to-[#ff9a3d] text-[#2a1706] font-bold'
                    : 'text-[#8faea5] hover:text-white'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-[#8faea5]">{t.pLangLabel}</span>
          <select
            value={opts.pLang}
            onChange={(e) => onOptsChange({ pLang: e.target.value as any })}
            className="bg-[#0e1d1a] border border-[#22403a] text-white rounded-xl px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
          </select>
        </div>

        {/* Quality boosters toggle */}
        <label className="flex items-center gap-2 text-xs font-semibold text-[#8faea5] cursor-pointer pb-1.5 ml-auto">
          <input
            type="checkbox"
            checked={opts.enhance}
            onChange={(e) => onOptsChange({ enhance: e.target.checked })}
            className="w-4 h-4 accent-[#37d6c0]"
          />
          <span>{t.enhanceLabel}</span>
        </label>
      </div>

      {/* Direct API Switcher Bar (الانتقال المباشر والذكي بين محركات الـ API) */}
      {onSelectApi && (
        <div className="flex items-center justify-between gap-2 p-2 bg-[#081513] border border-[#1b3630] rounded-xl flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-[#8faea5] uppercase tracking-wider flex items-center gap-1 font-bold">
              <Zap className="w-3 h-3 text-[#37d6c0]" />
              <span>Direct API:</span>
            </span>

            {/* Smart Auto-Routing Pill */}
            {onAdvToggle && (
              <button
                type="button"
                onClick={() => {
                  onAdvToggle('smartRouting', !adv.smartRouting);
                  onToast(
                    !adv.smartRouting
                      ? '🤖 تم تفعيل التوجيه الذكي التلقائي للنماذج ✓'
                      : 'تم الرجوع للوضع اليدوي',
                    'ok'
                  );
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                  adv.smartRouting
                    ? 'bg-[#ffb45422] text-[#ffb454] border border-[#ffb45488] shadow-[0_0_10px_rgba(255,180,84,0.3)] ring-1 ring-[#ffb45444] animate-pulse'
                    : 'bg-[#0e1d1a] text-[#8faea5] hover:text-white border border-[#22403a] hover:border-[#ffb454]'
                }`}
                title="التوجيه الذكي التلقائي لاختيار النموذج الأنسب وتفادي الأخطاء (Alt+S)"
              >
                <Sparkles className={`w-3 h-3 ${adv.smartRouting ? 'text-[#ffb454]' : 'text-[#8faea5]'}`} />
                <span>🤖 Auto-Route</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-[#0a1614] text-[#8faea5] font-normal">
                  Alt+S
                </span>
              </button>
            )}

            {/* Built-in Gemini Engine */}
            <button
              type="button"
              onClick={() => {
                if (adv.smartRouting && onAdvToggle) onAdvToggle('smartRouting', false);
                onSelectApi(null);
                onToast('⚡ انتقلت مباشرة إلى Built-in Google Gemini 3.8 Flash ✓', 'ok');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                !adv.smartRouting && activeApiId === null
                  ? 'bg-[#3ddc8422] text-[#3ddc84] border border-[#3ddc8466] shadow-[0_0_10px_rgba(61,220,132,0.2)] animate-switch-ripple ring-1 ring-[#3ddc8444]'
                  : 'bg-[#0e1d1a] text-[#8faea5] hover:text-white border border-[#22403a] hover:border-[#37d6c0]'
              }`}
              title="انتقال مباشر إلى Google Gemini 3.8 Flash (Alt+1)"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  !adv.smartRouting && activeApiId === null ? 'bg-[#3ddc84] animate-pulse' : 'bg-[#54736c]'
                }`}
              />
              <span>Gemini 3.8</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-[#0a1614] text-[#8faea5] font-normal">
                Alt+1
              </span>
            </button>

            {/* 100% Offline Local Engine Direct Button */}
            {onAdvToggle && (
              <button
                type="button"
                onClick={() => {
                  if (adv.smartRouting) onAdvToggle('smartRouting', false);
                  onAdvToggle('localEngineMode', 'deep');
                  onToast('⚡ انتقلت مباشرة إلى المحرك المحلي 100% Offline Local Engine ✓', 'ok');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                  !adv.smartRouting && adv.localEngineMode === 'deep'
                    ? 'bg-[#38bdf822] text-[#38bdf8] border border-[#38bdf866] shadow-[0_0_10px_rgba(56,189,248,0.2)] ring-1 ring-[#38bdf844]'
                    : 'bg-[#0e1d1a] text-[#8faea5] hover:text-white border border-[#22403a] hover:border-[#38bdf8]'
                }`}
                title="انتقال مباشر إلى المحرك المحلي دون إنترنت (Alt+0)"
              >
                <Cpu className="w-3 h-3 text-[#38bdf8]" />
                <span>Local Offline</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-[#0a1614] text-[#8faea5] font-normal">
                  Alt+0
                </span>
              </button>
            )}

            {/* Custom User APIs */}
            {apis.map((api, idx) => {
              const isActive = !adv.smartRouting && activeApiId === api.id;
              const shortcut = `Alt+${idx + 2}`;
              return (
                <button
                  key={api.id}
                  type="button"
                  onClick={() => {
                    if (adv.smartRouting && onAdvToggle) onAdvToggle('smartRouting', false);
                    onSelectApi(api.id);
                    onToast(`⚡ انتقلت مباشرة إلى ${api.name} (${api.model}) ✓`, 'ok');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#37d6c022] text-[#37d6c0] border border-[#37d6c066] shadow-[0_0_10px_rgba(55,214,192,0.2)] animate-switch-ripple ring-1 ring-[#37d6c044]'
                      : 'bg-[#0e1d1a] text-[#8faea5] hover:text-white border border-[#22403a] hover:border-[#37d6c0]'
                  }`}
                  title={`انتقال مباشر إلى ${api.name} (${api.model}) - ${shortcut}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-[#37d6c0] animate-pulse' : 'bg-[#54736c]'
                    }`}
                  />
                  <span className="max-w-[120px] truncate">{api.name}</span>
                  <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-[#17302c] text-[#8faea5] font-normal">
                    {shortcut}
                  </span>
                </button>
              );
            })}

            {onOpenCommandPalette && (
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-[#ffb454] hover:text-white bg-[#1a1710] hover:bg-[#2e2311] border border-[#543b17] hover:border-[#ffb454] flex items-center gap-1 transition-all cursor-pointer"
                title="فتح نافذة الانتقال المباشر الذكية السريعة (Ctrl+K)"
              >
                <span>⚡ HUD</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-[#091614] text-[#8faea5] font-normal">
                  Ctrl+K
                </span>
              </button>
            )}

            {onOpenApiModal && (
              <button
                type="button"
                onClick={onOpenApiModal}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-[#8faea5] hover:text-[#ffb454] hover:bg-[#1a1710] border border-transparent hover:border-[#8a5a22] transition-colors cursor-pointer"
                title="Manage, Edit & Add APIs"
              >
                + Manage APIs
              </button>
            )}
          </div>

          {/* Quick Real-Time Tokens Badge inside Studio */}
          {tokenStats && (
            <div
              className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all ${
                isProcessing
                  ? 'border-[#ffb454] bg-[#ffb45415] text-[#ffd9a8] ring-1 ring-[#ffb45444] animate-pulse'
                  : tokenStats.totalTokens > 0
                  ? 'border-[#37d6c033] bg-[#0c1816] text-[#37d6c0]'
                  : 'border-[#1b342e] bg-[#0c1816] text-[#8faea5]'
              }`}
              title={`Live Session Tokens: ${tokenStats.totalTokens.toLocaleString()}`}
            >
              <Zap className={`w-3 h-3 ${isProcessing ? 'text-[#ffb454] animate-bounce' : 'text-[#37d6c0]'}`} />
              <span className="font-bold">{tokenStats.totalTokens.toLocaleString()} tok</span>
            </div>
          )}
        </div>
      )}

      {/* Local Analysis Engine & Code Optimizer Bar */}
      <div className="flex flex-col gap-2 p-2.5 bg-[#091614] border border-[#1d3d36] rounded-xl shadow-inner">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Engine Mode Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-[#37d6c0] uppercase tracking-wider flex items-center gap-1 font-bold">
              <Cpu className="w-3.5 h-3.5 text-[#37d6c0]" />
              <span>Local Engine:</span>
            </span>

            {[
              { id: 'turbo', name: '⚡ Turbo', desc: 'استجابة فائقة للدفعات (~15ms)' },
              { id: 'deep', name: '🔬 Deep Optical', desc: 'تحليل هرمي عميق والنسبة الذهبية φ' },
              { id: 'cinematic', name: '🎬 Cinematic RAW', desc: 'نطاق EV وعدسات وإضاءة درامية' },
              { id: 'design', name: '🎨 Vector / UI', desc: 'هندسة التصميم والتايبوغرافي' },
            ].map((m) => {
              const isSelected = localEngineMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    if (onAdvToggle) {
                      onAdvToggle('localEngineMode', m.id);
                      onToast(`Local Engine switched to ${m.name} ✓`, 'ok');
                    }
                  }}
                  title={m.desc}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#37d6c022] text-[#37d6c0] border border-[#37d6c088] shadow-[0_0_10px_rgba(55,214,192,0.25)] ring-1 ring-[#37d6c044]'
                      : 'bg-[#0d1d1a] text-[#8faea5] hover:text-white border border-[#22403a] hover:border-[#37d6c0]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-[#37d6c0] animate-pulse' : 'bg-[#54736c]'
                    }`}
                  />
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>

          {/* Local Code & Prompt Enhancer Button */}
          <div className="relative flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => handleLocalCodeOptimize({ addPhotographicSpecs: true })}
              disabled={!promptText.trim()}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#203a35] via-[#1c453e] to-[#2b5950] hover:from-[#2a4e48] hover:to-[#387065] text-[#37d6c0] hover:text-white border border-[#37d6c066] hover:border-[#37d6c0] text-xs font-bold font-mono flex items-center gap-1.5 shadow-md hover:shadow-[0_0_15px_rgba(55,214,192,0.3)] transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none active:scale-95"
              title="تحسين بنية الكود والموجّه محلياً وإصلاح الأقواس والتكرار"
            >
              <Wand2 className="w-3.5 h-3.5 text-[#ffb454] animate-spin" style={{ animationDuration: '6s' }} />
              <span>⚡ تحسين الكود محلياً</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#ffb45422] text-[#ffb454] border border-[#ffb45444]">
                {syntaxReport.score}%
              </span>
            </button>

            {/* Quick Actions Dropdown Toggle */}
            <button
              type="button"
              onClick={() => setShowCodeOptimizerMenu(!showCodeOptimizerMenu)}
              disabled={!promptText.trim()}
              className="w-7 h-7 rounded-xl bg-[#0e1d1a] border border-[#22403a] hover:border-[#37d6c0] text-[#8faea5] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              title="خيارات تحسين الكود المتقدمة"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCodeOptimizerMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showCodeOptimizerMenu && (
              <div
                className="absolute right-0 top-9 w-64 bg-[#0a1614] border border-[#2a4a44] rounded-xl p-2 shadow-2xl z-30 flex flex-col gap-1 text-xs animate-modal-pop font-mono"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1 text-[10px] text-[#8faea5] uppercase tracking-wider font-bold border-b border-[#1b342e]">
                  خيارات تحسين الكود والموجّه
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleLocalCodeOptimize({ addPhotographicSpecs: false });
                    setShowCodeOptimizerMenu(false);
                  }}
                  className="w-full text-start px-2.5 py-1.5 rounded-lg hover:bg-[#122723] text-[#cfe6df] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Wrench className="w-3 h-3 text-[#37d6c0]" />
                  <span>تنظيف الأخطاء والأقواس والتكرار</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleLocalCodeOptimize({ addPhotographicSpecs: true, filmStock: 'Kodak Portra 400' });
                    setShowCodeOptimizerMenu(false);
                  }}
                  className="w-full text-start px-2.5 py-1.5 rounded-lg hover:bg-[#122723] text-[#cfe6df] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-[#ffb454]" />
                  <span>إدراج محاكاة Kodak Portra 400</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleLocalCodeOptimize({ addPhotographicSpecs: true, filmStock: 'Cinestill 800T' });
                    setShowCodeOptimizerMenu(false);
                  }}
                  className="w-full text-start px-2.5 py-1.5 rounded-lg hover:bg-[#122723] text-[#cfe6df] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-[#59c2e8]" />
                  <span>إدراج محاكاة Cinestill 800T (Night)</span>
                </button>

                {syntaxReport.issues.length > 0 && (
                  <div className="mt-1 pt-1 border-t border-[#1b342e] px-2 text-[10px] text-[#ffb454] flex flex-col gap-1">
                    <span className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>الملاحظات المكتشفة ({syntaxReport.issues.length}):</span>
                    </span>
                    {syntaxReport.issues.slice(0, 2).map((iss, idx) => (
                      <span key={idx} className="text-[#8faea5] truncate leading-tight">
                        • {iss.message}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Output Label & Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-white tracking-wide">{t.outLabel}</span>
          {item?.apiEngine && (
            <span className="text-[10px] font-mono text-[#37d6c0] bg-[#0e2e28] px-2 py-0.5 rounded-md border border-[#22403a] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc84] animate-pulse" />
              <span>{item.apiEngine}</span>
            </span>
          )}
          {item?.tokens && (
            <span
              className="text-[10px] font-mono text-[#ffb454] bg-[#221708] px-2 py-0.5 rounded-md border border-[#443015] flex items-center gap-1.5"
              title={`Input: ${item.tokens.promptTokens} tok | Output: ${item.tokens.completionTokens} tok | Total: ${item.tokens.totalTokens} tok${
                item.tokens.speedTps ? ` | Speed: ${item.tokens.speedTps} tok/s` : ''
              }`}
            >
              <Zap className="w-3 h-3 text-[#ffb454]" />
              <span>{item.tokens.totalTokens.toLocaleString()} tok</span>
              <span className="text-[9px] text-[#cca16a] hidden sm:inline">
                ({item.tokens.promptTokens} in / {item.tokens.completionTokens} out)
              </span>
              {item.tokens.speedTps ? (
                <span className="text-[9px] text-[#3ddc84] font-bold hidden md:inline">
                  · {item.tokens.speedTps} tok/s
                </span>
              ) : null}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="w-7 h-7 rounded-lg bg-[#0e1d1a] border border-[#22403a] hover:border-[#37d6c0] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-[#8faea5] hover:text-white transition-colors cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="w-7 h-7 rounded-lg bg-[#0e1d1a] border border-[#22403a] hover:border-[#37d6c0] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-[#8faea5] hover:text-white transition-colors cursor-pointer"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenCompare}
            disabled={!item?.history || item.history.length < 2}
            title="Compare versions (Ctrl+Shift+C)"
            className="w-7 h-7 rounded-lg bg-[#0e1d1a] border border-[#22403a] hover:border-[#37d6c0] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-[#8faea5] hover:text-white transition-colors cursor-pointer"
          >
            <Columns2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenGen}
            disabled={!promptText}
            title="Generate Image (Ctrl+G)"
            className="w-7 h-7 rounded-lg bg-[#3a2a12] border border-[#8a5a22] hover:border-[#ffb454] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-[#ffb454] transition-colors cursor-pointer"
          >
            <Rocket className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          value={promptText}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={t.outPh}
          rows={6}
          dir={opts.pLang === 'ar' && !isJson ? 'rtl' : 'ltr'}
          className="w-full bg-[#0a1614] border border-[#22403a] focus:border-[#ffb454] rounded-2xl p-4 font-mono text-sm leading-relaxed text-[#dcefe9] outline-none shadow-inner transition-all duration-300 resize-y"
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 font-mono text-[11px] text-[#5f8078] flex-wrap">
        <span>
          <b className="text-[#9fc3ba]">{wordsCount}</b> {t.sWords}
        </span>
        <span>·</span>
        <span>
          <b className="text-[#9fc3ba]">{charsCount}</b> {t.sChars}
        </span>
        <span>·</span>
        <span>
          <b className="text-[#9fc3ba]">~{tokensEst}</b> {t.sTokens}
        </span>
      </div>

      {/* Negative Prompt (if applicable) */}
      {(opts.style === 'sd' || adv.autoneg) && negText && !isJson && (
        <div className="bg-[#191318] border border-[#4a2a33] rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#ff6b7a]">{t.negTitle}</span>
            <button
              onClick={() => copyToClipboard(negText, t.toastNeg)}
              className="text-[11px] text-[#ff6b7a] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{t.btnCopyNeg}</span>
            </button>
          </div>
          <textarea
            value={negText}
            readOnly
            rows={2}
            className="w-full bg-[#120d10] border border-[#3a222b] rounded-lg p-2 font-mono text-xs text-[#e8b9c0] outline-none resize-none"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 flex-wrap mt-1">
        <button
          onClick={onEnhance}
          disabled={!promptText}
          className="btn-purple px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:pointer-events-none"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t.btnEnhance}</span>
        </button>

        <button
          onClick={() => copyToClipboard(promptText, t.toastCopied)}
          disabled={!promptText}
          className="btn-amber px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:pointer-events-none"
        >
          <Copy className="w-4 h-4" />
          <span>{t.btnCopy}</span>
        </button>

        <button
          onClick={onShare}
          disabled={!promptText}
          className="btn-teal px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:pointer-events-none"
        >
          <Share2 className="w-4 h-4" />
          <span>{t.btnShare}</span>
        </button>

        <button
          onClick={onRegen}
          disabled={!item?.a}
          className="btn-ghost px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.btnRegen}</span>
        </button>

        <button
          onClick={onExportMulti}
          disabled={!promptText}
          className="btn-ghost px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
        >
          <FileText className="w-4 h-4" />
          <span>Export Multi</span>
        </button>

        <button
          onClick={onDownload}
          disabled={!promptText}
          className="btn-ghost px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
        >
          <Download className="w-4 h-4" />
          <span>{t.btnDownload}</span>
        </button>
      </div>
    </section>
  );
};
