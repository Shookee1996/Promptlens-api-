import React from 'react';
import { Download, Trash2, RotateCw } from 'lucide-react';
import { BatchItem } from '../types';
import { I18N } from '../utils/i18n';

interface HistoryPanelProps {
  items: BatchItem[];
  activeId: number | null;
  selectedIds: Set<number>;
  lang: 'en' | 'ar' | 'fr' | 'es';
  onSelectActive: (id: number) => void;
  onToggleSelect: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onExportBatch: (ids: number[]) => void;
  onDeleteSelected: () => void;
  onClearAll: () => void;
  onRequeue: (id: number) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  items,
  activeId,
  selectedIds,
  lang,
  onSelectActive,
  onToggleSelect,
  onSelectAll,
  onExportBatch,
  onDeleteSelected,
  onClearAll,
  onRequeue,
}) => {
  const t = I18N[lang].s;
  const allSelected = items.length > 0 && selectedIds.size === items.length;

  return (
    <section className="panel history flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-widest text-[#37d6c0] uppercase">
          {t.kHist}
        </span>
        <span className="font-display text-xl text-white font-normal">{t.histTitle}</span>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        <span className="font-mono text-[#5f8078] text-[11px]">{items.length} items</span>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <label className="flex items-center gap-1.5 cursor-pointer text-[#8faea5] hover:text-white">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#37d6c0]"
              />
              <span className="text-[11px] font-semibold">{t.selectAll}</span>
            </label>
          )}

          {items.length > 0 && (
            <button
              onClick={() => onExportBatch(items.map((i) => i.id))}
              className="text-[#37d6c0] hover:underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>{t.exportBtn}</span>
            </button>
          )}

          {items.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[#ff6b7a] hover:underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>{t.btnClear}</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-[#0f211e] border border-[#2f564e] rounded-xl p-2.5 flex items-center justify-between gap-2 flex-wrap animate-fadeIn">
          <span className="font-mono text-xs text-[#37d6c0]">
            {selectedIds.size} {t.selSuffix}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onExportBatch(Array.from(selectedIds))}
              className="px-2.5 py-1 text-[11px] font-semibold bg-[#122421] border border-[#1f5a50] text-[#37d6c0] hover:text-white rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>{t.exportBtn}</span>
            </button>
            <button
              onClick={onDeleteSelected}
              className="px-2.5 py-1 text-[11px] font-semibold bg-[#122421] border border-[#5a2a35] text-[#ff6b7a] hover:text-white rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>{t.deleteSelBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* Item List */}
      <div className="flex flex-col gap-2 max-h-[460px] overflow-y-auto pr-1">
        {items.length === 0 ? (
          <div className="border border-dashed border-[#2a4a44] rounded-xl p-6 text-center text-xs text-[#54736c] leading-relaxed">
            {t.histEmpty}
          </div>
        ) : (
          items.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const isActive = activeId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectActive(item.id)}
                className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-[#ffb454] bg-[#ffb4540d] shadow-[0_0_12px_rgba(255,180,84,0.15)]'
                    : isSelected
                    ? 'border-[#37d6c0] bg-[#37d6c00d]'
                    : 'border-[#22403a] bg-[#0e1d1a] hover:border-[#2f564e]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleSelect(item.id, e.target.checked);
                  }}
                  className="w-3.5 h-3.5 accent-[#37d6c0] cursor-pointer"
                />

                <img
                  src={item.url}
                  alt={item.name}
                  className="w-11 h-11 object-cover rounded-lg border border-white/10 flex-none"
                />

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{item.name}</div>
                  <div className="font-mono text-[10px] text-[#5f8078] truncate">
                    {item.a ? `${item.a.w}×${item.a.h} · ${item.a.tier}` : '—'}
                  </div>
                </div>

                {/* Status Dot */}
                <span
                  className={`w-2 h-2 rounded-full flex-none ${
                    item.status === 'done'
                      ? 'bg-[#37d6c0] shadow-[0_0_6px_#37d6c0]'
                      : item.status === 'error'
                      ? 'bg-[#ff6b7a]'
                      : 'bg-[#ffb454] animate-ping'
                  }`}
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequeue(item.id);
                  }}
                  title={t.requeue}
                  className="w-6 h-6 flex items-center justify-center text-[#8faea5] hover:text-[#ffb454] transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
