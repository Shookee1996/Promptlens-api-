import React from 'react';
import { ArrowRight } from 'lucide-react';
import { TIERS } from '../utils/constants';
import { I18N } from '../utils/i18n';

interface QualityDeckProps {
  targetIndex: number;
  inputTier: string | null;
  lang: 'en' | 'ar' | 'fr' | 'es';
  onTargetChange: (index: number) => void;
}

export const QualityDeck: React.FC<QualityDeckProps> = ({
  targetIndex,
  inputTier,
  lang,
  onTargetChange,
}) => {
  const t = I18N[lang].s;
  const currentTier = TIERS[targetIndex];
  const fillPct = (targetIndex / (TIERS.length - 1)) * 100;

  let badgeType: 'up' | 'match' | 'down' | null = null;
  if (inputTier) {
    const inputIdx = TIERS.findIndex((x) => x.k === inputTier);
    if (inputIdx === -1 || inputIdx < targetIndex) badgeType = 'up';
    else if (inputIdx === targetIndex) badgeType = 'match';
    else badgeType = 'down';
  }

  return (
    <section className="max-w-[1480px] mx-auto px-7 mt-3">
      <div className="relative bg-gradient-to-b from-[#122320] to-[#0d1a18] border border-[#23423c] hover:border-[#2f564e] rounded-2xl p-5 md:p-6 shadow-2xl transition-colors duration-500 overflow-hidden">
        {/* Top gradient highlight border */}
        <div className="absolute top-0 inset-x-4 h-[2px] bg-gradient-to-r from-[#ffb454] to-[#37d6c0] opacity-80" />

        <div className="flex justify-between items-center gap-3 flex-wrap mb-4">
          <div>
            <span className="font-mono text-[10px] tracking-widest text-[#37d6c0] uppercase">
              {t.qKicker}
            </span>
            <h2 className="font-display text-2xl md:text-3xl text-white font-normal leading-tight">
              {t.qTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-2 bg-[#0e1d1a] border border-[#22403a] rounded-xl px-3 py-1.5 text-xs text-[#cfe6df]">
              <b className="text-[10px] text-[#8faea5] font-semibold">{t.qInput}</b>
              <span className="font-mono text-[#37d6c0] font-semibold">{inputTier || '—'}</span>
            </span>

            <ArrowRight className="w-4 h-4 text-[#37d6c0] rtl:rotate-180 animate-pulse" />

            <span className="inline-flex items-center gap-2 bg-[#ffb45412] border border-[#8a5a22] rounded-xl px-3 py-1.5 text-xs shadow-[0_0_15px_rgba(255,180,84,0.15)]">
              <b className="text-[10px] text-[#8faea5] font-semibold">{t.qTarget}</b>
              <span className="font-mono font-bold text-[#ffb454] text-sm">{currentTier.k}</span>
            </span>

            {badgeType && (
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide ${
                  badgeType === 'up'
                    ? 'text-[#ffb454] bg-[#3a2a12] border border-[#8a5a22]'
                    : badgeType === 'match'
                    ? 'text-[#37d6c0] bg-[#0e2e28] border border-[#1f5a50]'
                    : 'text-[#59c2e8] bg-[#12283a] border border-[#22403a]'
                }`}
              >
                {badgeType === 'up' ? t.qUp : badgeType === 'match' ? t.qMatch : t.qDown}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 items-center">
          {/* Readout */}
          <div className="text-center min-w-[150px]">
            <div className="font-display text-5xl leading-none text-[#ffb454] drop-shadow-[0_0_24px_rgba(255,180,84,0.3)]">
              {currentTier.mp}
              <small className="block font-body text-xs text-[#8faea5] mt-1 tracking-widest uppercase">
                {t.qMp}
              </small>
            </div>
            <div className="font-mono text-xs text-[#9fc3ba] mt-2">
              {currentTier.w} × {currentTier.h}
            </div>
            <span className="inline-block mt-2 text-[11px] font-bold text-[#06231e] bg-gradient-to-r from-[#37d6c0] to-[#8ff0dc] px-3 py-1 rounded-full shadow-[0_0_12px_rgba(55,214,192,0.2)]">
              {t.qNote[currentTier.k] || currentTier.k}
            </span>
          </div>

          {/* Interactive track slider */}
          <div className="relative py-8 px-4 cursor-pointer select-none">
            <div className="relative h-2.5 bg-[#0b1715] border border-[#1d3833] rounded-full">
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#37d6c0] to-[#ffb454] rounded-full transition-all duration-300"
                style={{ width: `${fillPct}%` }}
              />

              {/* Knob */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-7 bg-gradient-to-b from-[#ffc267] to-[#ff9a3d] text-[#2a1706] rounded-full flex items-center justify-center font-display text-sm font-bold shadow-[0_2px_14px_rgba(255,154,61,0.5)] cursor-grab active:cursor-grabbing transition-all duration-300 hover:scale-105"
                style={{ left: `${fillPct}%` }}
              >
                {currentTier.k}
              </div>
            </div>

            {/* Stops */}
            <div className="flex justify-between items-center mt-3 px-1">
              {TIERS.map((tier, idx) => (
                <button
                  key={tier.k}
                  onClick={() => onTargetChange(idx)}
                  className={`flex flex-col items-center gap-1.5 group cursor-pointer transition-all duration-200 ${
                    idx === targetIndex
                      ? 'scale-110 text-[#ffb454] font-bold'
                      : 'text-[#587a72] hover:text-[#9fc3ba]'
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full border-2 border-[#0b1715] transition-all ${
                      idx === targetIndex
                        ? 'bg-gradient-to-b from-[#ffc267] to-[#ff9a3d] shadow-[0_0_10px_#ff9a3d]'
                        : 'bg-[#3a5a54] group-hover:bg-[#37d6c0]'
                    }`}
                  />
                  <span className="font-mono text-xs">{tier.k}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bar indicator */}
          <div className="flex items-end justify-center gap-1.5 h-16">
            {TIERS.map((tier, idx) => {
              const heightPct = Math.max(12, Math.round((tier.mp / 74.6) * 100));
              return (
                <button
                  key={tier.k}
                  onClick={() => onTargetChange(idx)}
                  title={`${tier.k} (${tier.mp} MP)`}
                  className={`w-4 rounded-t transition-all duration-300 cursor-pointer ${
                    idx === targetIndex
                      ? 'bg-gradient-to-t from-[#ff9a3d] to-[#ffc267] shadow-[0_0_12px_rgba(255,154,61,0.4)] scale-y-105'
                      : 'bg-[#16302b] hover:bg-[#2a5a50]'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
