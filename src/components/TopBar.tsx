import React from 'react';
import { Sliders, Activity, Mail, Info } from 'lucide-react';
import { I18N } from '../utils/i18n';
import { LatencyRateLimiterBar } from './LatencyRateLimiterBar';
import { ApiQuickSwitcher } from './ApiQuickSwitcher';
import { ApiInterface, LatencyMetrics, SessionTokenStats } from '../types';

interface TopBarProps {
  lang: 'en' | 'ar' | 'fr' | 'es';
  onLangChange: (lang: 'en' | 'ar' | 'fr' | 'es') => void;
  apis: ApiInterface[];
  activeApiId: string | null;
  onSelectApi: (id: string | null) => void;
  tokenStats: SessionTokenStats;
  onResetTokens: () => void;
  latestLatency: LatencyMetrics | null;
  onRefreshPing: () => void;
  onOpenAdv: () => void;
  onOpenPerf: () => void;
  onOpenContact: () => void;
  onOpenAbout: () => void;
  onOpenApi: () => void;
  isProcessing?: boolean;
  isSmartRouting?: boolean;
  onToggleSmartRouting?: () => void;
  onToast?: (msg: string, type?: 'ok' | 'err') => void;
  onOpenCommandPalette?: () => void;
  onRunSpeedBenchmark?: () => Promise<void>;
  isBenchmarking?: boolean;
  smartRoutingMode?: 'auto' | 'vision' | 'speed' | 'offline';
  onSetSmartRoutingMode?: (mode: 'auto' | 'vision' | 'speed' | 'offline') => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  lang,
  onLangChange,
  apis,
  activeApiId,
  onSelectApi,
  tokenStats,
  onResetTokens,
  latestLatency,
  onRefreshPing,
  onOpenAdv,
  onOpenPerf,
  onOpenContact,
  onOpenAbout,
  onOpenApi,
  isProcessing,
  isSmartRouting,
  onToggleSmartRouting,
  onToast,
  onOpenCommandPalette,
  onRunSpeedBenchmark,
  isBenchmarking,
  smartRoutingMode,
  onSetSmartRoutingMode,
}) => {
  const t = I18N[lang].s;

  return (
    <header className="max-w-[1480px] mx-auto px-7 pt-6 pb-2 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3.5 group cursor-pointer">
        <svg
          className="w-12 h-12 flex-none drop-shadow-[0_4px_12px_rgba(255,180,84,0.2)] transition-all duration-500 group-hover:drop-shadow-[0_4px_20px_rgba(255,180,84,0.4)]"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="48" y2="48">
              <stop offset="0" stopColor="#ffb454" />
              <stop offset="1" stopColor="#37d6c0" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="24" r="21" stroke="url(#lg)" strokeWidth="2.4" />
          <g
            className="transition-transform duration-1000 ease-out group-hover:rotate-180"
            style={{ transformOrigin: '24px 24px' }}
            stroke="url(#lg)"
            strokeWidth="2.3"
            strokeLinecap="round"
          >
            <path d="M24 4 L36.5 25.5" />
            <path d="M24 4 L36.5 25.5" transform="rotate(60 24 24)" />
            <path d="M24 4 L36.5 25.5" transform="rotate(120 24 24)" />
            <path d="M24 4 L36.5 25.5" transform="rotate(180 24 24)" />
            <path d="M24 4 L36.5 25.5" transform="rotate(240 24 24)" />
            <path d="M24 4 L36.5 25.5" transform="rotate(300 24 24)" />
          </g>
          <circle cx="24" cy="24" r="6.5" stroke="url(#lg)" strokeWidth="2.2" />
        </svg>

        <div>
          <h1 className="font-display text-3xl leading-none tracking-wide text-white">
            Promptlens-
            <b className="font-normal bg-gradient-to-br from-[#ffb454] to-[#37d6c0] bg-clip-text text-transparent">
              api
            </b>
          </h1>
          <p className="text-xs text-[#8faea5] mt-1 tracking-wide">{t.tagline}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Real-time Response Latency Gauge */}
        <LatencyRateLimiterBar
          latestLatency={latestLatency}
          onRefreshPing={onRefreshPing}
        />

        {/* Direct API Switcher & Accurate Live Token Counter */}
        <ApiQuickSwitcher
          apis={apis}
          activeApiId={activeApiId}
          onSelectApi={onSelectApi}
          onOpenApiModal={onOpenApi}
          tokenStats={tokenStats}
          onResetTokens={onResetTokens}
          isProcessing={isProcessing}
          isSmartRouting={isSmartRouting}
          onToggleSmartRouting={onToggleSmartRouting}
          onToast={onToast}
          onOpenCommandPalette={onOpenCommandPalette}
          onRunSpeedBenchmark={onRunSpeedBenchmark}
          isBenchmarking={isBenchmarking}
          smartRoutingMode={smartRoutingMode}
          onSetSmartRoutingMode={onSetSmartRoutingMode}
        />

        <button
          onClick={onOpenAdv}
          className="inline-flex items-center gap-2 bg-[#0f1e1c] border border-[#23423c] hover:border-[#ffb454] text-[#cfe6df] hover:text-[#ffd9a8] rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
          title="Advanced Features"
        >
          <Sliders className="w-3.5 h-3.5 text-[#ffb454]" />
          <span>{t.advBtn}</span>
        </button>

        <button
          onClick={onOpenPerf}
          className="inline-flex items-center gap-1.5 bg-[#0f1e1c] border border-[#23423c] hover:border-[#a855f7] text-[#cfe6df] hover:text-[#d8c7ff] rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
          title="Performance & Token Analytics Dashboard"
        >
          <Activity className="w-3.5 h-3.5 text-[#a855f7]" />
          <span>Analytics ⚡</span>
        </button>

        <button
          onClick={onOpenContact}
          className="inline-flex items-center gap-2 bg-[#0f1e1c] border border-[#23423c] hover:border-[#37d6c0] text-[#cfe6df] hover:text-[#bdf3e8] rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
        >
          <Mail className="w-3.5 h-3.5 text-[#37d6c0]" />
          <span>{t.contactBtn}</span>
        </button>

        <button
          onClick={onOpenAbout}
          className="inline-flex items-center gap-2 bg-[#0f1e1c] border border-[#23423c] hover:border-[#ffb454] text-[#cfe6df] hover:text-[#ffd9a8] rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
        >
          <Info className="w-3.5 h-3.5 text-[#ffb454]" />
          <span>{t.aboutBtn}</span>
        </button>

        <div className="flex bg-[#0f1e1c] border border-[#23423c] rounded-xl p-1 gap-1">
          {(['ar', 'en', 'fr', 'es'] as const).map((l) => (
            <button
              key={l}
              onClick={() => onLangChange(l)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                lang === l
                  ? 'bg-gradient-to-b from-[#ffc267] to-[#ff9a3d] text-[#2a1706] shadow-[0_2px_12px_rgba(255,154,61,0.3)]'
                  : 'text-[#8faea5] hover:text-[#e7f2ee] hover:bg-[#17302c]'
              }`}
            >
              {l === 'ar' ? 'العربية' : l === 'en' ? 'English' : l === 'fr' ? 'Français' : 'Español'}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
