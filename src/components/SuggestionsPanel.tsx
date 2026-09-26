import React, { useState } from 'react';
import { Sparkles, Plus, Check, RefreshCw, Wand2, Search } from 'lucide-react';
import { SUGGESTION_CATEGORIES } from '../utils/suggestions';
import { BatchItem } from '../types';

interface SuggestionsPanelProps {
  currentPrompt: string;
  activeItem: BatchItem | null;
  lang: 'en' | 'ar' | 'fr' | 'es';
  onApplySuggestion: (suggestionText: string) => void;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
}

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  currentPrompt,
  activeItem,
  lang,
  onApplySuggestion,
  onToast,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('style');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<
    { label: string; text: string; category: string }[]
  >([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);

  const currentCatObj = SUGGESTION_CATEGORIES.find((c) => c.id === activeCategory);

  const handleApply = (text: string) => {
    onApplySuggestion(text);
    setRecentlyAdded(text);
    setTimeout(() => setRecentlyAdded(null), 1200);
    onToast(`Added: "${text.slice(0, 30)}…" ✓`, 'ok');
  };

  const handleGenerateAiSuggestions = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/gemini/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPrompt,
          category: activeCategory,
          imageContext: activeItem?.a
            ? {
                orientation: activeItem.a.orient,
                dominantColors: activeItem.a.palette.map((p) => p.hex),
                style: activeItem.cls?.styleKey,
              }
            : undefined,
        }),
      });

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setAiSuggestions(data.suggestions);
        onToast('New AI enhancement suggestions generated ✓', 'ok');
      } else {
        throw new Error('No suggestions returned');
      }
    } catch {
      onToast('Failed to generate suggestions. Using built-in library.', 'err');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const filteredChips = (currentCatObj?.chips || []).filter((c) =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#0e1d1a] border border-[#22403a] rounded-2xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-[#a855f718] border border-[#5a2a7a] flex items-center justify-center text-[#d8c7ff]">
            <Wand2 className="w-3.5 h-3.5 text-[#a855f7]" />
          </span>
          <span className="text-xs font-bold text-white tracking-wide">
            Prompt Enhancement Suggestions
          </span>
        </div>

        <button
          onClick={handleGenerateAiSuggestions}
          disabled={isLoadingAi}
          className="btn-purple px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-40"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
          <span>{isLoadingAi ? 'Generating…' : 'AI Smart Suggestions'}</span>
        </button>
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {SUGGESTION_CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                isSelected
                  ? 'bg-gradient-to-b from-[#ffc267] to-[#ff9a3d] text-[#2a1706] font-bold shadow-sm'
                  : 'bg-[#0a1614] border border-[#1f3a34] text-[#8faea5] hover:text-white'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name[lang] || cat.name.en}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic AI Suggestions (if present) */}
      {aiSuggestions.length > 0 && (
        <div className="p-3 bg-[#191424] border border-[#4a2a6b] rounded-xl flex flex-col gap-2 animate-fadeIn">
          <span className="text-[10px] font-bold font-mono text-[#d8c7ff] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#a855f7]" />
            <span>AI Contextual Recommendations:</span>
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {aiSuggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleApply(item.text)}
                className="group inline-flex items-center gap-1.5 bg-[#2a1b3d] hover:bg-[#3d2757] border border-[#5a2a7a] hover:border-[#a855f7] text-[#e9d5ff] rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              >
                <Plus className="w-3 h-3 text-[#a855f7] group-hover:rotate-90 transition-transform" />
                <span>{item.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Curated Suggestion Chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {filteredChips.map((chip) => {
          const isRecent = recentlyAdded === chip;
          return (
            <button
              key={chip}
              onClick={() => handleApply(chip)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border transition-all duration-200 cursor-pointer hover:-translate-y-0.5 ${
                isRecent
                  ? 'bg-[#3ddc8422] border-[#3ddc84] text-[#3ddc84]'
                  : 'bg-[#122421] border-[#22403a] hover:border-[#37d6c0] text-[#cfe6df] hover:text-white'
              }`}
            >
              {isRecent ? (
                <Check className="w-3 h-3 text-[#3ddc84]" />
              ) : (
                <Plus className="w-3 h-3 text-[#37d6c0]" />
              )}
              <span>{chip}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
