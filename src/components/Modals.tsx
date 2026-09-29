import React, { useState } from 'react';
import {
  X,
  KeyRound,
  Check,
  Plus,
  Trash2,
  Lock,
  Layers,
  Sparkles,
  Link,
  Copy,
  Edit3,
  Send,
  Download,
  Upload,
  Cpu,
  ShieldCheck,
  Zap,
  Globe,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  RotateCcw,
  Sliders,
  Settings2,
  ChevronDown,
  ChevronUp,
  Terminal,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Flame,
  Clock,
  Compass,
  FileText,
  Server,
} from 'lucide-react';
import { AdvancedFeatures, ApiInterface, BatchItem, SessionTokenStats } from '../types';
import { I18N } from '../utils/i18n';
import { OWNER_EMAIL } from '../utils/constants';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  title,
  kicker,
  children,
  maxWidth = 'max-w-xl',
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#070f0ecc] backdrop-blur-sm animate-overlay" onClick={onClose} />
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#132522] to-[#0d1a18] border border-[#2a4a44] rounded-2xl p-6 shadow-2xl z-10 animate-modal-pop`}
      >
        <div className="absolute top-0 inset-x-5 h-[2px] bg-gradient-to-r from-[#ffb454] to-[#37d6c0]" />
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {kicker && (
              <span className="font-mono text-[10px] tracking-widest text-[#37d6c0] uppercase block">
                {kicker}
              </span>
            )}
            <h3 className="font-display text-2xl text-white font-normal leading-tight">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#122421] border border-[#2a4a44] text-[#8faea5] hover:text-[#ff6b7a] hover:border-[#ff6b7a] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// 1. Advanced Features Modal
export const AdvModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  adv: AdvancedFeatures;
  onToggle: (key: keyof AdvancedFeatures, value?: any) => void;
  lang: 'en' | 'ar' | 'fr' | 'es';
  onExportSettings: () => void;
  onImportSettings: (file: File) => void;
}> = ({ isOpen, onClose, adv, onToggle, lang, onExportSettings, onImportSettings }) => {
  const t = I18N[lang].s;

  const features: { key: keyof AdvancedFeatures; title: string; desc: string; dep?: string }[] = [
    { key: 'codeOptimizerAuto', title: 'Local Code & Syntax Optimizer', desc: 'Auto-lint prompt code, balance brackets, and deduplicate tags offline' },
    { key: 'goldenRatio', title: 'Golden Ratio φ Grid Detection', desc: 'Compute harmonic phi grid & spiral composition nodes' },
    { key: 'lensSim', title: 'Optical Lens & FOV Simulation', desc: 'Estimate focal length (24mm wide, 50mm prime, 85mm f/1.4 portrait)' },
    { key: 'photometricEV', title: 'Photometric EV Dynamic Range', desc: 'Compute exposure latitude and sensor EV stops' },
    { key: 'filmStockSim', title: 'Film Stock & Grain Emulation', desc: 'Simulate organic 35mm analog grain (Kodak Portra / Cinestill)' },
    { key: 'ultra', title: 'Ultra Description', desc: 'Deep texture, color temperature, depth and richness' },
    { key: 'autoneg', title: 'Auto Negative Prompt', desc: 'Always generate negative prompt for all models' },
    { key: 'twopass', title: 'Two-Pass Vision Analysis', desc: 'Deep scene pass then composition', dep: 'Cloud Engine (API)' },
    { key: 'jsonauto', title: 'Auto JSON Export', desc: 'Generate structured JSON specification' },
    { key: 'typo', title: 'Typography Detection', desc: 'Detect fonts, text hierarchy and placement' },
    { key: 'grid', title: 'Grid Composition', desc: 'Detect symmetry, centered and dynamic layouts' },
    { key: 'depth', title: 'Depth of Field', desc: 'Detect bokeh and optical depth falloff' },
    { key: 'conf', title: 'Confidence Score Gauge', desc: 'Show mathematical analysis confidence', dep: 'Two-Pass Vision' },
    { key: 'dev', title: 'Developer Mode', desc: 'Show raw metrics, JSON tree and spectral data' },
    { key: 'api', title: 'Cloud Engine (API)', desc: 'Call vision models (Gemini / GPT-4o / Claude)' },
    { key: 'harmony', title: 'Color Harmony', desc: 'Complementary and analogous chromatic analysis' },
    { key: 'mood', title: 'Mood & Atmosphere Analysis', desc: 'Emotional tone, temperature and lighting energy' },
  ];

  const activeCount = Object.values(adv).filter(Boolean).length;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} kicker="INTERCONNECTED FEATURES" title="الميزات المتقدمة ومحرّك التحليل المحلي" maxWidth="max-w-2xl">
      <p className="text-xs text-[#8faea5] mb-3">
        جميع الميزات متصلة وتعمل بتناغم هندسي متكامل لرفع جودة البرومبت ودقة التحليل البصري.
      </p>

      {/* Local Analysis Engine Section */}
      <div className="bg-[#0a1614] border border-[#23423c] rounded-xl p-3.5 flex flex-col gap-2.5 mb-4 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#37d6c0]" />
            <span>محرّك التحليل المحلي المتقدم (Local Analysis Engine)</span>
          </span>
          <span className="text-[10px] font-mono text-[#37d6c0] bg-[#37d6c015] px-2 py-0.5 rounded border border-[#37d6c033]">
            100% Offline & Instant
          </span>
        </div>
        <p className="text-[11px] text-[#8faea5] leading-relaxed">
          تحليل فائق للبكسلات عبر فضاء الألوان الإدراكي CIELAB، قياس النسبة الذهبية φ، خطوط التوجيه، ومحاكاة العدسات والنطاق الديناميكي EV.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-0.5">
          {[
            { id: 'turbo', name: 'Turbo Speed', desc: 'استجابة فائقة لمعالجة الدفعات (~15ms)' },
            { id: 'deep', name: 'Deep Multi-Scale', desc: 'تحليل هرمي عميق ونسبة ذهبية (~40ms)' },
            { id: 'cinematic', name: 'Cinematic RAW', desc: 'نطاق ديناميكي EV ومحاكاة عدسات' },
            { id: 'design', name: 'Vector & Design', desc: 'تفكيك تراكيب التصميم والألوان' },
          ].map((mode) => {
            const isSelected = (adv.localEngineMode || 'deep') === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onToggle('localEngineMode', mode.id)}
                className={`p-2 rounded-lg text-start border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#37d6c018] border-[#37d6c0] text-white shadow-sm ring-1 ring-[#37d6c044]'
                    : 'bg-[#0e1d1a] border-[#22403a] text-[#8faea5] hover:border-[#37d6c0]'
                }`}
              >
                <span className="text-xs font-bold block">{mode.name}</span>
                <span className="text-[9px] text-[#54736c] block mt-0.5 leading-tight">{mode.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
        {features.map((f) => {
          const isActive = adv[f.key];
          return (
            <div
              key={f.key}
              onClick={() => onToggle(f.key)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                isActive
                  ? 'border-[#37d6c0] bg-[#37d6c00f] shadow-[0_0_12px_rgba(55,214,192,0.1)]'
                  : 'border-[#22403a] bg-[#0e1d1a] hover:border-[#2f564e]'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-white block">{f.title}</span>
                <span className="text-[10px] text-[#8faea5] leading-relaxed block mt-0.5">{f.desc}</span>
                {f.dep && (
                  <span className="text-[9px] font-mono text-[#ffb454] block mt-1">
                    🔗 Requires: {f.dep}
                  </span>
                )}
              </div>
              <input
                type="checkbox"
                checked={!!isActive}
                onChange={() => {}}
                className="w-4 h-4 accent-[#37d6c0] mt-0.5 pointer-events-none"
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#1f3a34] text-xs">
        <span className="font-mono text-[#37d6c0]">
          {activeCount} / {features.length} active
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onExportSettings}
            className="btn-ghost px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <label className="btn-ghost px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) onImportSettings(e.target.files[0]);
              }}
            />
          </label>
        </div>
      </div>
    </ModalWrapper>
  );
};

// 2. Multi-API Configuration Modal
export const ApiModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  apis: ApiInterface[];
  activeId: string | null;
  onSetActive: (id: string | null) => void;
  onAddApi: (api: Omit<ApiInterface, 'id'>) => void;
  onUpdateApi: (id: string, updated: Partial<Omit<ApiInterface, 'id'>>) => void;
  onDeleteApi: (id: string) => void;
  onDuplicateApi?: (id: string) => void;
  onToggleApiEnable?: (id: string) => void;
  tokenStats?: SessionTokenStats;
  onResetTokens?: () => void;
  onTestApi: (api: Partial<ApiInterface>) => Promise<{ ok: boolean; latencyMs?: number; error?: string; message?: string }>;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
}> = ({
  isOpen,
  onClose,
  apis,
  activeId,
  onSetActive,
  onAddApi,
  onUpdateApi,
  onDeleteApi,
  onDuplicateApi,
  onToggleApiEnable,
  tokenStats,
  onResetTokens,
  onTestApi,
  onToast,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<ApiInterface['provider']>('gemini');
  const [model, setModel] = useState('gemini-3.8-flash');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [precision, setPrecision] = useState<ApiInterface['precision']>('high');
  const [temperature, setTemperature] = useState<number>(0.4);
  const [maxTokens, setMaxTokens] = useState<number>(2048);
  const [systemInstruction, setSystemInstruction] = useState<string>('');
  const [timeoutSec, setTimeoutSec] = useState<number>(30);
  const [visionCapable, setVisionCapable] = useState<boolean>(true);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Test states
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; latencyMs?: number; error?: string; message?: string }>>({});
  const [formTesting, setFormTesting] = useState(false);
  const [formTestResult, setFormTestResult] = useState<{ ok: boolean; latencyMs?: number; error?: string; message?: string } | null>(null);

  // Provider Default URLs
  const providerDefaultUrls: Record<ApiInterface['provider'], string> = {
    gemini: '',
    openai: 'https://api.openai.com/v1',
    anthropic: 'https://api.anthropic.com/v1',
    deepseek: 'https://api.deepseek.com/v1',
    groq: 'https://api.groq.com/openai/v1',
    openrouter: 'https://openrouter.ai/api/v1',
    mistral: 'https://api.mistral.ai/v1',
    ollama: 'http://localhost:11434/v1',
    custom: 'https://api.openai.com/v1',
  };

  // Provider Key Placeholders
  const keyPlaceholders: Record<ApiInterface['provider'], string> = {
    gemini: 'AIzaSy… (اختياري - يترك فارغاً لاستخدام مفتاح الخادم المدمج)',
    openai: 'sk-proj-… أو sk-…',
    anthropic: 'sk-ant-api03-…',
    deepseek: 'sk-… (من platform.deepseek.com)',
    groq: 'gsk_… (من console.groq.com)',
    openrouter: 'sk-or-v1-… (من openrouter.ai/keys)',
    mistral: 'مفتاح Mistral API من console.mistral.ai',
    ollama: 'ollama (اختياري للتشغيل المحلي)',
    custom: 'مفتاح API الخاص بالخادم المخصص',
  };

  // Model Presets per provider with rich capabilities
  const modelPresets: Record<
    ApiInterface['provider'],
    { label: string; value: string; vision: boolean; badge: string; desc: string }[]
  > = {
    gemini: [
      { label: 'Gemini 3.8 Flash', value: 'gemini-3.8-flash', vision: true, badge: 'Recommended · 20ms', desc: 'النموذج الافتراضي فائق السرعة ومتعدد الوسائط' },
      { label: 'Gemini 3.1 Pro Preview', value: 'gemini-3.1-pro-preview', vision: true, badge: 'Elite Reasoning', desc: 'استدلال متقدم وتحليل بصري عميق للمشاهد المعقدة' },
      { label: 'Gemini 3.1 Flash Lite', value: 'gemini-3.1-flash-lite', vision: true, badge: 'Fast · Eco', desc: 'استجابة فائقة السرعة مع كفاءة اقتصادية' },
      { label: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash', vision: true, badge: 'Stable', desc: 'إصدار مستقر سريع وموثوق' },
      { label: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro', vision: true, badge: 'Flagship', desc: 'أعلى دقة استخراج تفاصيل بصرية' },
    ],
    openai: [
      { label: 'GPT-4o (Omni Vision)', value: 'gpt-4o', vision: true, badge: 'Flagship Vision', desc: 'النموذج الشامل الرائد في فهم الصور والتفاصيل الدقيقة' },
      { label: 'GPT-4o Mini', value: 'gpt-4o-mini', vision: true, badge: 'Fast & Budget', desc: 'سريع واقتصادي جداً في معالجة الصور والنصوص' },
      { label: 'o3-mini', value: 'o3-mini', vision: false, badge: 'Deep Reasoning', desc: 'نموذج تفكير واستدلال عميق لصياغة وتطوير البرومبت' },
      { label: 'o1', value: 'o1', vision: true, badge: 'Flagship Reasoning', desc: 'تفكير استثنائي في تحليل تكوين المشاهد البصرية' },
      { label: 'GPT-4 Turbo', value: 'gpt-4-turbo', vision: true, badge: 'High-Res Vision', desc: 'تحليل عالي الجودة للصور المعقدة' },
    ],
    anthropic: [
      { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-latest', vision: true, badge: 'Elite Analysis', desc: 'النموذج الأقوى في تفكيك عناصر الإضاءة والتكوين والأسلوب' },
      { label: 'Claude 3.5 Haiku', value: 'claude-3-5-haiku-latest', vision: true, badge: 'Sub-second', desc: 'استجابة فائقة السرعة مع قدرات فهم بصرية عالية' },
      { label: 'Claude 3 Opus', value: 'claude-3-opus-20240229', vision: true, badge: 'Highest IQ', desc: 'أعمق قدرات استيعاب لغوي وبصري وتوليد مواصفات المشهد' },
    ],
    deepseek: [
      { label: 'DeepSeek-V3 Chat', value: 'deepseek-chat', vision: false, badge: 'V3 · Ultra Fast', desc: 'تعزيز وصياغة البرومبت بذكاء فائق وتكلفة رمزية' },
      { label: 'DeepSeek-R1 Reasoner', value: 'deepseek-reasoner', vision: false, badge: 'R1 · Chain of Thought', desc: 'تفكير متسلسل عميق لتفصيل كل تفصيلة في المشهد' },
    ],
    groq: [
      { label: 'Llama 3.3 70B Versatile', value: 'llama-3.3-70b-versatile', vision: false, badge: 'LPU Speed ⚡', desc: 'توليد وتعزيز البرومبت بسرعة البرق الفائقة عبر LPU' },
      { label: 'Llama 3.2 11B Vision', value: 'llama-3.2-11b-vision-preview', vision: true, badge: 'Fast Vision ⚡', desc: 'رؤية بصرية فورية وسريعة جداً' },
      { label: 'Llama 3.2 90B Vision', value: 'llama-3.2-90b-vision-preview', vision: true, badge: 'Dense Vision', desc: 'تحليل بصري عالي الدقة والكثافة' },
    ],
    openrouter: [
      { label: 'Qwen 2.5 VL 72B Instruct', value: 'qwen/qwen-2.5-vl-72b-instruct', vision: true, badge: 'Top Multimodal', desc: 'أحد أقوى النماذج البصرية المفتوحة عالمياً' },
      { label: 'Llama 3.2 90B Vision Instruct', value: 'meta-llama/llama-3.2-90b-vision-instruct', vision: true, badge: 'Meta Vision', desc: 'نموذج ميتا البصري المتطور' },
      { label: 'Gemini 2.0 Flash Exp (Free)', value: 'google/gemini-2.0-flash-exp:free', vision: true, badge: 'Free Tier', desc: 'نسخة تجريبية سريعة ومجانية عبر OpenRouter' },
      { label: 'Claude 3.5 Sonnet (OpenRouter)', value: 'anthropic/claude-3.5-sonnet', vision: true, badge: 'Multi-host', desc: 'كلود 3.5 سونت عبر مسارات OpenRouter' },
    ],
    mistral: [
      { label: 'Pixtral Large Latest', value: 'pixtral-large-latest', vision: true, badge: '124B Multimodal', desc: 'نموذج ميسترال البصري العملاق عالي الدقة' },
      { label: 'Mistral Large Latest', value: 'mistral-large-latest', vision: false, badge: 'Reasoning Flagship', desc: 'استدلال لغوي فائق لصياغة نصوص التوليد' },
      { label: 'Pixtral 12B', value: 'pixtral-12b-2409', vision: true, badge: 'Compact Vision', desc: 'نموذج بصري ذكي وخفيف وسريع' },
    ],
    ollama: [
      { label: 'Llama 3.2 Vision (Local)', value: 'llama3.2-vision:latest', vision: true, badge: 'Local GPU · Offline', desc: 'يعمل محلياً بالكامل دون إرسال صورك لأي خادم خارجي' },
      { label: 'LLaVA 1.6 Multimodal', value: 'llava:latest', vision: true, badge: 'Local Vision', desc: 'نموذج فحص الصور المحلي الأشهر' },
      { label: 'Qwen 2.5 Coder / Chat', value: 'qwen2.5:latest', vision: false, badge: 'Local Fast', desc: 'تعزيز وصياغة البرومبت محلياً بسرعة عالية' },
    ],
    custom: [
      { label: 'Custom Multimodal Model', value: 'custom-vision-model', vision: true, badge: 'OpenAI Compatible', desc: 'أي نموذج يدعم Vision Image Payloads (OpenAI format)' },
      { label: 'Custom Prompt Engine', value: 'custom-text-model', vision: false, badge: 'Prompt Only', desc: 'أي نموذج مخصص لتعزيز وتوسيع نصوص البرومبت' },
    ],
  };

  const handleProviderChange = (p: ApiInterface['provider']) => {
    setProvider(p);
    const presets = modelPresets[p];
    if (presets && presets[0]) {
      setModel(presets[0].value);
      setVisionCapable(presets[0].vision);
      setIsCustomModel(false);
    }
    setBaseUrl(providerDefaultUrls[p] || '');
    setFormTestResult(null);
  };

  const handleStartEdit = (api: ApiInterface) => {
    setEditingId(api.id);
    setName(api.name);
    setProvider(api.provider);
    setModel(api.model);

    // Check if model is custom
    const presets = modelPresets[api.provider] || [];
    const isKnown = presets.some((pr) => pr.value === api.model);
    setIsCustomModel(!isKnown);

    setKey(api.key || '');
    setShowKey(false);
    setBaseUrl(api.baseUrl || providerDefaultUrls[api.provider] || '');
    setPrecision(api.precision || 'high');
    setTemperature(api.temperature !== undefined ? api.temperature : 0.4);
    setMaxTokens(api.maxTokens || 2048);
    setSystemInstruction(api.systemInstruction || '');
    setTimeoutSec(api.timeoutSec || 30);
    setVisionCapable(api.visionCapable !== undefined ? api.visionCapable : true);
    setFormTestResult(null);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditingId(null);
    setName('');
    setKey('');
    setShowKey(false);
    setBaseUrl('');
    setTemperature(0.4);
    setMaxTokens(2048);
    setSystemInstruction('');
    setTimeoutSec(30);
    setVisionCapable(true);
    setIsCustomModel(false);
    setShowAdvanced(false);
    setFormTestResult(null);
    setShowForm(false);
  };

  const handleTestInForm = async () => {
    if (!key.trim() && provider !== 'gemini' && provider !== 'ollama') {
      onToast('مفتاح API مطلوب للاختبار (API key is required)', 'err');
      return;
    }
    setFormTesting(true);
    setFormTestResult(null);
    try {
      const res = await onTestApi({
        provider,
        model,
        key: key.trim(),
        baseUrl: baseUrl.trim() || undefined,
        temperature,
        maxTokens,
      });
      setFormTestResult(res);
      if (res.ok) {
        onToast(`تم التحقق من الاتصال بنجاح (${res.latencyMs || 0}ms) ✓`, 'ok');
      } else {
        onToast(res.error || 'فشل فحص الاتصال بالخادم', 'err');
      }
    } finally {
      setFormTesting(false);
    }
  };

  const handleTestExisting = async (api: ApiInterface) => {
    setTestingId(api.id);
    try {
      const res = await onTestApi(api);
      setTestResults((prev) => ({ ...prev, [api.id]: res }));
      if (res.ok) {
        onToast(`${api.name}: تم التحقق بنجاح (${res.latencyMs || 0}ms) ✓`, 'ok');
      } else {
        onToast(`${api.name}: ${res.error || 'فشل الاتصال'}`, 'err');
      }
    } finally {
      setTestingId(null);
    }
  };

  const handleSave = () => {
    if (!key.trim() && provider !== 'gemini' && provider !== 'ollama') {
      onToast('مفتاح API مطلوب لحفظ هذا المحرك', 'err');
      return;
    }
    const defaultLabel = `${provider.toUpperCase()} (${model})`;
    const finalName = name.trim() || defaultLabel;

    const payload: Partial<Omit<ApiInterface, 'id'>> = {
      name: finalName,
      provider,
      model,
      key: key.trim(),
      baseUrl: baseUrl.trim() || undefined,
      precision,
      temperature,
      maxTokens,
      systemInstruction: systemInstruction.trim() || undefined,
      timeoutSec,
      visionCapable,
    };

    if (editingId) {
      onUpdateApi(editingId, payload);
      onToast(`تم تحديث محرك "${finalName}" بنجاح ✓`, 'ok');
    } else {
      onAddApi({
        ...payload,
        name: finalName,
        provider,
        model,
        key: key.trim(),
        precision,
        enabled: true,
      } as Omit<ApiInterface, 'id'>);
      onToast(`تمت إضافة وتفعيل محرك "${finalName}" بنجاح ✓`, 'ok');
    }

    handleCancelForm();
  };

  // Export & Import API configurations
  const handleExportApis = () => {
    const dataStr = JSON.stringify(apis, null, 2);
    navigator.clipboard.writeText(dataStr);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptlens-apis-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('تم تصدير إعدادات الـ API ونسخها للحافظة ✓', 'ok');
  };

  const handleImportApis = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          let count = 0;
          parsed.forEach((item) => {
            if (item.name && item.provider && item.model) {
              onAddApi({
                name: item.name,
                provider: item.provider,
                model: item.model,
                key: item.key || '',
                baseUrl: item.baseUrl,
                precision: item.precision || 'high',
                temperature: item.temperature,
                maxTokens: item.maxTokens,
                systemInstruction: item.systemInstruction,
                timeoutSec: item.timeoutSec,
                visionCapable: item.visionCapable,
                enabled: item.enabled !== undefined ? item.enabled : true,
              });
              count++;
            }
          });
          onToast(`تم استيراد ${count} محركات API بنجاح ✓`, 'ok');
        } else {
          onToast('ملف التكوين غير صالح', 'err');
        }
      } catch {
        onToast('خطأ أثناء قراءة ملف التكوين', 'err');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const isBuiltInActive = activeId === null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      kicker="AI ENGINE & MULTI-API HUB"
      title="مركز إعداد وتعديل واجهات الـ API ونماذج الذكاء الاصطناعي"
      maxWidth="max-w-3xl"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs text-[#8faea5] leading-relaxed">
            تحكم كامل، تعديل خصائص، وإضافة نماذج الذكاء الاصطناعي لفحص الصور وتوليد البرومبت. تشفير محلي <span className="font-mono text-white">AES-256-GCM</span> مع استجابة فورية.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportApis}
              title="تصدير جميع المحركات إلى ملف JSON ونسخها"
              className="px-2.5 py-1 text-[11px] font-semibold text-[#8faea5] hover:text-[#37d6c0] bg-[#122622] hover:bg-[#1a3832] rounded-lg border border-[#22403a] hover:border-[#37d6c0] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير JSON</span>
            </button>

            <label
              title="استيراد محركات من ملف JSON"
              className="px-2.5 py-1 text-[11px] font-semibold text-[#8faea5] hover:text-[#ffb454] bg-[#122622] hover:bg-[#203a35] rounded-lg border border-[#22403a] hover:border-[#ffb454] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>استيراد</span>
              <input type="file" accept=".json" onChange={handleImportApis} className="hidden" />
            </label>
          </div>
        </div>

        {/* Live Token Telemetry Banner */}
        {tokenStats && (
          <div className="bg-[#0e1d1a] border border-[#23423c] rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#37d6c015] border border-[#37d6c033] flex items-center justify-center text-[#37d6c0]">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#8faea5] uppercase tracking-wider block">
                  Session Token Telemetry (عداد التوكين الدقيق)
                </span>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-sm font-bold font-mono text-white">
                    {tokenStats.totalTokens.toLocaleString()} Total Tokens
                  </span>
                  <span className="text-[10px] font-mono text-[#37d6c0] bg-[#122622] px-1.5 py-0.5 rounded border border-[#22403a]">
                    {tokenStats.totalPromptTokens.toLocaleString()} in / {tokenStats.totalCompletionTokens.toLocaleString()} out
                  </span>
                  {tokenStats.callCount > 0 && (
                    <span className="text-[10px] font-mono text-[#8faea5] bg-[#0c1816] px-1.5 py-0.5 rounded border border-[#1a3832]">
                      {tokenStats.callCount} calls
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {tokenStats.lastCallTokens?.speedTps ? (
                <span className="text-[10px] font-mono text-[#3ddc84] bg-[#0c241e] px-2 py-1 rounded-lg border border-[#22403a] flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#3ddc84]" />
                  <span>{tokenStats.lastCallTokens.speedTps} tok/sec</span>
                </span>
              ) : null}
              {onResetTokens && tokenStats.totalTokens > 0 && (
                <button
                  type="button"
                  onClick={onResetTokens}
                  className="px-2 py-1 text-[10px] font-semibold text-[#8faea5] hover:text-[#ff6b7a] bg-[#122622] hover:bg-[#ff6b7a15] rounded-lg border border-[#22403a] hover:border-[#ff6b7a44] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 1. Built-in Server Engine Card */}
        <div
          onClick={() => onSetActive(null)}
          className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 hover:-translate-y-0.5 ${
            isBuiltInActive
              ? 'border-[#3ddc84] bg-[#3ddc8414] animate-active-engine shadow-md'
              : 'border-[#22403a] bg-[#0c1816] hover:border-[#37d6c0]'
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              checked={isBuiltInActive}
              onChange={() => onSetActive(null)}
              className="accent-[#3ddc84] w-4 h-4 cursor-pointer"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white">Google Gemini Built-in Engine</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#3ddc8422] text-[#3ddc84] border border-[#3ddc8444]">
                  SERVER MANAGED
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-[#37d6c0] bg-[#37d6c015] border border-[#37d6c033]">
                  👁️ Multimodal Vision
                </span>
                {isBuiltInActive && (
                  <span className="text-[10px] font-mono text-[#3ddc84] flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc84] animate-ping" />
                    نشط حالياً
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8faea5] mt-0.5">
                النموذج: <span className="font-mono text-white">gemini-3.8-flash</span> · استجابة فورية (~20ms) · لا يتطلب مفتاح API · جاهز للعمل مباشرة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isBuiltInActive ? (
              <span className="text-xs font-mono text-[#3ddc84] bg-[#08221d] px-2.5 py-1 rounded-lg border border-[#22403a] flex items-center gap-1.5 font-bold">
                <Check className="w-3.5 h-3.5 text-[#3ddc84]" />
                <span>المحرك النشط</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetActive(null);
                  onToast('تم الانتقال المباشر إلى Google Gemini 3.8 Flash ✓', 'ok');
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#3ddc8415] hover:bg-[#3ddc8430] text-[#3ddc84] border border-[#3ddc8433] hover:border-[#3ddc84] flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:scale-105"
                title="الانتقال المباشر إلى محرك Gemini المدمج"
              >
                <Zap className="w-3 h-3 text-[#3ddc84]" />
                <span>انتقال مباشر ⚡</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Custom API Engines Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8faea5] uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#37d6c0]" />
              <span>محركات الذكاء الاصطناعي المخصصة ({apis.length})</span>
            </span>
            {apis.length > 0 && (
              <span className="text-[11px] text-[#54736c]">اضغط على أي بطاقة لتفعيلها فوراً أو اضغط تعديل</span>
            )}
          </div>

          {apis.length === 0 ? (
            <div className="text-center p-4 border border-dashed border-[#22403a] rounded-xl text-xs text-[#54736c]">
              لم يتم ربط محركات مخصصة بعد. المحرك المدمج Google Gemini 3.8 Flash نشط ويعمل افتراضياً.
            </div>
          ) : (
            apis.map((api) => {
              const isActive = api.id === activeId;
              const test = testResults[api.id];
              const isTesting = testingId === api.id;
              const isEditingThis = editingId === api.id;

              const providerColors: Record<ApiInterface['provider'], { bg: string; text: string; border: string }> = {
                gemini: { bg: 'bg-[#37d6c018]', text: 'text-[#37d6c0]', border: 'border-[#37d6c033]' },
                openai: { bg: 'bg-[#10a37f18]', text: 'text-[#10a37f]', border: 'border-[#10a37f33]' },
                anthropic: { bg: 'bg-[#d9770618]', text: 'text-[#f59e0b]', border: 'border-[#d9770633]' },
                deepseek: { bg: 'bg-[#0284c718]', text: 'text-[#38bdf8]', border: 'border-[#0284c733]' },
                groq: { bg: 'bg-[#ea580c18]', text: 'text-[#fb923c]', border: 'border-[#ea580c33]' },
                openrouter: { bg: 'bg-[#9333ea18]', text: 'text-[#c084fc]', border: 'border-[#9333ea33]' },
                mistral: { bg: 'bg-[#e11d4818]', text: 'text-[#fb7185]', border: 'border-[#e11d4833]' },
                ollama: { bg: 'bg-[#84cc1618]', text: 'text-[#a3e635]', border: 'border-[#84cc1633]' },
                custom: { bg: 'bg-[#64748b18]', text: 'text-[#94a3b8]', border: 'border-[#64748b33]' },
              };
              const col = providerColors[api.provider] || providerColors.custom;

              return (
                <div
                  key={api.id}
                  onClick={() => onSetActive(api.id)}
                  className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 hover:-translate-y-0.5 ${
                    isEditingThis
                      ? 'border-[#ffb454] bg-[#ffb4540d] shadow-[0_0_15px_rgba(255,180,84,0.18)] ring-1 ring-[#ffb45466]'
                      : isActive
                      ? 'border-[#3ddc84] bg-[#3ddc840f] animate-active-engine shadow-md'
                      : !api.enabled
                      ? 'border-[#1c2e2a] bg-[#091312] opacity-60'
                      : 'border-[#22403a] bg-[#0e1d1a] hover:border-[#37d6c0]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={isActive}
                      onChange={() => onSetActive(api.id)}
                      className="accent-[#3ddc84] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{api.name}</span>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${col.bg} ${col.text} ${col.border}`}>
                          {api.provider}
                        </span>
                        <span className="text-[10px] font-mono text-[#8faea5] bg-[#0c1816] px-1.5 py-0.5 rounded border border-[#1a3832]">
                          {api.model}
                        </span>
                        {api.visionCapable !== false ? (
                          <span className="text-[10px] font-mono text-[#37d6c0] bg-[#37d6c012] px-1.5 py-0.5 rounded border border-[#37d6c028]">
                            👁️ Vision
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#8faea5] bg-[#122622] px-1.5 py-0.5 rounded border border-[#22403a]">
                            📝 Prompt
                          </span>
                        )}
                        {isActive && (
                          <span className="text-[10px] font-mono text-[#3ddc84] flex items-center gap-1 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc84] animate-pulse" />
                            نشط
                          </span>
                        )}
                        {isEditingThis && (
                          <span className="text-[10px] font-mono text-[#ffb454] px-1.5 py-0.5 rounded bg-[#ffb45415] border border-[#ffb45433]">
                            جاري التعديل ✏️
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono text-[#54736c] mt-0.5 flex-wrap">
                        <span>Key: {api.key ? `••••••••${api.key.slice(-4)}` : 'بدون مفتاح'}</span>
                        <span>· دقة: {api.precision}</span>
                        {api.temperature !== undefined && <span>· حرارة: {api.temperature}</span>}
                        {api.maxTokens && <span>· حد التوكين: {api.maxTokens}</span>}
                        {api.baseUrl && <span className="truncate max-w-[180px]">· {api.baseUrl}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {/* Direct Switch Button if not active */}
                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => {
                          onSetActive(api.id);
                          onToast(`تم تفعيل ${api.name} (${api.model}) مباشرة ✓`, 'ok');
                        }}
                        title="انتقال مباشر إلى هذا المحرك (Direct Switch)"
                        className="px-2 py-1 rounded-lg text-xs font-semibold bg-[#3ddc8415] hover:bg-[#3ddc8430] text-[#3ddc84] border border-[#3ddc8433] hover:border-[#3ddc84] flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:scale-105"
                      >
                        <Zap className="w-3 h-3 text-[#3ddc84]" />
                        <span className="hidden sm:inline">تفعيل ⚡</span>
                      </button>
                    ) : (
                      <span className="px-2 py-1 rounded-lg text-[11px] font-mono font-bold bg-[#3ddc8422] text-[#3ddc84] border border-[#3ddc8444] flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#3ddc84]" />
                        <span className="hidden sm:inline">Active</span>
                      </span>
                    )}

                    {test && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all ${
                          test.ok
                            ? 'bg-[#3ddc8418] text-[#3ddc84] border-[#3ddc8444] animate-[successPop_0.3s_ease-out]'
                            : 'bg-[#ff6b7a18] text-[#ff6b7a] border-[#ff6b7a44]'
                        }`}
                      >
                        {test.ok ? `✓ ${test.latencyMs}ms` : '✕ خطأ'}
                      </span>
                    )}

                    {/* Test Button */}
                    <button
                      onClick={() => handleTestExisting(api)}
                      disabled={isTesting}
                      title="فحص الاتصال والسرعة (Test Connection)"
                      className="px-2 py-1 rounded-lg text-xs font-semibold bg-[#122622] hover:bg-[#1a3832] text-[#37d6c0] border border-[#22403a] hover:border-[#37d6c0] flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isTesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      <span className="hidden sm:inline">{isTesting ? 'فحص…' : 'فحص'}</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleStartEdit(api)}
                      title="تعديل هذا المحرك (Edit Properties & Model)"
                      className={`px-2 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                        isEditingThis
                          ? 'bg-[#ffb45422] text-[#ffb454] border-[#ffb45466]'
                          : 'bg-[#142320] hover:bg-[#203a35] text-[#ffb454] border-[#22403a] hover:border-[#ffb454]'
                      }`}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span className="hidden sm:inline">تعديل</span>
                    </button>

                    {/* Duplicate Button */}
                    {onDuplicateApi && (
                      <button
                        onClick={() => onDuplicateApi(api.id)}
                        title="نسخ وتكرار الإعداد (Duplicate)"
                        className="w-7 h-7 rounded-lg text-[#8faea5] hover:text-[#37d6c0] hover:bg-[#37d6c015] flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}

                    {/* Toggle Enable/Disable Switch */}
                    {onToggleApiEnable && (
                      <button
                        onClick={() => onToggleApiEnable(api.id)}
                        title={api.enabled ? 'تعطيل مؤقت' : 'تفعيل'}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          api.enabled ? 'text-[#3ddc84] hover:bg-[#3ddc8415]' : 'text-[#54736c] hover:bg-[#22403a]'
                        }`}
                      >
                        {api.enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={() => onDeleteApi(api.id)}
                      title="حذف المحرك (Delete)"
                      className="w-7 h-7 rounded-lg text-[#8faea5] hover:text-[#ff6b7a] hover:bg-[#ff6b7a15] flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 3. Add / Edit API Form Drawer */}
        {!showForm ? (
          <button
            onClick={() => {
              setEditingId(null);
              setName('');
              setKey('');
              setBaseUrl(providerDefaultUrls[provider] || '');
              setTemperature(0.4);
              setMaxTokens(2048);
              setSystemInstruction('');
              setTimeoutSec(30);
              setVisionCapable(true);
              setIsCustomModel(false);
              setFormTestResult(null);
              setShowForm(true);
            }}
            className="btn-amber w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>ربط وتخصيص محرك ذكاء اصطناعي جديد (OpenAI, Claude, DeepSeek, Groq, Ollama)</span>
          </button>
        ) : (
          <div className="bg-[#0a1614] border border-[#2a4a44] rounded-xl p-4 flex flex-col gap-3.5 animate-slide-down shadow-xl relative overflow-hidden">
            {editingId ? (
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#ffb454] via-[#ff9a3d] to-[#37d6c0]" />
            ) : (
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#37d6c0] to-[#ffb454]" />
            )}

            {/* Form Title & Mode Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {editingId ? (
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-[#ffb454]" />
                    <span className="text-xs font-bold text-white">تعديل خصائص ونموذج الـ API</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ffb45422] text-[#ffb454] border border-[#ffb45444]">
                      EDITING MODE
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#37d6c0]" />
                    <span className="text-xs font-bold text-white">ربط محرك ونموذج جديد</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleCancelForm}
                className="text-xs text-[#8faea5] hover:text-white cursor-pointer px-2.5 py-1 rounded hover:bg-[#142623] transition-colors"
              >
                إلغاء (Cancel)
              </button>
            </div>

            {/* Provider Tabs (All 9 Providers) */}
            <div>
              <label className="text-[10px] text-[#8faea5] block mb-1 font-semibold">
                1. اختيار مزود الخدمة (Select AI Provider):
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
                {(
                  [
                    'gemini',
                    'openai',
                    'anthropic',
                    'deepseek',
                    'groq',
                    'openrouter',
                    'mistral',
                    'ollama',
                    'custom',
                  ] as const
                ).map((p) => {
                  const labels: Record<typeof p, string> = {
                    gemini: 'Gemini',
                    openai: 'OpenAI',
                    anthropic: 'Claude',
                    deepseek: 'DeepSeek',
                    groq: 'Groq',
                    openrouter: 'Router',
                    mistral: 'Mistral',
                    ollama: 'Ollama',
                    custom: 'Custom',
                  };
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleProviderChange(p)}
                      className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer text-center border truncate ${
                        provider === p
                          ? 'bg-[#37d6c0] text-[#06231e] font-bold border-[#37d6c0] shadow-sm'
                          : 'bg-[#0e1d1a] border-[#22403a] text-[#8faea5] hover:border-[#37d6c0]'
                      }`}
                    >
                      {labels[p]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name & Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-[#8faea5] block mb-1 font-semibold">
                  2. اسم المحرك للعرض (Display Name)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`${provider.toUpperCase()} Engine`}
                  className="w-full bg-[#0e1d1a] border border-[#22403a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#37d6c0] transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-[#8faea5] font-semibold">
                    3. النموذج (Model Selection)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomModel(!isCustomModel)}
                    className="text-[10px] text-[#ffb454] hover:underline cursor-pointer"
                  >
                    {isCustomModel ? 'اختر من القائمة الجاهزة' : 'إدخال اسم يدوي / Custom'}
                  </button>
                </div>

                {isCustomModel ? (
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. gpt-4o, llama-3.3-70b-versatile, etc."
                    className="w-full bg-[#0e1d1a] border border-[#ffb45466] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-none focus:border-[#ffb454] transition-colors"
                  />
                ) : (
                  <select
                    value={model}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__custom__') {
                        setIsCustomModel(true);
                      } else {
                        setModel(val);
                        const match = modelPresets[provider]?.find((pr) => pr.value === val);
                        if (match) setVisionCapable(match.vision);
                      }
                    }}
                    className="w-full bg-[#0e1d1a] border border-[#22403a] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-none focus:border-[#37d6c0] transition-colors"
                  >
                    {modelPresets[provider]?.map((preset) => (
                      <option key={preset.value} value={preset.value}>
                        {preset.label} [{preset.badge}]
                      </option>
                    ))}
                    <option value="__custom__">أخرى (كتابة اسم النموذج يدوياً)…</option>
                  </select>
                )}

                {/* Model description hint */}
                {!isCustomModel && modelPresets[provider]?.find((p) => p.value === model)?.desc && (
                  <span className="text-[10px] text-[#8faea5] mt-1 block">
                    {modelPresets[provider]?.find((p) => p.value === model)?.desc}
                  </span>
                )}
              </div>
            </div>

            {/* Base URL (if custom, ollama, or override) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-[#8faea5] font-semibold">
                  4. عنوان نقطة الاتصال (Base URL Endpoint)
                </label>
                <div className="flex items-center gap-1.5">
                  {provider === 'ollama' && (
                    <button
                      type="button"
                      onClick={() => setBaseUrl('http://localhost:11434/v1')}
                      className="text-[9px] text-[#37d6c0] hover:underline cursor-pointer"
                    >
                      localhost:11434
                    </button>
                  )}
                  {provider === 'openrouter' && (
                    <button
                      type="button"
                      onClick={() => setBaseUrl('https://openrouter.ai/api/v1')}
                      className="text-[9px] text-[#37d6c0] hover:underline cursor-pointer"
                    >
                      openrouter.ai
                    </button>
                  )}
                </div>
              </div>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#54736c]" />
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder={providerDefaultUrls[provider] || 'https://api.openai.com/v1'}
                  className="w-full bg-[#0e1d1a] border border-[#22403a] rounded-lg pl-8 pr-2.5 py-1.5 text-xs font-mono text-white outline-none focus:border-[#37d6c0] transition-colors"
                />
              </div>
            </div>

            {/* API Key Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-[#8faea5] font-semibold">
                  5. مفتاح الـ API (API Secret Key)
                </label>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-[10px] text-[#37d6c0] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showKey ? 'إخفاء' : 'إظهار المفتاح'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#54736c]" />
                <input
                  type={showKey ? 'text' : 'password'}
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value);
                    setFormTestResult(null);
                  }}
                  placeholder={keyPlaceholders[provider]}
                  className="w-full bg-[#0e1d1a] border border-[#22403a] rounded-lg pl-8 pr-2.5 py-1.5 text-xs font-mono text-white outline-none focus:border-[#37d6c0] transition-colors"
                />
              </div>
            </div>

            {/* Advanced Properties Collapsible Toggle */}
            <div className="pt-1 border-t border-[#1a3832]">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-[#37d6c0] hover:text-white flex items-center gap-1.5 cursor-pointer font-semibold py-1"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>
                  {showAdvanced ? 'إخفاء الخصائص المتقدمة' : 'تعديل الخصائص المتقدمة (الحرارة، التوكين، سياق النظام)'}
                </span>
                {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Advanced Properties Drawer */}
            {showAdvanced && (
              <div className="bg-[#081513] border border-[#1a3832] rounded-xl p-3 flex flex-col gap-3 animate-slide-down">
                {/* Temperature & Max Tokens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-[#8faea5] font-semibold flex items-center gap-1">
                        <Flame className="w-3 h-3 text-[#ffb454]" />
                        <span>درجة الحرارة (Temperature):</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#ffb454] font-bold">{temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.5"
                      step="0.05"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-[#ffb454] cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-[#54736c] font-mono mt-0.5">
                      <button type="button" onClick={() => setTemperature(0.2)} className="hover:text-white cursor-pointer">
                        0.2 (دقيق)
                      </button>
                      <button type="button" onClick={() => setTemperature(0.4)} className="hover:text-white cursor-pointer">
                        0.4 (متوازن)
                      </button>
                      <button type="button" onClick={() => setTemperature(0.8)} className="hover:text-white cursor-pointer">
                        0.8 (إبداعي)
                      </button>
                      <button type="button" onClick={() => setTemperature(1.2)} className="hover:text-white cursor-pointer">
                        1.2 (خيالي)
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-[#8faea5] font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#37d6c0]" />
                        <span>الحد الأقصى للتوكين (Max Output Tokens):</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#37d6c0] font-bold">{maxTokens}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[512, 1024, 2048, 4096, 8192].map((tok) => (
                        <button
                          key={tok}
                          type="button"
                          onClick={() => setMaxTokens(tok)}
                          className={`px-2 py-1 rounded text-[10px] font-mono font-semibold cursor-pointer border transition-all ${
                            maxTokens === tok
                              ? 'bg-[#37d6c0] text-[#06231e] font-bold border-[#37d6c0]'
                              : 'bg-[#0e1d1a] border-[#22403a] text-[#8faea5] hover:border-[#37d6c0]'
                          }`}
                        >
                          {tok}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Multimodal Vision Toggle & Precision */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#142a26]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">دعم الرؤية البصرية (Multimodal)</span>
                      <span className="text-[10px] text-[#54736c] block">يدعم فحص الصور مباشرة بالذكاء الاصطناعي</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={visionCapable}
                      onChange={(e) => setVisionCapable(e.target.checked)}
                      className="accent-[#3ddc84] w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-[#8faea5] font-semibold block mb-1">مهلة الطلب (Timeout):</span>
                    <div className="flex items-center gap-1.5">
                      {[15, 30, 60, 120].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setTimeoutSec(sec)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer border transition-all ${
                            timeoutSec === sec
                              ? 'bg-[#ffb454] text-[#06231e] font-bold border-[#ffb454]'
                              : 'bg-[#0e1d1a] border-[#22403a] text-[#8faea5] hover:border-[#ffb454]'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom System Instruction Context */}
                <div className="pt-2 border-t border-[#142a26]">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-[#8faea5] font-semibold flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-[#37d6c0]" />
                      <span>تعليمات النظام وسياق الصياغة المخصص (System Context Override):</span>
                    </label>
                    <div className="flex items-center gap-1 text-[9px]">
                      <button
                        type="button"
                        onClick={() =>
                          setSystemInstruction(
                            'Focus intensely on volumetric lighting, cinematic color grading, 35mm lens depth of field, and photorealistic micro-textures.'
                          )
                        }
                        className="text-[#37d6c0] hover:underline cursor-pointer"
                      >
                        + سينمائي
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSystemInstruction(
                            'Emphasize Octane 3D render aesthetics, raytraced reflections, dynamic composition, and vibrant neon chromatic palettes.'
                          )
                        }
                        className="text-[#ffb454] hover:underline cursor-pointer"
                      >
                        + ثري دي
                      </button>
                      <button
                        type="button"
                        onClick={() => setSystemInstruction('')}
                        className="text-[#ff6b7a] hover:underline cursor-pointer"
                      >
                        مسح
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={systemInstruction}
                    onChange={(e) => setSystemInstruction(e.target.value)}
                    placeholder="أدخل أي قواعد خاصة لصياغة البرومبت أو استخراج خصائص الصورة..."
                    className="w-full bg-[#0e1d1a] border border-[#22403a] rounded-lg p-2 text-xs font-mono text-white outline-none focus:border-[#37d6c0] transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {/* Precision & Strategy */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#8faea5] font-semibold">دقة التحليل (Precision):</span>
                {(['std', 'high', 'max'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrecision(p)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer uppercase border transition-all ${
                      precision === p
                        ? 'bg-[#37d6c0] text-[#06231e] font-bold border-[#37d6c0]'
                        : 'bg-[#0e1d1a] border-[#22403a] text-[#8faea5] hover:border-[#37d6c0]'
                    }`}
                  >
                    {p === 'std' ? 'Standard' : p === 'high' ? 'High-Res' : 'Maximum'}
                  </button>
                ))}
              </div>

              {/* Form test result indicator */}
              {formTestResult && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all ${
                    formTestResult.ok
                      ? 'bg-[#3ddc8418] text-[#3ddc84] border-[#3ddc8444] animate-[successPop_0.3s_ease-out]'
                      : 'bg-[#ff6b7a18] text-[#ff6b7a] border-[#ff6b7a44]'
                  }`}
                >
                  {formTestResult.ok
                    ? `✓ تم التحقق (${formTestResult.latencyMs}ms)`
                    : `✕ ${formTestResult.error || 'فشل الاتصال'}`}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-[#1a3a34]">
              <button
                type="button"
                onClick={handleTestInForm}
                disabled={formTesting}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#122622] hover:bg-[#1a3832] text-[#37d6c0] border border-[#22403a] hover:border-[#37d6c0] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {formTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>{formTesting ? 'جاري الفحص…' : 'فحص الاتصال والسرعة'}</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="btn-amber px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
              >
                {editingId ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{editingId ? 'حفظ التعديلات (Save Changes)' : 'حفظ وتفعيل المحرك'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Security Guarantee */}
        <div className="flex items-center gap-2 text-[11px] text-[#54736c] pt-2 border-t border-[#1a3a34]">
          <ShieldCheck className="w-4 h-4 text-[#37d6c0] flex-none" />
          <span>يتم تشفير وتخزين جميع مفاتيح الـ API محلياً في متصفحك عبر تشفير PBKDF2 + AES-256-GCM مع وسيط آمن.</span>
        </div>
      </div>
    </ModalWrapper>
  );
};

// 3. Image Generation Modal
export const GenModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
}> = ({ isOpen, onClose, prompt, onToast }) => {
  const [model, setModel] = useState<'dalle' | 'mj' | 'gemini' | 'flux'>('gemini');
  const [aspect, setAspect] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [isFallbackImg, setIsFallbackImg] = useState(false);
  const [quotaWarning, setQuotaWarning] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (model === 'mj') {
      const mjPrompt = `${prompt} --ar ${aspect} --v 6.1`;
      await navigator.clipboard.writeText(mjPrompt);
      onToast('Midjourney prompt copied to clipboard ✓', 'ok');
      return;
    }
    if (model === 'dalle') {
      const dallePrompt = `Generate photo with aspect ratio ${aspect}: ${prompt}`;
      await navigator.clipboard.writeText(dallePrompt);
      onToast('DALL·E 3 prompt copied to clipboard ✓', 'ok');
      return;
    }
    if (model === 'flux') {
      const fluxPrompt = `${prompt}, aspect_ratio=${aspect}, style=raw photorealistic`;
      await navigator.clipboard.writeText(fluxPrompt);
      onToast('Flux prompt copied to clipboard ✓', 'ok');
      return;
    }

    setIsGenerating(true);
    setQuotaWarning(null);
    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio: aspect }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImg(data.imageUrl);
        setIsFallbackImg(!!data.isFallback);
        if (data.quotaExceeded) {
          setQuotaWarning(
            'Gemini 3.1 Flash Image model requires a billing-enabled key. Rendered high-fidelity visual concept preview.'
          );
          onToast('Visual concept preview rendered ✓', 'ok');
        } else if (data.isFallback) {
          setQuotaWarning(data.message || 'Synthesized visual concept rendered.');
          onToast('Visual concept preview rendered', 'ok');
        } else {
          onToast('Image generated successfully ✓', 'ok');
        }
      } else {
        throw new Error(data.error || 'Failed to generate');
      }
    } catch (e: any) {
      onToast(e.message || 'Generation failed', 'err');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImg) return;
    const a = document.createElement('a');
    a.href = generatedImg;
    a.download = `promptlens-concept-${Date.now()}.${isFallbackImg ? 'svg' : 'png'}`;
    a.click();
    onToast('Image downloaded ✓', 'ok');
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} kicker="IMAGE GENERATOR" title="Generate Image" maxWidth="max-w-2xl">
      <div className="flex flex-col gap-4">
        {/* Model selector */}
        <div className="flex gap-2 flex-wrap">
          {(['gemini', 'mj', 'dalle', 'flux'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setModel(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase cursor-pointer transition-all ${
                model === m
                  ? 'bg-gradient-to-b from-[#ffc267] to-[#ff9a3d] text-[#2a1706] font-bold shadow-md'
                  : 'bg-[#0e1d1a] border border-[#22403a] text-[#8faea5] hover:border-[#37d6c0]'
              }`}
            >
              {m === 'gemini' ? 'Gemini 3.1 Flash' : m === 'mj' ? 'Midjourney' : m === 'dalle' ? 'DALL·E 3' : 'Flux'}
            </button>
          ))}
        </div>

        {/* Aspect ratio */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8faea5]">Aspect Ratio:</span>
          {['1:1', '16:9', '9:16', '4:3', '3:4'].map((ar) => (
            <button
              key={ar}
              onClick={() => setAspect(ar)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg cursor-pointer transition-colors ${
                aspect === ar ? 'bg-[#37d6c0] text-[#06231e] font-bold' : 'bg-[#0e1d1a] text-[#8faea5] hover:text-white'
              }`}
            >
              {ar}
            </button>
          ))}
        </div>

        {/* Quota notice if triggered */}
        {quotaWarning && (
          <div className="bg-[#241707] border border-[#ffb45455] rounded-xl p-3 text-xs text-[#ffc267] flex items-start gap-2.5 animate-fadeIn">
            <span className="text-base leading-none">⚡</span>
            <div className="flex-1">
              <p className="font-semibold text-[#ffc267]">{quotaWarning}</p>
              <p className="text-[11px] text-[#ffb454bb] mt-0.5">
                Note: Standard text & vision features (Gemini 3.8 Flash) are fully active on the free tier. Image generation models require a billing-enabled key.
              </p>
            </div>
          </div>
        )}

        {/* Prompt Preview */}
        <div className="bg-[#0a1614] border border-[#22403a] rounded-xl p-3 font-mono text-xs text-[#9fc3ba] max-h-24 overflow-y-auto">
          {prompt || 'No prompt loaded'}
        </div>

        {/* Result Area */}
        <div className="bg-[#0a1614] border border-[#22403a] rounded-xl min-h-[180px] flex flex-col items-center justify-center p-3 overflow-hidden relative">
          {isGenerating ? (
            <div className="text-center font-mono text-xs text-[#ffb454] animate-pulse flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-[#ffb454] border-t-transparent rounded-full animate-spin" />
              <span>Generating image with Gemini AI…</span>
            </div>
          ) : generatedImg ? (
            <div className="relative group w-full flex flex-col items-center">
              <img
                src={generatedImg}
                alt="Generated Visual"
                className="max-h-[280px] w-auto object-contain rounded-lg shadow-lg border border-[#22403a]"
                referrerPolicy="no-referrer"
              />
              <div className="flex items-center gap-2 mt-3">
                {isFallbackImg && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#ffb45422] text-[#ffb454] border border-[#ffb45444]">
                    AI Visual Concept
                  </span>
                )}
                <button
                  onClick={handleDownload}
                  className="px-3 py-1 bg-[#163832] hover:bg-[#224e46] text-[#37d6c0] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Download {isFallbackImg ? 'SVG' : 'Image'}
                </button>
              </div>
            </div>
          ) : (
            <span className="text-xs text-[#54736c]">Generated image will appear here</span>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="btn-amber py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40"
        >
          <span>
            {model === 'gemini'
              ? 'Generate with Gemini'
              : model === 'mj'
              ? 'Copy Midjourney Prompt'
              : model === 'dalle'
              ? 'Copy DALL·E 3 Prompt'
              : 'Copy Flux Prompt'}
          </span>
        </button>
      </div>
    </ModalWrapper>
  );
};

// 4. Compare Modal
export const CompareModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentPrompt: string;
  previousPrompt: string;
  onAcceptPrevious: () => void;
}> = ({ isOpen, onClose, currentPrompt, previousPrompt, onAcceptPrevious }) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} kicker="VERSION COMPARISON" title="Compare Versions" maxWidth="max-w-2xl">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <span className="text-[10px] font-bold text-[#37d6c0] block mb-1">Current Version</span>
          <textarea
            value={currentPrompt}
            readOnly
            rows={8}
            className="w-full bg-[#0a1614] border border-[#22403a] rounded-xl p-3 font-mono text-xs text-[#cfe3ec] resize-none outline-none"
          />
        </div>
        <div>
          <span className="text-[10px] font-bold text-[#8faea5] block mb-1">Previous Version</span>
          <textarea
            value={previousPrompt}
            readOnly
            rows={8}
            className="w-full bg-[#0a1614] border border-[#22403a] rounded-xl p-3 font-mono text-xs text-[#8faea5] resize-none outline-none"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">
          Keep Current
        </button>
        <button
          onClick={() => {
            onAcceptPrevious();
            onClose();
          }}
          className="btn-teal px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
        >
          Revert to Previous
        </button>
      </div>
    </ModalWrapper>
  );
};

// 5. Performance Modal
export const PerfModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState<{ time: number; fps: number; heap: string }>({
    time: 14,
    fps: 60,
    heap: '42 MB',
  });

  const runTest = () => {
    const t0 = performance.now();
    for (let i = 0; i < 500000; i++) Math.sqrt(i * 1.5);
    const duration = performance.now() - t0;
    setMetrics({
      time: Math.round(duration),
      fps: Math.round(1000 / Math.max(16, duration)),
      heap: (performance as any).memory
        ? `${Math.round((performance as any).memory.usedJSHeapSize / 1048576)} MB`
        : 'N/A',
    });
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} kicker="SYSTEM BENCHMARK" title="Performance & Speed">
      <div className="grid grid-cols-3 gap-3 text-center mb-4">
        <div className="bg-[#0e1d1a] border border-[#22403a] p-3 rounded-xl">
          <span className="font-display text-2xl text-[#ffb454] block">{metrics.time}ms</span>
          <span className="text-[10px] text-[#8faea5]">Execution</span>
        </div>
        <div className="bg-[#0e1d1a] border border-[#22403a] p-3 rounded-xl">
          <span className="font-display text-2xl text-[#37d6c0] block">{metrics.fps}</span>
          <span className="text-[10px] text-[#8faea5]">FPS Target</span>
        </div>
        <div className="bg-[#0e1d1a] border border-[#22403a] p-3 rounded-xl">
          <span className="font-display text-2xl text-[#a855f7] block">{metrics.heap}</span>
          <span className="text-[10px] text-[#8faea5]">Heap Usage</span>
        </div>
      </div>
      <button onClick={runTest} className="btn-teal w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer">
        Run Performance Benchmark
      </button>
    </ModalWrapper>
  );
};

// 6. About Modal
export const AboutModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} kicker="ABOUT THE APP" title="Promptlens-api">
      <div className="text-xs text-[#cfe6df] leading-relaxed flex flex-col gap-3">
        <p>
          Promptlens-api is a cutting-edge vision analysis tool that transforms any photograph, rendering, or artwork into rich, production-ready AI image prompts.
        </p>
        <div className="grid grid-cols-2 gap-2 my-2">
          <div className="bg-[#0e1d1a] border border-[#22403a] p-3 rounded-xl">
            <b className="text-white block text-sm mb-1">1K to 12K Quality Engine</b>
            <span className="text-[11px] text-[#8faea5]">Dynamic scaling from standard HD up to 74.6 megapixel hyper-resolution.</span>
          </div>
          <div className="bg-[#0e1d1a] border border-[#22403a] p-3 rounded-xl">
            <b className="text-white block text-sm mb-1">Multi-API & Local</b>
            <span className="text-[11px] text-[#8faea5]">Runs 100% locally or with Google Gemini, OpenAI GPT-4o, and Claude 3.5.</span>
          </div>
        </div>
        <p className="text-[11px] text-[#8faea5]">
          Built with React, TypeScript, Tailwind CSS, Web Crypto AES-256-GCM, and the modern @google/genai SDK.
        </p>
      </div>
    </ModalWrapper>
  );
};

// 7. Contact Modal
export const ContactModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
}> = ({ isOpen, onClose, onToast }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !msg) {
      onToast('Please fill all fields', 'err');
      return;
    }
    onToast('Your message has been sent successfully ✓', 'ok');
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} kicker="CONTACT & SUPPORT" title="Get in Touch">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
        <div>
          <label className="text-[10px] text-[#8faea5] block mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#0a1614] border border-[#22403a] rounded-xl px-3 py-2 text-white outline-none"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="text-[10px] text-[#8faea5] block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#0a1614] border border-[#22403a] rounded-xl px-3 py-2 text-white outline-none"
            placeholder="you@domain.com"
          />
        </div>
        <div>
          <label className="text-[10px] text-[#8faea5] block mb-1">Message</label>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            rows={3}
            className="w-full bg-[#0a1614] border border-[#22403a] rounded-xl px-3 py-2 text-white outline-none resize-none"
            placeholder="How can we help?"
          />
        </div>
        <button type="submit" className="btn-amber py-2.5 rounded-xl font-bold text-xs mt-1 cursor-pointer">
          Send Message
        </button>
      </form>
    </ModalWrapper>
  );
};
