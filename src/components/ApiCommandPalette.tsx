import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Bot,
  KeyRound,
  Check,
  Search,
  Sparkles,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  ShieldCheck,
  Gauge,
  X,
  Flame,
  Radio,
} from 'lucide-react';
import { ApiInterface, AdvancedFeatures } from '../types';

interface ApiCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  apis: ApiInterface[];
  activeApiId: string | null;
  onSelectApi: (id: string | null) => void;
  adv: AdvancedFeatures;
  onAdvToggle: (key: keyof AdvancedFeatures, value?: any) => void;
  onOpenApiModal: () => void;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
  onRunSpeedBenchmark?: () => Promise<void>;
  isBenchmarking?: boolean;
}

interface EngineCommandItem {
  id: string;
  name: string;
  provider: string;
  model: string;
  isSmart: boolean;
  isLocal: boolean;
  shortcut: string;
  description: string;
  vision: boolean;
  active?: boolean;
  latency?: number;
  status?: 'ok' | 'err';
}

export const ApiCommandPalette: React.FC<ApiCommandPaletteProps> = ({
  isOpen,
  onClose,
  apis,
  activeApiId,
  onSelectApi,
  adv,
  onAdvToggle,
  onOpenApiModal,
  onToast,
  onRunSpeedBenchmark,
  isBenchmarking = false,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // List of all switchable engines
  const allEngines: EngineCommandItem[] = [
    {
      id: '__smart__',
      name: 'Smart Auto-Router (الموجّه الذكي التلقائي)',
      provider: 'ai_router',
      model: 'Content-Aware Adaptive Engine',
      isSmart: true,
      isLocal: false,
      shortcut: 'Alt+S',
      description: 'يحلل تركيبة الصورة ويوجهها تلقائياً للمحرك الأنسب ويتفادى الأخطاء فوراً',
      vision: true,
      active: adv.smartRouting,
    },
    {
      id: '__builtin__',
      name: 'Google Gemini 3.8 Flash (المدمج)',
      provider: 'gemini',
      model: 'gemini-3.8-flash',
      isSmart: false,
      isLocal: false,
      shortcut: 'Alt+1',
      description: 'المحرك السحابي المدمج الفائق · استجابة سريعة (~20ms) ورؤية حاسوبية متعددة الوسائط',
      vision: true,
      active: !adv.smartRouting && activeApiId === null,
    },
    {
      id: '__offline_deep__',
      name: '100% Offline Local Engine (المحرك المحلي)',
      provider: 'local',
      model: 'Neural Photometric & Pixel Matrix',
      isSmart: false,
      isLocal: true,
      shortcut: 'Alt+0',
      description: 'معالجة محلية بالكامل دون إنترنت · سرعة معالجة قصوى (~12ms) مع تحليل هندسي دقيق',
      vision: true,
      active: !adv.smartRouting && adv.localEngineMode === 'deep',
    },
    ...apis.map((api, idx) => ({
      id: api.id,
      name: api.name,
      provider: api.provider,
      model: api.model,
      isSmart: false,
      isLocal: false,
      shortcut: `Alt+${idx + 2}`,
      description: `مزود مخصص (${api.provider.toUpperCase()}) · دقة ${api.precision} ${
        api.lastTestLatencyMs ? `· سرعة ${api.lastTestLatencyMs}ms` : ''
      }`,
      vision: !!api.visionCapable,
      latency: api.lastTestLatencyMs,
      status: api.lastTestStatus,
      active: !adv.smartRouting && activeApiId === api.id,
    })),
  ];

  const filtered = allEngines.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.model.toLowerCase().includes(search.toLowerCase()) ||
      item.provider.toLowerCase().includes(search.toLowerCase()) ||
      item.shortcut.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (item: (typeof allEngines)[0]) => {
    if (item.isSmart) {
      onAdvToggle('smartRouting', true);
      onToast('🤖 تم تفعيل التوجيه الذكي التلقائي: اختيار أفضل نموذج وتفادي الأخطاء ✓', 'ok');
    } else if (item.isLocal) {
      if (adv.smartRouting) onAdvToggle('smartRouting', false);
      onAdvToggle('localEngineMode', 'deep');
      onToast('⚡ انتقلت مباشرة إلى المحرك المحلي 100% Offline Local Engine ✓', 'ok');
    } else if (item.id === '__builtin__') {
      if (adv.smartRouting) onAdvToggle('smartRouting', false);
      onSelectApi(null);
      onToast('⚡ انتقلت مباشرة إلى Built-in Google Gemini 3.8 Flash ✓', 'ok');
    } else {
      if (adv.smartRouting) onAdvToggle('smartRouting', false);
      onSelectApi(item.id);
      onToast(`⚡ انتقلت مباشرة إلى ${item.name} (${item.model}) ✓`, 'ok');
    }
    onClose();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 z-[999] p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#091614] border border-[#23483f] rounded-2xl w-full max-w-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh] animate-scale-up font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Search Bar */}
        <div className="p-3.5 border-b border-[#1b3630] bg-[#0c1d1a] flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#37d6c015] border border-[#37d6c033] flex items-center justify-center text-[#37d6c0]">
            <Zap className="w-4 h-4" />
          </div>
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-[#54736c] absolute inset-inline-start-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="انتقال مباشر بين الـ APIs... ابحث بالاسم، النموذج، أو المزود (Ctrl+K / Alt+1..9)"
              className="w-full bg-[#081311] border border-[#1d3d36] focus:border-[#37d6c0] text-white rounded-xl ps-9 pe-3 py-2 text-xs outline-none transition-all placeholder:text-[#54736c]"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#112421] text-[#8faea5] hover:text-white flex items-center justify-center border border-[#1f3f38] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Smart Routing Mode Ribbon */}
        <div className="px-4 py-2 bg-[#0a1816] border-b border-[#152e28] flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Bot className="w-3.5 h-3.5 text-[#ffb454]" />
            <span className="text-[11px] text-[#8faea5]">
              أنماط التوجيه الذكي:
            </span>
            <div className="flex items-center gap-1 bg-[#06110f] p-0.5 rounded-lg border border-[#1a3832]">
              {[
                { key: 'auto', label: '🧠 تكيّفي (Adaptive)' },
                { key: 'speed', label: '⚡ أسرع استجابة (Speed)' },
                { key: 'vision', label: '🎯 أعلى دقة (Quality)' },
                { key: 'offline', label: '🛡️ محلي 100% (Offline)' },
              ].map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => {
                    onAdvToggle('smartRoutingMode', mode.key);
                    onAdvToggle('smartRouting', true);
                    onToast(`تم ضبط التوجيه الذكي: ${mode.label} ✓`, 'ok');
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                    adv.smartRouting && (adv.smartRoutingMode || 'auto') === mode.key
                      ? 'bg-[#ffb454] text-[#1a1105] font-bold shadow-sm'
                      : 'text-[#8faea5] hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {onRunSpeedBenchmark && (
            <button
              type="button"
              onClick={onRunSpeedBenchmark}
              disabled={isBenchmarking}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#132c26] hover:bg-[#1a3d35] text-[#37d6c0] border border-[#235044] hover:border-[#37d6c0] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="فحص واختبار سرعة واستجابة كافة محركات الـ API في آنٍ واحد"
            >
              <Activity className={`w-3 h-3 ${isBenchmarking ? 'animate-spin' : ''}`} />
              <span>{isBenchmarking ? 'جارٍ الفحص…' : '⚡ فحص سرعة جميع المحركات'}</span>
            </button>
          )}
        </div>

        {/* Engine List */}
        <div className="p-3 overflow-y-auto max-h-[50vh] flex flex-col gap-1.5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#54736c]">
              لا توجد محركات تطابق بحثك &quot;{search}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isFocused = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleSelect(item)}
                  className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                    item.active
                      ? 'bg-[#37d6c015] border-[#37d6c066] shadow-[0_0_15px_rgba(55,214,192,0.15)] ring-1 ring-[#37d6c044]'
                      : isFocused
                      ? 'bg-[#112421] border-[#2d584f] text-white'
                      : 'bg-[#0a1715] border-[#18332c] hover:border-[#285046]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-3 h-3 rounded-full flex-none transition-all ${
                        item.active
                          ? 'bg-[#37d6c0] shadow-[0_0_8px_#37d6c0] animate-pulse'
                          : 'bg-[#344d47]'
                      }`}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white truncate">{item.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#06110f] text-[#8faea5] border border-[#1b342e] uppercase font-mono">
                          {item.provider}
                        </span>
                        {item.vision && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-[#3ddc8418] text-[#3ddc84] border border-[#3ddc8433] flex items-center gap-0.5">
                            👁️ Vision
                          </span>
                        )}
                        {item.latency !== undefined && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#102924] text-[#3ddc84] border border-[#1f4a3f] font-mono">
                            ⚡ {item.latency}ms
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8faea5] mt-0.5 truncate">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-none">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#071311] text-[#8faea5] border border-[#1b342e]">
                      {item.shortcut}
                    </span>
                    {item.active ? (
                      <span className="text-[10px] font-bold text-[#37d6c0] bg-[#0c241e] px-2 py-1 rounded-lg border border-[#1f4a3f] flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#37d6c0]" />
                        <span>نشط</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="text-[10px] font-bold text-[#cfe6df] hover:text-white bg-[#142925] hover:bg-[#1f423b] px-2.5 py-1 rounded-lg border border-[#23483f] flex items-center gap-1 transition-all"
                      >
                        <span>انتقال</span>
                        <ArrowRight className="w-3 h-3 text-[#37d6c0]" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & shortcut helper */}
        <div className="p-3 bg-[#081311] border-t border-[#18332c] flex items-center justify-between text-[11px] text-[#8faea5] flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#112421] text-[#cfe6df] border border-[#22403a] text-[10px]">
                ↑↓
              </kbd>
              <span>للتنقل</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#112421] text-[#cfe6df] border border-[#22403a] text-[10px]">
                Enter
              </kbd>
              <span>للانتقال الفوري</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#112421] text-[#cfe6df] border border-[#22403a] text-[10px]">
                Alt+1..9
              </kbd>
              <span>اختصارات مباشرة</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenApiModal();
            }}
            className="text-[#37d6c0] hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
          >
            <KeyRound className="w-3 h-3" />
            <span>إدارة وإضافة المحركات…</span>
          </button>
        </div>
      </div>
    </div>
  );
};
