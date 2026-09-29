import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Check,
  Zap,
  KeyRound,
  Sliders,
  RotateCcw,
  Sparkles,
  Layers,
  Cpu,
  ArrowUpRight,
  TrendingUp,
  Copy,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { ApiInterface, SessionTokenStats } from '../types';

interface ApiQuickSwitcherProps {
  apis: ApiInterface[];
  activeApiId: string | null;
  onSelectApi: (id: string | null) => void;
  onOpenApiModal: () => void;
  tokenStats: SessionTokenStats;
  onResetTokens: () => void;
  isProcessing?: boolean;
}

// Smooth animated rolling number component
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [display, setDisplay] = useState(value);
  const animRef = useRef<number | null>(null);
  const startValRef = useRef(value);

  useEffect(() => {
    const start = display;
    const end = value;
    if (start === end) return;

    const duration = 600;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic curve
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * ease);
      setDisplay(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(end);
        startValRef.current = end;
      }
    };

    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
};

export const ApiQuickSwitcher: React.FC<ApiQuickSwitcherProps> = ({
  apis,
  activeApiId,
  onSelectApi,
  onOpenApiModal,
  tokenStats,
  onResetTokens,
  isProcessing = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  // Delta indicator (+N tok) state
  const [delta, setDelta] = useState<number | null>(null);
  const prevTotalRef = useRef<number>(tokenStats.totalTokens);
  const deltaTimeoutRef = useRef<any>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Detect token changes and trigger delta bounce
  useEffect(() => {
    if (tokenStats.totalTokens > prevTotalRef.current) {
      const diff = tokenStats.totalTokens - prevTotalRef.current;
      setDelta(diff);
      if (deltaTimeoutRef.current) clearTimeout(deltaTimeoutRef.current);
      deltaTimeoutRef.current = setTimeout(() => {
        setDelta(null);
      }, 2600);
    }
    prevTotalRef.current = tokenStats.totalTokens;
  }, [tokenStats.totalTokens]);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (statsRef.current && !statsRef.current.contains(e.target as Node)) {
        setIsStatsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeApi = apis.find((a) => a.id === activeApiId);
  const activeLabel = activeApi ? activeApi.name : 'Gemini 3.8 Flash';
  const activeProvider = activeApi ? activeApi.provider : 'gemini';

  const providerColor = (p: string) => {
    switch (p) {
      case 'gemini':
        return 'text-[#3ddc84] bg-[#3ddc8418] border-[#3ddc8433]';
      case 'openai':
        return 'text-[#10a37f] bg-[#10a37f18] border-[#10a37f33]';
      case 'anthropic':
        return 'text-[#f59e0b] bg-[#d9770618] border-[#d9770633]';
      default:
        return 'text-[#c084fc] bg-[#a855f718] border-[#a855f733]';
    }
  };

  const copyTelemetryReport = async () => {
    const report = {
      timestamp: new Date().toISOString(),
      activeEngine: activeLabel,
      totalTokens: tokenStats.totalTokens,
      promptTokens: tokenStats.totalPromptTokens,
      completionTokens: tokenStats.totalCompletionTokens,
      totalApiCalls: tokenStats.callCount,
      generationSpeedTps: tokenStats.lastCallTokens?.speedTps || null,
      tokensByEngine: tokenStats.tokensByEngine || {},
      lastExecution: tokenStats.lastCallTokens || null,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* 1. Precise Real-Time Animated Token Counter */}
      <div className="relative" ref={statsRef}>
        <button
          type="button"
          onClick={() => {
            setIsStatsOpen(!isStatsOpen);
            setIsMenuOpen(false);
          }}
          className={`relative inline-flex items-center gap-2 bg-[#0e1d1a] border rounded-xl px-3 py-1.5 text-xs font-mono transition-all duration-300 cursor-pointer shadow-sm hover:-translate-y-0.5 ${
            isProcessing
              ? 'border-[#ffb454] bg-[#ffb45415] text-[#ffd9a8] ring-1 ring-[#ffb45466] shadow-[0_0_12px_rgba(255,180,84,0.2)]'
              : tokenStats.totalTokens > 0
              ? 'border-[#37d6c044] text-[#cfe6df] hover:border-[#37d6c0]'
              : 'border-[#23423c] text-[#8faea5] hover:border-[#37d6c0]'
          }`}
          title="Live Token Telemetry & Precise Token Counter (عداد التوكين الدقيق)"
        >
          <div className="flex items-center gap-1.5">
            <Zap
              className={`w-3.5 h-3.5 transition-all duration-300 ${
                isProcessing
                  ? 'text-[#ffb454] animate-bounce'
                  : tokenStats.totalTokens > 0
                  ? 'text-[#37d6c0]'
                  : 'text-[#8faea5]'
              }`}
            />
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8faea5] hidden sm:inline">
              Tokens:
            </span>

            {/* Rolling Live Counter Number */}
            <span
              className={`font-bold font-mono transition-all duration-300 ${
                isProcessing
                  ? 'text-[#ffb454] scale-105'
                  : delta
                  ? 'text-[#37d6c0] animate-token-bump'
                  : 'text-white'
              }`}
            >
              <AnimatedNumber value={tokenStats.totalTokens} />
            </span>
          </div>

          {/* Active Computing Badge */}
          {isProcessing ? (
            <span className="text-[9px] font-bold text-[#ffb454] bg-[#ffb45422] px-1.5 py-0.5 rounded border border-[#ffb45444] animate-pulse">
              Computing…
            </span>
          ) : tokenStats.lastCallTokens?.speedTps ? (
            <span className="text-[10px] text-[#3ddc84] bg-[#0c241e] px-1.5 py-0.5 rounded border border-[#22403a] font-bold hidden md:inline">
              {tokenStats.lastCallTokens.speedTps} tok/s
            </span>
          ) : null}

          {/* Floating Delta Badge (+N tok) */}
          {delta && !isProcessing && (
            <span className="absolute -top-3.5 inset-inline-end-1 bg-gradient-to-r from-[#37d6c0] to-[#3ddc84] text-[#061814] text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full shadow-[0_0_10px_rgba(55,214,192,0.6)] animate-delta-float pointer-events-none">
              +{delta.toLocaleString()} tok
            </span>
          )}
        </button>

        {/* Telemetry Popover */}
        {isStatsOpen && (
          <div className="absolute top-full mt-2 inset-inline-end-0 md:inset-inline-start-0 w-80 bg-[#0a1614] border border-[#2a4a44] rounded-2xl p-4 shadow-2xl z-50 animate-slide-down">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b3630] mb-3">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#37d6c0]" />
                <span className="text-xs font-bold text-white tracking-wide">
                  Live Token Telemetry (عداد التوكين الدقيق)
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#8faea5] bg-[#122622] px-2 py-0.5 rounded border border-[#22403a]">
                {tokenStats.callCount} calls
              </span>
            </div>

            {/* Inbound & Outbound Cards */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-[#0e1d1a] border border-[#1d3832] rounded-xl p-2.5">
                <span className="text-[10px] text-[#8faea5] block font-semibold">Input (Prompt)</span>
                <span className="text-sm font-bold font-mono text-white mt-0.5 block">
                  <AnimatedNumber value={tokenStats.totalPromptTokens} />
                </span>
                <span className="text-[9px] text-[#54736c]">Inbound Vision & Text</span>
              </div>

              <div className="bg-[#0e1d1a] border border-[#1d3832] rounded-xl p-2.5">
                <span className="text-[10px] text-[#8faea5] block font-semibold">Output (Completion)</span>
                <span className="text-sm font-bold font-mono text-[#37d6c0] mt-0.5 block">
                  <AnimatedNumber value={tokenStats.totalCompletionTokens} />
                </span>
                <span className="text-[9px] text-[#54736c]">Synthesized Prompts</span>
              </div>
            </div>

            {/* Distribution by Engine */}
            {tokenStats.tokensByEngine && Object.keys(tokenStats.tokensByEngine).length > 0 && (
              <div className="bg-[#0c1816] border border-[#1c3630] rounded-xl p-2.5 mb-3">
                <span className="text-[10px] text-[#8faea5] font-semibold block mb-1.5 uppercase tracking-wider font-mono">
                  Tokens per AI Engine:
                </span>
                <div className="flex flex-col gap-1.5">
                  {Object.entries(tokenStats.tokensByEngine).map(([engineName, count]) => {
                    const pct = Math.max(4, Math.round((count / Math.max(1, tokenStats.totalTokens)) * 100));
                    return (
                      <div key={engineName} className="text-[11px] font-mono">
                        <div className="flex items-center justify-between text-[#cfe6df] mb-0.5">
                          <span className="truncate max-w-[170px] text-white font-semibold">{engineName}</span>
                          <span className="text-[#37d6c0] font-bold">
                            {count.toLocaleString()} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#122421] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#37d6c0] to-[#3ddc84] h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Last Call Telemetry */}
            {tokenStats.lastCallTokens && (
              <div className="bg-[#122421] border border-[#23423c] rounded-xl p-2.5 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#ffb454] font-bold block">Last API Execution:</span>
                  {tokenStats.lastCallTokens.engine && (
                    <span className="text-[9px] font-mono text-[#8faea5] truncate max-w-[130px]">
                      {tokenStats.lastCallTokens.engine}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#cfe6df]">
                  <span>
                    {tokenStats.lastCallTokens.promptTokens} in / {tokenStats.lastCallTokens.completionTokens} out
                  </span>
                  <span className="font-bold text-white">
                    {tokenStats.lastCallTokens.totalTokens.toLocaleString()} tok
                  </span>
                </div>
                {tokenStats.lastCallTokens.speedTps ? (
                  <span className="text-[10px] font-mono text-[#3ddc84] block mt-1">
                    ⚡ Generation Speed: {tokenStats.lastCallTokens.speedTps} tok/sec
                  </span>
                ) : null}
              </div>
            )}

            {/* Actions: Copy Report, Reset, Close */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1b3630]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyTelemetryReport}
                  className="text-[11px] text-[#8faea5] hover:text-[#37d6c0] flex items-center gap-1 cursor-pointer transition-colors"
                  title="Copy full telemetry JSON report"
                >
                  {copiedReport ? <CheckCircle2 className="w-3 h-3 text-[#3ddc84]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedReport ? 'Copied ✓' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={onResetTokens}
                  className="text-[11px] text-[#8faea5] hover:text-[#ff6b7a] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsStatsOpen(false)}
                className="text-[11px] text-[#37d6c0] hover:text-white font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Direct 1-Click API Switcher Dropdown (الانتقال المباشر بين محركات الـ API) */}
      <div className="relative" ref={menuRef}>
        <div className="inline-flex rounded-xl bg-[#0f1e1c] border border-[#23423c] hover:border-[#37d6c0] transition-all duration-300 shadow-sm overflow-hidden">
          {/* Main button opens direct dropdown */}
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              setIsStatsOpen(false);
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold tracking-wide text-[#cfe6df] hover:text-white cursor-pointer transition-colors"
            title="Click to switch API Engine directly (انتقال مباشر بين الـ API)"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#37d6c0]" />
            <span className="text-[10px] uppercase font-bold text-[#8faea5] hidden sm:inline">API:</span>
            <span className="text-[11px] text-[#37d6c0] max-w-[130px] truncate">
              {activeLabel}
            </span>
            <span
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeApiId ? 'bg-[#3ddc84] shadow-[0_0_8px_#3ddc84]' : 'bg-[#3ddc84] animate-pulse'
              }`}
            />
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#8faea5] transition-transform duration-200 ${
                isMenuOpen ? 'rotate-180 text-white' : ''
              }`}
            />
          </button>
        </div>

        {/* Direct Switch Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-full mt-2 inset-inline-end-0 w-76 bg-[#0a1614] border border-[#2a4a44] rounded-2xl p-2.5 shadow-2xl z-50 animate-slide-down">
            <div className="px-3 py-2 border-b border-[#1b3630] mb-1.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#37d6c0] uppercase tracking-wider block font-bold">
                  ⚡ الانتقال المباشر بين الـ API
                </span>
                <span className="text-[11px] text-[#8faea5]">Direct 1-Click Engine Activation</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#122622] text-[#8faea5] border border-[#22403a]">
                {1 + apis.length} Ready
              </span>
            </div>

            {/* Option: Built-in Gemini Engine */}
            <button
              type="button"
              onClick={() => {
                onSelectApi(null);
                setIsMenuOpen(false);
              }}
              className={`w-full text-start p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer mb-1 ${
                activeApiId === null
                  ? 'bg-[#3ddc8418] border border-[#3ddc8444] text-white shadow-sm ring-1 ring-[#3ddc8433]'
                  : 'hover:bg-[#122622] text-[#cfe6df] border border-transparent hover:border-[#22403a]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-none transition-all ${
                    activeApiId === null
                      ? 'bg-[#3ddc84] shadow-[0_0_8px_#3ddc84]'
                      : 'bg-[#54736c]'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Gemini 3.8 Flash</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#3ddc8422] text-[#3ddc84] border border-[#3ddc8433]">
                      BUILT-IN
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8faea5] block font-mono">
                    Zero-config · Fast response (~20ms)
                  </span>
                </div>
              </div>
              {activeApiId === null ? (
                <span className="text-[10px] font-mono font-bold text-[#3ddc84] bg-[#0d2a23] px-1.5 py-0.5 rounded border border-[#22403a] flex items-center gap-1">
                  <Check className="w-3 h-3 text-[#3ddc84]" />
                  <span>نشط</span>
                </span>
              ) : (
                <span className="text-[10px] font-mono text-[#8faea5] hover:text-white bg-[#0e1d1a] px-1.5 py-0.5 rounded border border-[#1b342e]">
                  انتقال ⚡
                </span>
              )}
            </button>

            {/* Custom User APIs */}
            {apis.length > 0 && (
              <div className="my-1 border-t border-[#1b3630] pt-1.5">
                <span className="text-[9px] font-mono text-[#54736c] uppercase px-3 py-1 block">
                  Custom Engines ({apis.length})
                </span>
                {apis.map((api) => {
                  const isThisActive = api.id === activeApiId;
                  return (
                    <button
                      key={api.id}
                      type="button"
                      onClick={() => {
                        onSelectApi(api.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-start p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer mb-1 ${
                        isThisActive
                          ? 'bg-[#3ddc8418] border border-[#3ddc8444] text-white shadow-sm ring-1 ring-[#3ddc8433]'
                          : 'hover:bg-[#122622] text-[#cfe6df] border border-transparent hover:border-[#22403a]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full flex-none transition-all ${
                            isThisActive
                              ? 'bg-[#3ddc84] shadow-[0_0_8px_#3ddc84]'
                              : 'bg-[#54736c]'
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate max-w-[140px]">
                              {api.name}
                            </span>
                            <span
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${providerColor(
                                api.provider
                              )}`}
                            >
                              {api.provider}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#8faea5] block font-mono">
                            {api.model} · {api.precision}
                          </span>
                        </div>
                      </div>
                      {isThisActive ? (
                        <span className="text-[10px] font-mono font-bold text-[#3ddc84] bg-[#0d2a23] px-1.5 py-0.5 rounded border border-[#22403a] flex items-center gap-1">
                          <Check className="w-3 h-3 text-[#3ddc84]" />
                          <span>نشط</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#8faea5] hover:text-white bg-[#0e1d1a] px-1.5 py-0.5 rounded border border-[#1b342e]">
                          انتقال ⚡
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Footer: Open full API modal for editing / adding */}
            <div className="pt-2 mt-1 border-t border-[#1b3630]">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenApiModal();
                }}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-[#37d6c0] hover:text-white bg-[#122622] hover:bg-[#1a3832] border border-[#22403a] hover:border-[#37d6c0] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Manage, Edit & Add APIs…</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
