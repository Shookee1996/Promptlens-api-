import React from 'react';
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
} from 'lucide-react';
import { BatchItem, AppOptions, AdvancedFeatures } from '../types';
import { I18N } from '../utils/i18n';

interface StudioPanelProps {
  item: BatchItem | null;
  opts: AppOptions;
  adv: AdvancedFeatures;
  lang: 'en' | 'ar' | 'fr' | 'es';
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
}

export const StudioPanel: React.FC<StudioPanelProps> = ({
  item,
  opts,
  adv,
  lang,
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
}) => {
  const t = I18N[lang].s;
  const promptText = item?.finalPrompt || '';
  const negText = item?.finalNeg || '';
  const isJson = opts.format === 'json';

  const wordsCount = promptText.trim() ? promptText.trim().split(/\s+/).length : 0;
  const charsCount = promptText.length;
  const tokensEst = Math.ceil(charsCount / 4);

  const copyToClipboard = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onToast(msg, 'ok');
    } catch {
      onToast('Failed to copy', 'err');
    }
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
