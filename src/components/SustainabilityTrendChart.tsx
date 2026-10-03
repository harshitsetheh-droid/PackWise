import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Leaf,
  Award,
  Sparkles,
  BarChart2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { MLRecommendation } from '../types/packaging';

interface SustainabilityTrendChartProps {
  history?: MLRecommendation[];
}

export const SustainabilityTrendChart: React.FC<SustainabilityTrendChartProps> = ({
  history = [],
}) => {
  const [metricMode, setMetricMode] = useState<'score' | 'carbon'>('score');

  // Format data sorted chronologically
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];

    // Sort ascending by timestamp
    const sorted = [...history].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return sorted.map((rec, index) => {
      const d = new Date(rec.timestamp);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        id: rec.id,
        pointIndex: index + 1,
        date: dateStr,
        time: timeStr,
        fullDate: `${dateStr}, ${timeStr}`,
        commodity: rec.commodityName,
        material: rec.recommended_material,
        structure: rec.packaging_structure,
        sustainabilityScore: Number(rec.packaging_environmental_score || 0),
        carbonFootprint: Number(rec.carbon_footprint_estimate_kgCO2e || 0),
        foodWasteRisk: Number(rec.food_waste_risk_percent || 0),
        targetBenchmark: 75, // Eco-friendly benchmark target line
      };
    });
  }, [history]);

  // Summary statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        avgScore: 0,
        latestScore: 0,
        peakScore: 0,
        improvementPct: 0,
        ecoCount: 0,
        total: 0,
      };
    }

    const total = chartData.length;
    const scores = chartData.map((d) => d.sustainabilityScore);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / total);
    const latestScore = scores[scores.length - 1];
    const peakScore = Math.max(...scores);
    const initialScore = scores[0];
    const improvementPct =
      initialScore > 0 ? Math.round(((latestScore - initialScore) / initialScore) * 100) : 0;
    const ecoCount = scores.filter((s) => s >= 75).length;

    return {
      avgScore,
      latestScore,
      peakScore,
      improvementPct,
      ecoCount,
      total,
    };
  }, [chartData]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
            <span>Historical Eco-Progress Analytics</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">
            Packaging Sustainability & Circularity Score Trend
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tracks environmental scores across your saved recommendations to measure transition toward recyclable and bio-based polymers.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetricMode('score')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              metricMode === 'score'
                ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>Circularity Score (0–100)</span>
          </button>

          <button
            type="button"
            onClick={() => setMetricMode('carbon')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              metricMode === 'carbon'
                ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Carbon Index (kg CO₂e)</span>
          </button>
        </div>
      </div>

      {/* Progress Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Latest Eco Score
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
            <span>{stats.latestScore}</span>
            <span className="text-xs font-normal text-slate-500">/100</span>
          </div>
          <span
            className={`text-[10px] font-bold mt-1 inline-block ${
              stats.latestScore >= 75 ? 'text-emerald-700' : 'text-slate-600'
            }`}
          >
            {stats.latestScore >= 75 ? '✓ Eco-Compliant' : 'Conventional Mix'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Historical Average
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
            <span>{stats.avgScore}</span>
            <span className="text-xs font-normal text-slate-500">/100</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Across {stats.total} recommendations</p>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Peak Circular Score
          </span>
          <div className="text-2xl font-black text-emerald-950 mt-1 flex items-baseline gap-1">
            <span>{stats.peakScore}</span>
            <span className="text-xs font-normal text-emerald-700">/100</span>
          </div>
          <p className="text-[10px] text-emerald-700 mt-1">Highest circular match</p>
        </div>

        <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/50">
          <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
            Eco Adoption Rate
          </span>
          <div className="text-2xl font-black text-teal-950 mt-1">
            {stats.total > 0 ? Math.round((stats.ecoCount / stats.total) * 100) : 0}%
          </div>
          <p className="text-[10px] text-teal-700 mt-1">
            {stats.ecoCount} of {stats.total} exceed score 75
          </p>
        </div>
      </div>

      {/* Main Recharts Area Chart */}
      <div className="pt-2">
        {chartData.length === 0 ? (
          <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
            No recommendation data recorded yet to plot sustainability trends.
          </div>
        ) : (
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="carbonGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

                <XAxis
                  dataKey="commodity"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                  tickLine={false}
                />

                <YAxis
                  domain={metricMode === 'score' ? [0, 100] : ['auto', 'auto']}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  unit={metricMode === 'score' ? ' pt' : ' kg'}
                />

                {metricMode === 'score' && (
                  <ReferenceLine
                    y={75}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Target Benchmark (75+ Eco)',
                      fill: '#047857',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                )}

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-56">
                          <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                            <span className="font-extrabold text-emerald-400">
                              {data.commodity}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {data.fullDate}
                            </span>
                          </div>

                          <div className="text-slate-300">
                            <strong className="text-white">Material:</strong> {data.material}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-slate-400">Circularity Score:</span>
                            <span className="font-extrabold text-emerald-300">
                              {data.sustainabilityScore} / 100
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Carbon Footprint:</span>
                            <span className="font-semibold text-slate-200">
                              {data.carbonFootprint} kg CO₂e
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Food Waste Risk:</span>
                            <span className="font-semibold text-rose-300">
                              {data.foodWasteRisk}%
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {metricMode === 'score' ? (
                  <Area
                    type="monotone"
                    dataKey="sustainabilityScore"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                    dot={{ fill: '#059669', stroke: '#ffffff', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#047857' }}
                    name="Circularity Score"
                  />
                ) : (
                  <Area
                    type="monotone"
                    dataKey="carbonFootprint"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#carbonGradient)"
                    dot={{ fill: '#0d9488', stroke: '#ffffff', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#0f766e' }}
                    name="Carbon Footprint"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Progress Insight Footer */}
      <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-3 text-xs text-emerald-950">
        <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">Progress & Eco-Target Guidance:</span>
          <p className="text-emerald-900 leading-relaxed">
            Selecting mono-material structures (such as 100% Recyclable Mono-PE or bio-compostable PLA)
            shifts recommendations above the 75-point green threshold. Continually test alternative structures in the 3-Way Matrix to elevate your enterprise packaging circularity rating.
          </p>
        </div>
      </div>
    </div>
  );
};
