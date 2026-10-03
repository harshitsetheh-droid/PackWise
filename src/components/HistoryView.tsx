import React from 'react';
import {
  History,
  Trash2,
  ExternalLink,
  SlidersHorizontal,
  Calendar,
  Thermometer,
  Layers,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { MLRecommendation } from '../types/packaging';
import { ActiveTab } from './Sidebar';

interface HistoryViewProps {
  history: MLRecommendation[];
  onSelectRecommendation: (rec: MLRecommendation) => void;
  onClearHistory: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  onLaunchWhatIf: (rec: MLRecommendation) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectRecommendation,
  onClearHistory,
  setActiveTab,
  onLaunchWhatIf,
}) => {
  if (history.length === 0) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <History className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">No Recommendations in History Yet</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Generate your first packaging recommendation using the ML model to see it saved here for future reference and
          What-If comparisons.
        </p>
        <button
          onClick={() => setActiveTab('recommend')}
          className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors"
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>Generate New Recommendation</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">
              Recommendation History & Archive
            </h1>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              {history.length} Saved
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reopen previously generated packaging solutions or load them directly into the What-If Simulator.
          </p>
        </div>

        <button
          onClick={onClearHistory}
          className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-lg border border-rose-200 transition-colors self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      {/* History Items List */}
      <div className="space-y-3">
        {history.map((rec) => {
          const formattedDate = new Date(rec.timestamp).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={rec.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-slate-900">
                    {rec.commodityName}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {rec.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{formattedDate}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-slate-700 font-medium">
                    <Layers className="w-3.5 h-3.5 text-emerald-700" />
                    {rec.recommended_material}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-slate-400" />
                    {rec.inputConditions.storage_temperature_C}°C ({rec.inputConditions.storage_type})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {rec.predicted_shelf_life_days}d predicted (target: {rec.inputConditions.desired_shelf_life_days}d)
                  </span>
                </div>

                {/* User Rating & Feedback Badge */}
                {rec.userFeedback && (
                  <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        rec.userFeedback.rating === 'up'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {rec.userFeedback.rating === 'up' ? (
                        <>
                          <ThumbsUp className="w-3 h-3 text-emerald-700" />
                          <span>Rated: Verified Match</span>
                        </>
                      ) : (
                        <>
                          <ThumbsDown className="w-3 h-3 text-amber-700" />
                          <span>Rated: Refinement Proposed</span>
                        </>
                      )}
                    </span>

                    {rec.userFeedback.suggestedMaterial && (
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Suggested: {rec.userFeedback.suggestedMaterial}
                      </span>
                    )}

                    {rec.userFeedback.suggestedShelfLifeDays && (
                      <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        Expected: {rec.userFeedback.suggestedShelfLifeDays}d
                      </span>
                    )}

                    {rec.userFeedback.comments && (
                      <span className="text-[11px] text-slate-500 italic truncate max-w-xs">
                        "{rec.userFeedback.comments}"
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onLaunchWhatIf(rec)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg border border-emerald-200 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                  <span>What-If</span>
                </button>

                <button
                  onClick={() => onSelectRecommendation(rec)}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 px-3.5 py-2 rounded-lg shadow-xs transition-colors"
                >
                  <span>Reopen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
