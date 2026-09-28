import React, { useState } from 'react';
import { Activity, Zap, RefreshCw } from 'lucide-react';
import { LatencyMetrics } from '../types';

interface LatencyRateLimiterBarProps {
  latestLatency: LatencyMetrics | null;
  onRefreshPing: () => void;
}

export const LatencyRateLimiterBar: React.FC<LatencyRateLimiterBarProps> = ({
  latestLatency,
  onRefreshPing,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Ping badge color
  const totalMs = latestLatency?.totalMs || 0;
  const pingColor =
    totalMs < 150 ? 'text-[#3ddc84]' : totalMs < 500 ? 'text-[#ffb454]' : 'text-[#ff6b7a]';

  return (
    <div className="relative">
      <div className="flex items-center gap-2 flex-wrap text-xs">
        {/* Latency Counter Badge */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="inline-flex items-center gap-1.5 bg-[#0e1d1a] border border-[#22403a] hover:border-[#37d6c0] px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          title="Click to view latency breakdown"
        >
          <Activity className="w-3.5 h-3.5 text-[#37d6c0]" />
          <span className="text-[#8faea5]">Response:</span>
          <span className={`font-mono font-bold ${pingColor}`}>
            {totalMs > 0 ? `${totalMs}ms` : 'Instant'}
          </span>
          {latestLatency?.pingMs ? (
            <span className="text-[10px] font-mono text-[#5f8078]">
              ({latestLatency.pingMs}ms ping)
            </span>
          ) : null}
        </button>
      </div>

      {/* Latency Breakdown Details Popover */}
      {showDetails && latestLatency && (
        <div className="absolute top-full mt-2 left-0 z-30 w-72 bg-[#0a1614] border border-[#2a4a44] rounded-2xl p-4 shadow-2xl animate-fadeIn text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f3a34] mb-2.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#ffb454]" />
              <span>Latency Profiler</span>
            </span>
            <button
              onClick={onRefreshPing}
              className="text-[#8faea5] hover:text-[#37d6c0] flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Ping</span>
            </button>
          </div>

          <div className="flex flex-col gap-2 font-mono">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#8faea5]">Canvas / Decode:</span>
              <span className="text-white">{latestLatency.pixelDecodeMs} ms</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#8faea5]">Color & Palette:</span>
              <span className="text-white">{latestLatency.colorExtractionMs} ms</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#8faea5]">Composition & Heuristics:</span>
              <span className="text-white">{latestLatency.compositionMs} ms</span>
            </div>
            {latestLatency.apiRoundtripMs > 0 && (
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#37d6c0]">AI / API Roundtrip:</span>
                <span className="text-[#37d6c0] font-bold">
                  {latestLatency.apiRoundtripMs} ms
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#8faea5]">Server Ping:</span>
              <span className="text-white">{latestLatency.pingMs} ms</span>
            </div>
            <div className="pt-2 border-t border-[#1f3a34] flex justify-between items-center font-bold text-white">
              <span>Total Response:</span>
              <span className="text-[#ffb454]">{latestLatency.totalMs} ms</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
