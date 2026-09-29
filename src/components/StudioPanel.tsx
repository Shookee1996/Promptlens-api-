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
  Zap,
} from 'lucide-react';
import { BatchItem, AppOptions, AdvancedFeatures, ApiInterface, SessionTokenStats } from '../types';
import { I18N } from '../utils/i18n';

interface StudioPanelProps {
  item: BatchItem | null;
  opts: AppOptions;
  adv: AdvancedFeatures;
  lang: 'en' | 'ar' | 'fr' | 'es';
  apis?: ApiInterface[];
  activeApiId?: string | null;
  onSelectApi?: (id: string | null) => void;
  onOpenApiModal?: () => void;
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

      {/* Direct API Switcher Bar (الانتقال المباشر بين محركات الـ API) */}
      {onSelectApi && (
        <div className="flex items-center justify-between gap-2 p-2 bg-[#081513] border border-[#1b3630] rounded-xl flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-[#8faea5] uppercase tracking-wider flex items-center gap-1 font-bold">
              <Zap className="w-3 h-3 text-[#37d6c0]" />
              <span>Direct API:</span>
            </span>

            {/* Built-in Gemini Engine */}
            <button
              type="button"
              onClick={() => {
                onSelectApi(null);
                onToast('Switched to Built-in Google Gemini 3.8 Flash ✓', 'ok');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                activeApiId === null
                  ? 'bg-[#3ddc8422] text-[#3ddc84] border border-[#3ddc8466] shadow-[0_0_10px_rgba(61,220,132,0.2)] animate-switch-ripple'
                  : 'bg-[#0e1d1a] text-[#8faea5] hover:text-white border border-[#22403a] hover:border-[#37d6c0]'
              }`}
              title="انتقال مباشر إلى Google Gemini 3.8 Flash (Built-in)"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeApiId === null ? 'bg-[#3ddc84] animate-pulse' : 'bg-[#54736c]'
                }`}
              />
              <span>Gemini 3.8</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-[#3ddc8418] text-[#3ddc84] font-normal">
                SERVER
              </span>
            </button>

            {/* Custom User APIs */}
            {apis.map((api) => {
              const isActive = activeApiId === api.id;
              return (
                <button
                  key={api.id}
                  type="button"
                  onClick={() => {
                    onSelectApi(api.id);
                    onToast(`Switched to ${api.name} (${api.model}) ✓`, 'ok');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#37d6c022] text-[#37d6c0] border border-[#37d6c066] shadow-[0_0_10px_rgba(55,214,192,0.2)] animate-switch-ripple'
                      : 'bg-[#0e1d1a] text-[#8faea5] hover:text-white border border-[#22403a] hover:border-[#37d6c0]'
                  }`}
                  title={`انتقال مباشر إلى ${api.name} (${api.model})`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-[#37d6c0] animate-pulse' : 'bg-[#54736c]'
                    }`}
                  />
                  <span className="max-w-[120px] truncate">{api.name}</span>
                  <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-[#17302c] text-[#8faea5] font-normal">
                    {api.provider}
                  </span>
                </button>
              );
            })}

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
