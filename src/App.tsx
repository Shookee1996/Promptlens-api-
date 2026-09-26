import React, { useState, useEffect, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { QualityDeck } from './components/QualityDeck';
import { IntakePanel } from './components/IntakePanel';
import { StudioPanel } from './components/StudioPanel';
import { HistoryPanel } from './components/HistoryPanel';
import {
  AdvModal,
  ApiModal,
  GenModal,
  CompareModal,
  PerfModal,
  AboutModal,
  ContactModal,
} from './components/Modals';
import { BatchItem, AppOptions, AdvancedFeatures, ApiInterface } from './types';
import { analyzeImage, classify, confidence, buildPrompt } from './utils/analyzer';
import { secureStore } from './utils/crypto';
import { I18N } from './utils/i18n';

export default function App() {
  const [lang, setLang] = useState<'en' | 'ar' | 'fr' | 'es'>('en');
  const [items, setItems] = useState<BatchItem[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [opts, setOpts] = useState<AppOptions>({
    style: 'dalle', // automatic default DALL·E 3
    detail: 2, // automatic default Exhaustive
    pLang: 'en',
    enhance: true,
    target: 2, // 4K target
    format: 'text',
  });

  const [adv, setAdv] = useState<AdvancedFeatures>({
    ultra: true,
    autoneg: true,
    twopass: true,
    jsonauto: false,
    typo: true,
    grid: true,
    depth: true,
    conf: true,
    dev: false,
    api: true,
    harmony: true,
    mood: true,
  });

  const [apis, setApis] = useState<ApiInterface[]>([]);
  const [activeApiId, setActiveApiId] = useState<string | null>(null);

  // Modals state
  const [modalState, setModalState] = useState({
    adv: false,
    api: false,
    gen: false,
    compare: false,
    perf: false,
    about: false,
    contact: false,
  });

  // Toast state
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = (text: string, type: 'ok' | 'err' = 'ok') => {
    setToastMsg({ text, type });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), 3000);
  };

  // Load saved API store on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await secureStore.get('promptlens_apis');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.apis)) {
            setApis(parsed.apis);
            setActiveApiId(parsed.activeId || null);
          }
        }
      } catch (e) {
        console.warn('Failed to load API store', e);
      }
    })();
  }, []);

  // Save APIs to secure storage when changed
  const saveApis = async (newApis: ApiInterface[], activeId: string | null) => {
    setApis(newApis);
    setActiveApiId(activeId);
    await secureStore.set(
      'promptlens_apis',
      JSON.stringify({ apis: newApis, activeId }),
    );
  };

  const activeItem = items.find((i) => i.id === activeId) || null;

  // Process and analyze an image
  const processImage = async (file: File | string, name: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const url = typeof file === 'string' ? file : URL.createObjectURL(file);
    const size = typeof file === 'string' ? 500000 : file.size;

    const newItem: BatchItem = {
      id,
      name,
      file: typeof file === 'string' ? undefined : file,
      url,
      status: 'analyzing',
      size,
      type: typeof file === 'string' ? 'image/jpeg' : file.type,
      step: 1,
    };

    setItems((prev) => [newItem, ...prev]);
    setActiveId(id);

    try {
      // Step 1: Pixel analysis
      const analysisData = await analyzeImage(file);
      const classification = classify(analysisData);
      const confScore = confidence(analysisData, classification, adv.twopass);

      newItem.a = analysisData;
      newItem.cls = classification;
      newItem.conf = confScore;
      newItem.step = 3;

      // Check if we should call server-side Gemini or client API
      let finalPrompt = '';
      let finalNeg: string | null = null;
      let usedApi = false;

      if (adv.api) {
        try {
          newItem.status = 'api';
          // Convert to base64
          const res = await fetch(url);
          const blob = await res.blob();
          const reader = new FileReader();

          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => {
              const res = reader.result as string;
              resolve(res.split(',')[1] || res);
            };
          });
          reader.readAsDataURL(blob);
          const base64 = await base64Promise;

          // Call server-side Gemini API route
          const apiRes = await fetch('/api/gemini/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64,
              mimeType: blob.type || 'image/jpeg',
              instruction: `Generate an elite AI prompt for image generation in ${opts.pLang}. Target model: ${opts.style}. Detail: exhaustive. Include style, layout, lighting, color palette (${analysisData.palette.map((p) => p.hex).join(', ')}), composition, and professional design aesthetics.`,
            }),
          });

          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData.prompt) {
              finalPrompt = apiData.prompt;
              finalNeg = apiData.negative || null;
              usedApi = true;
            }
          }
        } catch {
          // fallback to local prompt builder
        }
      }

      if (!finalPrompt) {
        const local = buildPrompt(newItem, opts, adv);
        finalPrompt = local.main;
        finalNeg = local.neg;
      }

      newItem.finalPrompt = finalPrompt;
      newItem.finalNeg = finalNeg;
      newItem.viaApi = usedApi;
      newItem.status = 'done';
      newItem.step = 4;
      newItem.history = [finalPrompt];
      newItem.historyIndex = 0;

      setItems((prev) => prev.map((item) => (item.id === id ? { ...newItem } : item)));
      showToast('Analysis completed successfully ✓', 'ok');
    } catch (err: any) {
      newItem.status = 'error';
      setItems((prev) => prev.map((item) => (item.id === id ? { ...newItem } : item)));
      showToast('Failed to analyze image', 'err');
    }
  };

  // Re-generate prompt when settings or options change
  const handleRegen = () => {
    if (!activeItem || !activeItem.a) return;
    const { main, neg } = buildPrompt(activeItem, opts, adv);
    const history = activeItem.history ? [...activeItem.history, main] : [main];
    const updated: BatchItem = {
      ...activeItem,
      finalPrompt: main,
      finalNeg: neg,
      history,
      historyIndex: history.length - 1,
    };
    setItems((prev) => prev.map((i) => (i.id === activeItem.id ? updated : i)));
    showToast('Prompt regenerated ✓', 'ok');
  };

  // Enhance prompt via Gemini API
  const handleEnhance = async () => {
    if (!activeItem?.finalPrompt) return;
    showToast('Enhancing prompt with AI…', 'ok');

    try {
      const res = await fetch('/api/gemini/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: `Enhance and polish this AI image prompt to make it deeply evocative, highly detailed, visually compelling, and stylistically pristine: "${activeItem.finalPrompt}"`,
        }),
      });

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      if (data.prompt) {
        const history = [...(activeItem.history || []), data.prompt];
        const updated: BatchItem = {
          ...activeItem,
          finalPrompt: data.prompt,
          history,
          historyIndex: history.length - 1,
          viaApi: true,
        };
        setItems((prev) => prev.map((i) => (i.id === activeItem.id ? updated : i)));
        showToast('Prompt enhanced with AI ✓', 'ok');
      }
    } catch {
      showToast('Enhancement failed. Check your API settings.', 'err');
    }
  };

  // Undo prompt change
  const handleUndo = () => {
    if (!activeItem?.history || activeItem.historyIndex! <= 0) return;
    const newIdx = activeItem.historyIndex! - 1;
    const updated: BatchItem = {
      ...activeItem,
      historyIndex: newIdx,
      finalPrompt: activeItem.history[newIdx],
    };
    setItems((prev) => prev.map((i) => (i.id === activeItem.id ? updated : i)));
  };

  // Redo prompt change
  const handleRedo = () => {
    if (!activeItem?.history || activeItem.historyIndex! >= activeItem.history.length - 1) return;
    const newIdx = activeItem.historyIndex! + 1;
    const updated: BatchItem = {
      ...activeItem,
      historyIndex: newIdx,
      finalPrompt: activeItem.history[newIdx],
    };
    setItems((prev) => prev.map((i) => (i.id === activeItem.id ? updated : i)));
  };

  // Update prompt manually in textarea
  const handlePromptChange = (newPrompt: string) => {
    if (!activeItem) return;
    const updated: BatchItem = {
      ...activeItem,
      finalPrompt: newPrompt,
    };
    setItems((prev) => prev.map((i) => (i.id === activeItem.id ? updated : i)));
  };

  // Export batch
  const handleExportBatch = (ids: number[]) => {
    const toExport = items.filter((i) => ids.includes(i.id) && i.finalPrompt);
    if (!toExport.length) return;

    const text = toExport
      .map((it, idx) => `### [${idx + 1}] ${it.name}\n${it.finalPrompt}\n`)
      .join('\n────────────────────────\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptlens-batch-${toExport.length}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${toExport.length} prompts ✓`, 'ok');
  };

  return (
    <div className={`min-h-screen bg-[#0b1514] text-[#e7f2ee] ${lang === 'ar' ? 'font-body' : ''}`}>
      {/* Background Decorators */}
      <div className="bg-grid" />
      <div className="glow g1" />
      <div className="glow g2" />
      <div className="glow g3" />
      <div className="grain" />

      {/* Top Header */}
      <TopBar
        lang={lang}
        onLangChange={(l) => {
          setLang(l);
          setOpts((prev) => ({ ...prev, pLang: l }));
        }}
        apiCount={apis.length}
        hasActiveApi={!!activeApiId || adv.api}
        onOpenAdv={() => setModalState((prev) => ({ ...prev, adv: true }))}
        onOpenPerf={() => setModalState((prev) => ({ ...prev, perf: true }))}
        onOpenContact={() => setModalState((prev) => ({ ...prev, contact: true }))}
        onOpenAbout={() => setModalState((prev) => ({ ...prev, about: true }))}
        onOpenApi={() => setModalState((prev) => ({ ...prev, api: true }))}
      />

      {/* 1K to 12K Quality Deck */}
      <QualityDeck
        targetIndex={opts.target}
        inputTier={activeItem?.a?.tier || null}
        lang={lang}
        onTargetChange={(idx) => {
          setOpts((prev) => ({ ...prev, target: idx }));
          if (activeItem?.status === 'done') {
            setTimeout(handleRegen, 50);
          }
        }}
      />

      {/* Main Workspace Layout */}
      <main className="max-w-[1480px] mx-auto px-7 mt-4.5 grid grid-cols-1 lg:grid-cols-[minmax(360px,1fr)_minmax(420px,1.3fr)_290px] gap-4.5 items-start">
        {/* Panel 1: Intake & Image Analyzer */}
        <IntakePanel
          item={activeItem}
          lang={lang}
          adv={adv}
          onFilesSelected={(files) => {
            Array.from(files).forEach((file) => processImage(file, file.name));
          }}
          onUrlLoad={(url) => processImage(url, 'web-image.jpg')}
          onSampleSelect={(sampleUrl) => processImage(sampleUrl, 'sample.jpg')}
          onToast={showToast}
        />

        {/* Panel 2: Prompt Studio */}
        <StudioPanel
          item={activeItem}
          opts={opts}
          adv={adv}
          lang={lang}
          onOptsChange={(newOpts) => {
            setOpts((prev) => ({ ...prev, ...newOpts }));
            if (activeItem?.status === 'done') {
              setTimeout(handleRegen, 50);
            }
          }}
          onPromptChange={handlePromptChange}
          onEnhance={handleEnhance}
          onShare={() => {
            navigator.clipboard.writeText(window.location.href);
            showToast('Share link copied to clipboard ✓', 'ok');
          }}
          onRegen={handleRegen}
          onDownload={() => {
            if (!activeItem?.finalPrompt) return;
            const blob = new Blob([activeItem.finalPrompt], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `prompt-${activeItem.name}.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          onExportMulti={() => handleExportBatch(items.map((i) => i.id))}
          onOpenCompare={() => setModalState((prev) => ({ ...prev, compare: true }))}
          onOpenGen={() => setModalState((prev) => ({ ...prev, gen: true }))}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={!!activeItem?.history && activeItem.historyIndex! > 0}
          canRedo={
            !!activeItem?.history && activeItem.historyIndex! < activeItem.history.length - 1
          }
          onToast={showToast}
        />

        {/* Panel 3: History & Batch Manager */}
        <HistoryPanel
          items={items}
          activeId={activeId}
          selectedIds={selectedIds}
          lang={lang}
          onSelectActive={(id) => setActiveId(id)}
          onToggleSelect={(id, checked) => {
            setSelectedIds((prev) => {
              const next = new Set(prev);
              if (checked) next.add(id);
              else next.delete(id);
              return next;
            });
          }}
          onSelectAll={(checked) => {
            setSelectedIds(checked ? new Set(items.map((i) => i.id)) : new Set());
          }}
          onExportBatch={handleExportBatch}
          onDeleteSelected={() => {
            setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
            setSelectedIds(new Set());
            if (selectedIds.has(activeId!)) setActiveId(null);
            showToast('Selected items deleted', 'ok');
          }}
          onClearAll={() => {
            setItems([]);
            setActiveId(null);
            setSelectedIds(new Set());
            showToast('All items cleared', 'ok');
          }}
          onRequeue={(id) => {
            const item = items.find((i) => i.id === id);
            if (item) processImage(item.file || item.url, item.name);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="max-w-[1480px] mx-auto px-7 py-8 mt-6 flex items-center justify-between gap-4 text-xs text-[#54736c] flex-wrap border-t border-[#1a3a34]">
        <span>Promptlens-api © 2026 · AES-256-GCM Military Encryption · 1K to 12K Engine</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalState((prev) => ({ ...prev, about: true }))}
            className="hover:text-[#37d6c0] transition-colors cursor-pointer"
          >
            About
          </button>
          <span>·</span>
          <button
            onClick={() => setModalState((prev) => ({ ...prev, contact: true }))}
            className="hover:text-[#37d6c0] transition-colors cursor-pointer"
          >
            Contact
          </button>
          <span>·</span>
          <span className="font-mono text-[10px] text-[#37d6c0]">v3.0 Production</span>
        </div>
      </footer>

      {/* Modals */}
      <AdvModal
        isOpen={modalState.adv}
        onClose={() => setModalState((prev) => ({ ...prev, adv: false }))}
        adv={adv}
        onToggle={(key) => setAdv((prev) => ({ ...prev, [key]: !prev[key] }))}
        lang={lang}
        onExportSettings={() => {
          const blob = new Blob([JSON.stringify({ adv, opts }, null, 2)], {
            type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'promptlens-settings.json';
          a.click();
          URL.revokeObjectURL(url);
        }}
        onImportSettings={(file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const data = JSON.parse(e.target?.result as string);
              if (data.adv) setAdv(data.adv);
              if (data.opts) setOpts(data.opts);
              showToast('Settings imported ✓', 'ok');
            } catch {
              showToast('Invalid settings file', 'err');
            }
          };
          reader.readAsText(file);
        }}
      />

      <ApiModal
        isOpen={modalState.api}
        onClose={() => setModalState((prev) => ({ ...prev, api: false }))}
        apis={apis}
        activeId={activeApiId}
        onSetActive={(id) => saveApis(apis, id)}
        onAddApi={(newApi) => {
          const id = 'api_' + Date.now();
          saveApis([...apis, { ...newApi, id }], id);
        }}
        onDeleteApi={(id) => {
          const filtered = apis.filter((a) => a.id !== id);
          saveApis(filtered, activeApiId === id ? null : activeApiId);
        }}
        onTestApi={async (api) => {
          try {
            if (api.provider === 'gemini') {
              const r = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${api.key}`,
              );
              return r.ok;
            }
            return true;
          } catch {
            return false;
          }
        }}
        onToast={showToast}
      />

      <GenModal
        isOpen={modalState.gen}
        onClose={() => setModalState((prev) => ({ ...prev, gen: false }))}
        prompt={activeItem?.finalPrompt || ''}
        onToast={showToast}
      />

      <CompareModal
        isOpen={modalState.compare}
        onClose={() => setModalState((prev) => ({ ...prev, compare: false }))}
        currentPrompt={activeItem?.finalPrompt || ''}
        previousPrompt={
          activeItem?.history && activeItem.history.length > 1
            ? activeItem.history[activeItem.history.length - 2]
            : ''
        }
        onAcceptPrevious={() => {
          if (activeItem?.history && activeItem.history.length > 1) {
            handleUndo();
          }
        }}
      />

      <PerfModal
        isOpen={modalState.perf}
        onClose={() => setModalState((prev) => ({ ...prev, perf: false }))}
      />

      <AboutModal
        isOpen={modalState.about}
        onClose={() => setModalState((prev) => ({ ...prev, about: false }))}
      />

      <ContactModal
        isOpen={modalState.contact}
        onClose={() => setModalState((prev) => ({ ...prev, contact: false }))}
        onToast={showToast}
      />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 border transition-all animate-bounce ${
            toastMsg.type === 'err'
              ? 'bg-[#191318] text-[#ff6b7a] border-[#ff6b7a]'
              : 'bg-[#0e2e28] text-[#37d6c0] border-[#37d6c0]'
          }`}
        >
          <span>{toastMsg.text}</span>
        </div>
      )}
    </div>
  );
}
