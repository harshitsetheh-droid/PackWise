import React from 'react';
import {
  Sparkles,
  SlidersHorizontal,
  ArrowRight,
  Package,
  Leaf,
  Layers,
  Activity,
  Gauge,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { MLRecommendation } from '../types/packaging';

/**
 * Format numbers compactly:
 * >= 1,000,000,000 -> B (e.g. 1B)
 * >= 1,000,000 -> M (e.g. 1M)
 * >= 1,000 -> k (e.g. 20k)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) {
    const val = num / 1_000_000_000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + 'B';
  }
  if (num >= 1_000_000) {
    const val = num / 1_000_000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + 'M';
  }
  if (num >= 1_000) {
    const val = num / 1_000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + 'k';
  }
  return num.toString();
}

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  recommendationsHistory: MLRecommendation[];
  onSelectRecommendation: (rec: MLRecommendation) => void;
  onOpenDemo: () => void;
  isMsmeMode: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  recommendationsHistory = [],
  onSelectRecommendation,
  onOpenDemo,
  isMsmeMode,
}) => {
  const latestRec = recommendationsHistory[0] || null;
  const recentRecs = recommendationsHistory.slice(0, 3);
  const simulationCount = Math.max(0, recommendationsHistory.length > 0 ? recommendationsHistory.length * 2 - 1 : 0);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* 1. Dark Forest Green Hero Banner matching image.png */}
      <div className="relative overflow-hidden rounded-3xl bg-[#143d2b] text-white p-6 sm:p-8 lg:p-10 shadow-sm border border-emerald-900/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading and Actions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wider text-emerald-300 uppercase">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Data-Led Packaging Decisions</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Plan smarter packaging.
              <br />
              <span className="text-emerald-300">Simulate the impact.</span>
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl leading-relaxed">
              AI-powered decision support for better packaging materials, better shelf life and less food waste.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('recommend')}
                className="inline-flex items-center gap-2 bg-[#2d7a52] hover:bg-[#246644] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-xs transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <ArrowRight className="w-4 h-4" />
                <span>New recommendation</span>
              </button>

              <button
                onClick={() => setActiveTab('whatif')}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl border border-white/20 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <SlidersHorizontal className="w-4 h-4 text-emerald-300" />
                <span>Try What-If Simulator</span>
              </button>
            </div>

            {/* Footnote */}
            <div className="pt-3 flex items-center gap-2 text-[11px] text-emerald-200/70">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>AI assists missing inputs · ML provides recommendations · synthetic data</span>
            </div>
          </div>

          {/* Right Column: Training Snapshot Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-black/25 border border-white/15 p-5 backdrop-blur-xs space-y-4">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-extrabold uppercase tracking-wider text-[11px] text-white">
                    Training Snapshot
                  </span>
                </div>
                <span className="text-[11px] text-emerald-200/70 font-mono">
                  packaging-recommendation-v1
                </span>
              </div>

              {/* 3 Metric Columns */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 text-left pt-1">
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">{formatCompactNumber(20000)}</div>
                  <div className="text-[11px] text-emerald-200/80 mt-1 whitespace-nowrap">training rows</div>
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">89</div>
                  <div className="text-[11px] text-emerald-200/80 mt-1 whitespace-nowrap">food profiles</div>
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">13</div>
                  <div className="text-[11px] text-emerald-200/80 mt-1 whitespace-nowrap">material labels</div>
                </div>
              </div>

              {/* Macro F1 Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-100 font-medium text-[11px]">Material holdout macro-F1</span>
                  <span className="font-extrabold text-amber-300 text-xs">22.2%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{ width: '22.2%' }}
                  ></div>
                </div>
                <div className="text-[10px] text-emerald-200/60 pt-0.5">
                  RandomForest · synthetic holdout · low reliability
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4 Metric Tiles matching image.png */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Tile 1: Recommendations */}
        <div className="bg-white rounded-2xl border border-[#e3e8df] p-5 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Recommendations</span>
            <Package className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {recommendationsHistory.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Saved in this browser</div>
        </div>

        {/* Tile 2: Commodities */}
        <div className="bg-white rounded-2xl border border-[#e3e8df] p-5 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Commodities</span>
            <Leaf className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">89</div>
          <div className="text-[11px] text-slate-400 mt-1">Workbook vocabulary</div>
        </div>

        {/* Tile 3: Material classes */}
        <div className="bg-white rounded-2xl border border-[#e3e8df] p-5 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Material classes</span>
            <Layers className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">13</div>
          <div className="text-[11px] text-slate-400 mt-1">Synthetic labels</div>
        </div>

        {/* Tile 4: Simulations */}
        <div className="bg-white rounded-2xl border border-[#e3e8df] p-5 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Simulations</span>
            <Activity className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{simulationCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Run in this browser</div>
        </div>
      </div>

      {/* 3. Middle Row: Model Quality Holdout & Latest Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: Model Quality */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#e3e8df] p-6 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Model Quality · Synthetic Holdout
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Gauge className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-900">
              Use the score, not just the label.
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              The material classifier's held-out macro-F1 is <strong className="text-amber-700">22.2%</strong>. It has limited accuracy on this synthetic dataset, so material recommendations default to low confidence. Always inspect the continuous OTR and WVTR barrier envelopes.
            </p>

            {/* Progress bar */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="text-[11px] font-semibold text-slate-500">Material macro-F1</span>
                <span className="text-xs font-bold text-amber-700">22.2%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: '22.2%' }}
                ></div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('about')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View every holdout metric</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Card: Latest Recommendation */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#e3e8df] p-6 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Latest Recommendation
              </span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>

            {latestRec ? (
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-black text-slate-900 leading-tight">
                      {latestRec.commodityName}
                    </h4>
                    <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                      {latestRec.recommended_material}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                    {latestRec.predicted_shelf_life_days}d shelf life
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Layer Structure:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-44">
                      {latestRec.packaging_structure}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Circularity Score:</span>
                    <span className="font-extrabold text-emerald-700">
                      {latestRec.packaging_environmental_score}/100
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center space-y-1">
                <p className="text-xs text-slate-500">Your first model readout will show here.</p>
              </div>
            )}
          </div>

          <div>
            {latestRec ? (
              <button
                onClick={() => onSelectRecommendation(latestRec)}
                className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <span>View full recommendation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('recommend')}
                className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Create first recommendation</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Path from Input to Decision & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: A clear path from input to decision */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#e3e8df] p-6 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">A clear path from input to decision</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Use the trained pipeline first; keep estimates and simulations visibly separate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Input Profile</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Define moisture, pH, respiration rate, and transit logistics.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-xs">
                <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Calibrate Barrier</span>
              </div>
              <p className="text-[11px] text-emerald-800/90 leading-snug">
                Engine predicts precise OTR, WVTR, and film thickness targets.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>What-If Stress Test</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Simulate temperature spikes and humid storage before purchase.
              </p>
            </div>
          </div>
        </div>

        {/* Right Card: Recent activity */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#e3e8df] p-6 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent activity</h3>
              <p className="text-xs text-slate-400">Stored only in this browser.</p>
            </div>
            {recommendationsHistory.length > 0 && (
              <button
                onClick={() => setActiveTab('history')}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
              >
                See all →
              </button>
            )}
          </div>

          {recentRecs.length > 0 ? (
            <div className="space-y-2">
              {recentRecs.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => onSelectRecommendation(rec)}
                  className="p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 truncate">
                      {rec.commodityName}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {rec.recommended_material} · {rec.predicted_shelf_life_days}d
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No recent activity saved yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
