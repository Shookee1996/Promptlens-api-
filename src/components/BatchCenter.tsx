import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Zap,
  Download,
  Trash2,
} from 'lucide-react';
import { BatchItem, BatchWorkerConfig } from '../types';

interface BatchCenterProps {
  items: BatchItem[];
  workerConfig: BatchWorkerConfig;
  onConcurrencyChange: (concurrency: 1 | 2 | 4 | 8) => void;
  onStartBatch: () => void;
  onPauseBatch: () => void;
  onResumeBatch: () => void;
  onCancelBatch: () => void;
  onRetryFailed: () => void;
  onApplyPresetToAll: () => void;
  onExportAll: () => void;
}

export const BatchCenter: React.FC<BatchCenterProps> = ({
  items,
  workerConfig,
  onConcurrencyChange,
  onStartBatch,
  onPauseBatch,
  onResumeBatch,
  onCancelBatch,
  onRetryFailed,
  onApplyPresetToAll,
  onExportAll,
}) => {
  const queuedItems = items.filter((i) => i.status === 'queued');
  const analyzingItems = items.filter(
    (i) => i.status === 'analyzing' || i.status === 'api' || i.status === 'enhancing'
  );
  const doneItems = items.filter((i) => i.status === 'done');
  const errorItems = items.filter((i) => i.status === 'error');

  const total = items.length;
  const progressPct = total > 0 ? Math.round((doneItems.length / total) * 100) : 0;

  return (
    <div className="max-w-[1480px] mx-auto px-7 mt-3">
      <div className="bg-gradient-to-b from-[#11211f] to-[#0c1816] border border-[#23423c] rounded-2xl p-4 md:p-5 shadow-xl transition-all">
        {/* Header and Controls */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#37d6c018] border border-[#1f5a50] flex items-center justify-center text-[#37d6c0]">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-display text-lg text-white font-normal leading-tight">
                Batch Processing Engine
              </h3>
              <p className="text-[11px] text-[#8faea5]">
                Parallel multi-worker pipeline for fast high-throughput vision analysis.
              </p>
            </div>
          </div>

          {/* Concurrency Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#8faea5] flex items-center gap-1 font-semibold">
              <Zap className="w-3.5 h-3.5 text-[#ffb454]" />
              <span>Parallel Workers:</span>
            </span>
            <div className="flex bg-[#0a1614] border border-[#22403a] p-1 rounded-xl gap-1">
              {([1, 2, 4, 8] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => onConcurrencyChange(val)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg cursor-pointer transition-all ${
                    workerConfig.concurrency === val
                      ? 'bg-gradient-to-b from-[#ffc267] to-[#ff9a3d] text-[#2a1706] shadow-sm'
                      : 'text-[#8faea5] hover:text-white'
                  }`}
                >
                  {val}×
                </button>
              ))}
            </div>

            {/* Batch Action Buttons */}
            {workerConfig.isProcessing ? (
              workerConfig.isPaused ? (
                <button
                  onClick={onResumeBatch}
                  className="btn-amber px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  onClick={onPauseBatch}
                  className="btn-ghost px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border-[#ffb454] text-[#ffb454]"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              )
            ) : (
              <button
                onClick={onStartBatch}
                disabled={queuedItems.length === 0}
                className="btn-amber px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Process All ({queuedItems.length})</span>
              </button>
            )}

            {workerConfig.isProcessing && (
              <button
                onClick={onCancelBatch}
                className="btn-ghost px-3 py-1.5 rounded-xl text-xs font-semibold text-[#ff6b7a] border-[#5a2a35] cursor-pointer"
              >
                Stop
              </button>
            )}

            {errorItems.length > 0 && (
              <button
                onClick={onRetryFailed}
                className="btn-ghost px-3 py-1.5 rounded-xl text-xs font-semibold text-[#ffb454] border-[#8a5a22] cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry Failed ({errorItems.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Progress Bar with metrics */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-[#cfe6df]">
              Progress: <b className="text-[#37d6c0]">{doneItems.length}</b> / {total} images (
              {progressPct}%)
            </span>
            <div className="flex items-center gap-3 text-[11px] text-[#8faea5]">
              <span>
                Avg:{' '}
                <b className="text-[#ffb454]">
                  {workerConfig.avgTimePerItemMs > 0
                    ? `${(workerConfig.avgTimePerItemMs / 1000).toFixed(1)}s`
                    : '—'}
                </b>
              </span>
              <span>
                ETA:{' '}
                <b className="text-[#37d6c0]">
                  {workerConfig.etaSeconds > 0 ? `${workerConfig.etaSeconds}s` : '0s'}
                </b>
              </span>
            </div>
          </div>

          <div className="relative h-2.5 bg-[#0b1715] border border-[#1f3a34] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#37d6c0] via-[#59c2e8] to-[#ffb454] rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Status Breakdown Chips */}
          <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
            <span className="inline-flex items-center gap-1.5 bg-[#0e1d1a] border border-[#22403a] px-2.5 py-1 rounded-lg text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#37d6c0]" />
              <span className="text-[#8faea5]">Done:</span>
              <b className="text-white">{doneItems.length}</b>
            </span>

            <span className="inline-flex items-center gap-1.5 bg-[#0e1d1a] border border-[#22403a] px-2.5 py-1 rounded-lg text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#ffb454] animate-pulse" />
              <span className="text-[#8faea5]">In Progress:</span>
              <b className="text-[#ffb454]">{analyzingItems.length}</b>
            </span>

            <span className="inline-flex items-center gap-1.5 bg-[#0e1d1a] border border-[#22403a] px-2.5 py-1 rounded-lg text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#587a72]" />
              <span className="text-[#8faea5]">Queued:</span>
              <b className="text-white">{queuedItems.length}</b>
            </span>

            {errorItems.length > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-[#191318] border border-[#4a2a33] px-2.5 py-1 rounded-lg text-[11px] text-[#ff6b7a]">
                <span className="w-2 h-2 rounded-full bg-[#ff6b7a]" />
                <span>Failed:</span>
                <b>{errorItems.length}</b>
              </span>
            )}

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={onApplyPresetToAll}
                disabled={items.length === 0}
                className="text-[11px] text-[#8faea5] hover:text-[#37d6c0] transition-colors cursor-pointer hover:underline disabled:opacity-30"
              >
                Apply Active Style & Target to All
              </button>
              <span>·</span>
              <button
                onClick={onExportAll}
                disabled={doneItems.length === 0}
                className="text-[11px] text-[#37d6c0] hover:underline transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-30"
              >
                <Download className="w-3 h-3" />
                <span>Export Batch Results</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
