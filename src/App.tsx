import React, { useState, useEffect, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { QualityDeck } from './components/QualityDeck';
import { BatchCenter } from './components/BatchCenter';
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
import {
  BatchItem,
  AppOptions,
  AdvancedFeatures,
  ApiInterface,
  LatencyMetrics,
  BatchWorkerConfig,
  TokenUsage,
  SessionTokenStats,
} from './types';
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

  // Latency Metrics State
  const [latestLatency, setLatestLatency] = useState<LatencyMetrics | null>({
    pixelDecodeMs: 24,
    colorExtractionMs: 18,
    compositionMs: 32,
    apiRoundtripMs: 0,
    totalMs: 74,
    pingMs: 15,
  });

  // Batch Worker Pipeline State
  const [workerConfig, setWorkerConfig] = useState<BatchWorkerConfig>({
    concurrency: 4, // default 4 parallel workers for fast processing
    isProcessing: false,
    isPaused: false,
    completedCount: 0,
    failedCount: 0,
    totalCount: 0,
    avgTimePerItemMs: 0,
    etaSeconds: 0,
  });
  const batchPausedRef = useRef(false);
  const batchCanceledRef = useRef(false);

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

  // Real-time Precision Token Counter State
  const [tokenStats, setTokenStats] = useState<SessionTokenStats>({
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    totalTokens: 0,
    callCount: 0,
  });

  const addTokensToStats = (tokens: TokenUsage, engineName?: string) => {
    setTokenStats((prev) => {
      const activeObj = apis.find((a) => a.id === activeApiId);
      const resolvedEngine =
        engineName ||
        tokens.engine ||
        (activeObj ? activeObj.name : 'Built-in Gemini 3.8 Flash');

      const prevEngineCount = prev.tokensByEngine?.[resolvedEngine] || 0;
      return {
        totalPromptTokens: prev.totalPromptTokens + (tokens.promptTokens || 0),
        totalCompletionTokens: prev.totalCompletionTokens + (tokens.completionTokens || 0),
        totalTokens: prev.totalTokens + (tokens.totalTokens || 0),
        callCount: prev.callCount + 1,
        lastCallTokens: {
          ...tokens,
          engine: resolvedEngine,
          timestamp: Date.now(),
        },
        tokensByEngine: {
          ...(prev.tokensByEngine || {}),
          [resolvedEngine]: prevEngineCount + (tokens.totalTokens || 0),
        },
      };
    });
  };

  const showToast = (text: string, type: 'ok' | 'err' = 'ok') => {
    setToastMsg({ text, type });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), 3000);
  };

  // Ping Server to measure network latency
  const measurePing = async () => {
    const t0 = performance.now();
    try {
      const res = await fetch('/api/ping');
      const pingMs = Math.round(performance.now() - t0);
      setLatestLatency((prev) => (prev ? { ...prev, pingMs } : null));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    measurePing();
    const interval = setInterval(measurePing, 20000);
    return () => clearInterval(interval);
  }, []);

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

  const saveApis = async (newApis: ApiInterface[], activeId: string | null) => {
    setApis(newApis);
    setActiveApiId(activeId);
    await secureStore.set(
      'promptlens_apis',
      JSON.stringify({ apis: newApis, activeId }),
    );
  };

  const activeItem = items.find((i) => i.id === activeId) || null;
  const isApiRunning =
    workerConfig.isProcessing ||
    items.some((i) => i.status === 'api' || i.status === 'analyzing' || i.status === 'enhancing');

  // Process a single item and return timing
  const processSingleItem = async (targetItem: BatchItem): Promise<boolean> => {
    try {
      setItems((prev) =>
        prev.map((i) => (i.id === targetItem.id ? { ...i, status: 'analyzing', step: 1 } : i))
      );

      const analysisResult = await analyzeImage(targetItem.file || targetItem.url);
      const analysisData = analysisResult.data;
      const breakdown = analysisResult.latencyBreakdown;
      const classification = classify(analysisData);
      const confScore = confidence(analysisData, classification, adv.twopass);

      let finalPrompt = '';
      let finalNeg: string | null = null;
      let usedApi = false;
      let apiEngine: string | undefined;
      let itemTokens: TokenUsage | undefined;
      let apiRoundtripMs = 0;

      if (adv.api || activeApiId) {
        try {
          setItems((prev) =>
            prev.map((i) => (i.id === targetItem.id ? { ...i, status: 'api', step: 3 } : i))
          );
          const tApiStart = performance.now();
          const res = await fetch(targetItem.url);
          const blob = await res.blob();
          const reader = new FileReader();

          const base64 = await new Promise<string>((resolve) => {
            reader.onloadend = () => {
              const r = reader.result as string;
              resolve(r.split(',')[1] || r);
            };
            reader.readAsDataURL(blob);
          });

          const activeApi = apis.find((a) => a.id === activeApiId && a.enabled);
          const apiConfig = activeApi
            ? {
                provider: activeApi.provider,
                model: activeApi.model,
                key: activeApi.key,
                baseUrl: activeApi.baseUrl,
                precision: activeApi.precision,
              }
            : undefined;

          const apiRes = await fetch('/api/gemini/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64,
              mimeType: blob.type || 'image/jpeg',
              instruction: `Generate an elite AI prompt for image generation in ${opts.pLang}. Target model: ${opts.style}. Detail: exhaustive. Include style, layout, lighting, color palette (${analysisData.palette.map((p) => p.hex).join(', ')}), composition, and professional design aesthetics.`,
              apiConfig,
            }),
          });

          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData.prompt) {
              finalPrompt = apiData.prompt;
              finalNeg = apiData.negative || null;
              usedApi = true;
              apiEngine = apiData.engine || (activeApi ? activeApi.name : 'Gemini 3.8 Flash');
              apiRoundtripMs = apiData.latencyMs || Math.round(performance.now() - tApiStart);
              if (apiData.tokens) {
                itemTokens = apiData.tokens;
                addTokensToStats(apiData.tokens);
              }
            }
          }
        } catch {
          // fallback to local prompt builder
        }
      }

      if (!finalPrompt) {
        const local = buildPrompt(
          { ...targetItem, a: analysisData, cls: classification },
          opts,
          adv
        );
        finalPrompt = local.main;
        finalNeg = local.neg;
      }

      const totalMs = breakdown.totalMs + apiRoundtripMs;
      const latency: LatencyMetrics = {
        pixelDecodeMs: breakdown.pixelDecodeMs,
        colorExtractionMs: breakdown.colorExtractionMs,
        compositionMs: breakdown.compositionMs,
        apiRoundtripMs,
        totalMs,
        pingMs: latestLatency?.pingMs || 15,
      };

      setLatestLatency(latency);

      const updated: BatchItem = {
        ...targetItem,
        a: analysisData,
        cls: classification,
        conf: confScore,
        finalPrompt,
        finalNeg,
        viaApi: usedApi,
        apiEngine,
        tokens: itemTokens,
        status: 'done',
        step: 4,
        history: [finalPrompt],
        historyIndex: 0,
        latency,
      };

      setItems((prev) => prev.map((i) => (i.id === targetItem.id ? updated : i)));
      return true;
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.id === targetItem.id ? { ...i, status: 'error' } : i))
      );
      return false;
    }
  };

  // Add files to batch
  const enqueueFiles = (files: FileList | File[]) => {
    const newBatchItems: BatchItem[] = Array.from(files).map((file, idx) => ({
      id: Date.now() + idx + Math.floor(Math.random() * 1000),
      name: file.name,
      file,
      url: URL.createObjectURL(file),
      status: 'queued',
      size: file.size,
      type: file.type || 'image/jpeg',
      step: 0,
    }));

    setItems((prev) => [...newBatchItems, ...prev]);
    if (!activeId && newBatchItems.length > 0) {
      setActiveId(newBatchItems[0].id);
    }
    showToast(`Added ${newBatchItems.length} images to queue ✓`, 'ok');
  };

  // Process from URL
  const processFromUrl = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], 'url-image.jpg', { type: blob.type || 'image/jpeg' });
      enqueueFiles([file]);
    } catch {
      showToast('Failed to load image from URL', 'err');
    }
  };

  // Parallel Multi-Worker Batch Processor Pipeline
  const runBatchProcessing = async () => {
    const queued = items.filter((i) => i.status === 'queued' || i.status === 'error');
    if (queued.length === 0) return;

    batchPausedRef.current = false;
    batchCanceledRef.current = false;

    setWorkerConfig((prev) => ({
      ...prev,
      isProcessing: true,
      isPaused: false,
      completedCount: 0,
      failedCount: 0,
      totalCount: queued.length,
    }));

    const concurrency = workerConfig.concurrency;
    let index = 0;
    let completed = 0;
    let failed = 0;
    const itemTimes: number[] = [];

    // Worker pool execution
    const runWorker = async (workerId: number) => {
      while (index < queued.length && !batchCanceledRef.current) {
        if (batchPausedRef.current) {
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }

        const currentIndex = index++;
        if (currentIndex >= queued.length) break;
        const currentItem = queued[currentIndex];

        const tItemStart = performance.now();
        const success = await processSingleItem(currentItem);
        const itemDuration = performance.now() - tItemStart;
        itemTimes.push(itemDuration);

        if (success) completed++;
        else failed++;

        const avgMs =
          itemTimes.reduce((acc, v) => acc + v, 0) / Math.max(1, itemTimes.length);
        const remainingItems = queued.length - (completed + failed);
        const eta = Math.ceil((remainingItems * (avgMs / concurrency)) / 1000);

        setWorkerConfig((prev) => ({
          ...prev,
          completedCount: completed,
          failedCount: failed,
          avgTimePerItemMs: Math.round(avgMs),
          etaSeconds: Math.max(0, eta),
        }));
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, queued.length) }, (_, i) =>
      runWorker(i)
    );
    await Promise.all(workers);

    setWorkerConfig((prev) => ({
      ...prev,
      isProcessing: false,
      isPaused: false,
    }));

    showToast(`Batch completed: ${completed} analyzed successfully ✓`, 'ok');
  };

  const handlePauseBatch = () => {
    batchPausedRef.current = true;
    setWorkerConfig((prev) => ({ ...prev, isPaused: true }));
  };

  const handleResumeBatch = () => {
    batchPausedRef.current = false;
    setWorkerConfig((prev) => ({ ...prev, isPaused: false }));
  };

  const handleCancelBatch = () => {
    batchCanceledRef.current = true;
    batchPausedRef.current = false;
    setWorkerConfig((prev) => ({ ...prev, isProcessing: false, isPaused: false }));
    showToast('Batch processing stopped', 'err');
  };

  const handleRetryFailed = () => {
    setItems((prev) =>
      prev.map((i) => (i.status === 'error' ? { ...i, status: 'queued' } : i))
    );
    setTimeout(runBatchProcessing, 100);
  };

  const handleApplyPresetToAll = () => {
    setItems((prev) =>
      prev.map((item) => {
        if (!item.a) return item;
        const { main, neg } = buildPrompt(item, opts, adv);
        return {
          ...item,
          finalPrompt: main,
          finalNeg: neg,
        };
      })
    );
    showToast('Active style & quality target applied to all images ✓', 'ok');
  };

  // Re-generate prompt when options change
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

  // Enhance prompt via Multi-Provider API
  const handleEnhance = async () => {
    if (!activeItem?.finalPrompt) return;
    showToast('Enhancing prompt with AI…', 'ok');

    const activeApi = apis.find((a) => a.id === activeApiId && a.enabled);
    const apiConfig = activeApi
      ? {
          provider: activeApi.provider,
          model: activeApi.model,
          key: activeApi.key,
          baseUrl: activeApi.baseUrl,
          precision: activeApi.precision,
        }
      : undefined;

    try {
      const res = await fetch('/api/gemini/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: `Enhance and polish this AI image prompt to make it deeply evocative, highly detailed, visually compelling, and stylistically pristine: "${activeItem.finalPrompt}"`,
          apiConfig,
        }),
      });

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      if (data.prompt) {
        const history = [...(activeItem.history || []), data.prompt];
        const engineLabel = data.engine || (activeApi ? activeApi.name : 'Gemini 3.8 Flash');
        if (data.tokens) {
          addTokensToStats(data.tokens);
        }
        const updated: BatchItem = {
          ...activeItem,
          finalPrompt: data.prompt,
          history,
          historyIndex: history.length - 1,
          viaApi: true,
          apiEngine: engineLabel,
          tokens: data.tokens || activeItem.tokens,
        };
        setItems((prev) => prev.map((i) => (i.id === activeItem.id ? updated : i)));
        showToast(
          `Enhanced with ${engineLabel}${data.tokens ? ` (${data.tokens.totalTokens} tok)` : ''} ✓`,
          'ok'
        );
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
        apis={apis}
        activeApiId={activeApiId}
        onSelectApi={(id) => {
          saveApis(apis, id);
          const selectedName = id
            ? apis.find((a) => a.id === id)?.name || 'Custom Engine'
            : 'Built-in Gemini 3.8 Flash';
          showToast(`Switched to ${selectedName} ✓`, 'ok');
        }}
        tokenStats={tokenStats}
        onResetTokens={() => {
          setTokenStats({
            totalPromptTokens: 0,
            totalCompletionTokens: 0,
            totalTokens: 0,
            callCount: 0,
          });
          showToast('Token counters reset to 0 ✓', 'ok');
        }}
        latestLatency={latestLatency}
        onRefreshPing={measurePing}
        onOpenAdv={() => setModalState((prev) => ({ ...prev, adv: true }))}
        onOpenPerf={() => setModalState((prev) => ({ ...prev, perf: true }))}
        onOpenContact={() => setModalState((prev) => ({ ...prev, contact: true }))}
        onOpenAbout={() => setModalState((prev) => ({ ...prev, about: true }))}
        onOpenApi={() => setModalState((prev) => ({ ...prev, api: true }))}
        isProcessing={isApiRunning}
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

      {/* High-Throughput Batch Processing Engine */}
      <BatchCenter
        items={items}
        workerConfig={workerConfig}
        onConcurrencyChange={(concurrency) =>
          setWorkerConfig((prev) => ({ ...prev, concurrency }))
        }
        onStartBatch={runBatchProcessing}
        onPauseBatch={handlePauseBatch}
        onResumeBatch={handleResumeBatch}
        onCancelBatch={handleCancelBatch}
        onRetryFailed={handleRetryFailed}
        onApplyPresetToAll={handleApplyPresetToAll}
        onExportAll={() => handleExportBatch(items.map((i) => i.id))}
      />

      {/* Main Workspace Layout */}
      <main className="max-w-[1480px] mx-auto px-7 mt-4.5 grid grid-cols-1 lg:grid-cols-[minmax(360px,1fr)_minmax(420px,1.3fr)_290px] gap-4.5 items-start">
        {/* Panel 1: Intake & Image Analyzer */}
        <IntakePanel
          item={activeItem}
          lang={lang}
          adv={adv}
          onFilesSelected={enqueueFiles}
          onUrlLoad={processFromUrl}
          onSampleSelect={processFromUrl}
          onToast={showToast}
        />

        {/* Panel 2: Prompt Studio */}
        <StudioPanel
          item={activeItem}
          opts={opts}
          adv={adv}
          lang={lang}
          apis={apis}
          activeApiId={activeApiId}
          onSelectApi={(id) => {
            saveApis(apis, id);
            const selectedName = id
              ? apis.find((a) => a.id === id)?.name || 'Custom Engine'
              : 'Built-in Gemini 3.8 Flash';
            showToast(`⚡ Switched to ${selectedName} ✓`, 'ok');
          }}
          onOpenApiModal={() => setModalState((prev) => ({ ...prev, api: true }))}
          tokenStats={tokenStats}
          isProcessing={isApiRunning}
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
            if (item) processSingleItem(item);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="max-w-[1480px] mx-auto px-7 py-8 mt-6 flex items-center justify-between gap-4 text-xs text-[#54736c] flex-wrap border-t border-[#1a3a34]">
        <span>Promptlens-api © 2026 · High-Throughput Batch Processing & AI Vision</span>
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
          <span className="font-mono text-[10px] text-[#37d6c0]">v3.2 Studio</span>
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
        onUpdateApi={(id, updatedFields) => {
          const updated = apis.map((a) => (a.id === id ? { ...a, ...updatedFields } : a));
          saveApis(updated, activeApiId);
        }}
        onDuplicateApi={(id) => {
          const source = apis.find((a) => a.id === id);
          if (!source) return;
          const cloneId = 'api_' + Date.now();
          const clone: ApiInterface = {
            ...source,
            id: cloneId,
            name: `${source.name} (Copy)`,
          };
          saveApis([...apis, clone], cloneId);
          showToast(`Engine duplicated as "${clone.name}" ✓`, 'ok');
        }}
        onDeleteApi={(id) => {
          const filtered = apis.filter((a) => a.id !== id);
          saveApis(filtered, activeApiId === id ? null : activeApiId);
        }}
        tokenStats={tokenStats}
        onResetTokens={() => {
          setTokenStats({
            totalPromptTokens: 0,
            totalCompletionTokens: 0,
            totalTokens: 0,
            callCount: 0,
          });
          showToast('Token counters reset to 0 ✓', 'ok');
        }}
        onTestApi={async (api) => {
          try {
            const r = await fetch('/api/api-test', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                provider: api.provider,
                model: api.model,
                key: api.key,
                baseUrl: api.baseUrl,
              }),
            });
            const data = await r.json();
            return {
              ok: !!data.ok,
              latencyMs: data.latencyMs,
              error: data.error,
              message: data.message,
            };
          } catch (e: any) {
            return {
              ok: false,
              error: e.message || 'Connection test failed',
            };
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
