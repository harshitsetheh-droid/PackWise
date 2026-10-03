import React, { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Edit3,
  RotateCcw,
  Send,
  Layers,
  Calendar,
} from 'lucide-react';
import { RecommendationFeedback, FeedbackRating } from '../types/packaging';

interface RecommendationFeedbackWidgetProps {
  currentFeedback?: RecommendationFeedback;
  onSaveFeedback: (feedback: RecommendationFeedback | undefined) => void;
  commodityName: string;
}

const COMMON_CORRECTION_TAGS = [
  'Moisture barrier too low',
  'Oxygen barrier too high',
  'Shelf life overestimated',
  'Shelf life underestimated',
  'Prefer recyclable mono-material',
  'Sealing temperature incompatible',
  'Cost profile too high for commodity',
];

const SUGGESTED_MATERIAL_OPTIONS = [
  'Circular Mono-PE (100% Recyclable)',
  'BOPP / Met-PET / Poly (High Barrier Foil)',
  'EVOH High-Barrier Multilayer Film',
  'Paper / PLA Biodegradable Lamination',
  'Laser Micro-Perforated BOPP Film',
  'AlOx Coated Transparent Barrier Film',
  'APET / EVOH / PE Vacuum Skin Film',
];

export const RecommendationFeedbackWidget: React.FC<RecommendationFeedbackWidgetProps> = ({
  currentFeedback,
  onSaveFeedback,
  commodityName,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(!currentFeedback);
  const [rating, setRating] = useState<FeedbackRating | null>(
    currentFeedback?.rating || null
  );
  const [selectedTag, setSelectedTag] = useState<string>(
    currentFeedback?.feedbackCategory || ''
  );
  const [suggestedMaterial, setSuggestedMaterial] = useState<string>(
    currentFeedback?.suggestedMaterial || ''
  );
  const [suggestedShelfLife, setSuggestedShelfLife] = useState<string>(
    currentFeedback?.suggestedShelfLifeDays ? String(currentFeedback.suggestedShelfLifeDays) : ''
  );
  const [comments, setComments] = useState<string>(
    currentFeedback?.comments || ''
  );
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  const handleQuickRate = (newRating: FeedbackRating) => {
    setRating(newRating);
    if (newRating === 'up') {
      const feedback: RecommendationFeedback = {
        rating: 'up',
        feedbackCategory: 'accurate',
        comments: comments.trim() || 'Verified accurate by operator',
        submittedAt: new Date().toISOString(),
      };
      onSaveFeedback(feedback);
      setIsEditing(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } else {
      // Open the refinement drawer for detailed corrections
      setIsEditing(true);
    }
  };

  const handleDetailedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;

    const feedback: RecommendationFeedback = {
      rating,
      feedbackCategory: selectedTag || (rating === 'up' ? 'accurate' : 'other'),
      suggestedMaterial: suggestedMaterial.trim() || undefined,
      suggestedShelfLifeDays: suggestedShelfLife ? Number(suggestedShelfLife) : undefined,
      comments: comments.trim() || undefined,
      submittedAt: new Date().toISOString(),
    };

    onSaveFeedback(feedback);
    setIsEditing(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  const handleClearFeedback = () => {
    onSaveFeedback(undefined);
    setRating(null);
    setSelectedTag('');
    setSuggestedMaterial('');
    setSuggestedShelfLife('');
    setComments('');
    setIsEditing(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Rate AI Recommendation & Suggest Refinements
            </h3>
            <p className="text-xs text-slate-500">
              Help fine-tune packaging ML weights for {commodityName}. Feedback is stored in your local session history.
            </p>
          </div>
        </div>

        {/* Existing Feedback Status Badge if saved */}
        {currentFeedback && !isEditing && (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                currentFeedback.rating === 'up'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              {currentFeedback.rating === 'up' ? (
                <>
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Rated: Verified Match</span>
                </>
              ) : (
                <>
                  <ThumbsDown className="w-3.5 h-3.5 text-amber-700" />
                  <span>Rated: Refinement Proposed</span>
                </>
              )}
            </span>

            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Edit feedback"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Success Notification Banner */}
      {showSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold p-3 rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Feedback successfully recorded! It has been linked to this recommendation in your local history for model calibration.
          </span>
        </div>
      )}

      {/* Quick Rating Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-slate-700">How accurate is this solution?</span>

        <button
          type="button"
          onClick={() => handleQuickRate('up')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
            rating === 'up'
              ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
              : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${rating === 'up' ? 'text-white' : 'text-emerald-700'}`} />
          <span>Accurate & Production Ready</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickRate('down')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
            rating === 'down'
              ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
              : 'bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-800 border-slate-200 hover:border-rose-300'
          }`}
        >
          <ThumbsDown className={`w-3.5 h-3.5 ${rating === 'down' ? 'text-white' : 'text-rose-600'}`} />
          <span>Needs Correction / Inaccurate</span>
        </button>

        {currentFeedback && isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 ml-auto"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Collapsed view summary if feedback exists and not editing */}
      {currentFeedback && !isEditing && (
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span>Submitted: {new Date(currentFeedback.submittedAt).toLocaleString()}</span>
            <button
              onClick={handleClearFeedback}
              className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Rating</span>
            </button>
          </div>

          {currentFeedback.feedbackCategory && (
            <div className="text-slate-700">
              <strong className="text-slate-900">Feedback Category:</strong> {currentFeedback.feedbackCategory}
            </div>
          )}

          {currentFeedback.suggestedMaterial && (
            <div className="text-slate-700">
              <strong className="text-slate-900">User Suggested Material:</strong> {currentFeedback.suggestedMaterial}
            </div>
          )}

          {currentFeedback.suggestedShelfLifeDays && (
            <div className="text-slate-700">
              <strong className="text-slate-900">User Suggested Shelf Life:</strong> {currentFeedback.suggestedShelfLifeDays} days
            </div>
          )}

          {currentFeedback.comments && (
            <div className="text-slate-700 italic border-l-2 border-slate-300 pl-2.5">
              "{currentFeedback.comments}"
            </div>
          )}
        </div>
      )}

      {/* Expanded Correction Form */}
      {isEditing && rating && (
        <form onSubmit={handleDetailedSubmit} className="pt-2 space-y-4 border-t border-slate-100 animate-in fade-in">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {rating === 'down' ? 'What should be corrected?' : 'Select confirmation tags:'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CORRECTION_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setSelectedTag((prev) => (prev === tag ? '' : tag))}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Suggested Alternative Material */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Preferred / Suggested Material Structure:</span>
              </label>
              <input
                type="text"
                list="material-suggestions"
                value={suggestedMaterial}
                onChange={(e) => setSuggestedMaterial(e.target.value)}
                placeholder="e.g. Circular Mono-PE, BOPP/Met-PET/PE..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <datalist id="material-suggestions">
                {SUGGESTED_MATERIAL_OPTIONS.map((mat) => (
                  <option key={mat} value={mat} />
                ))}
              </datalist>
            </div>

            {/* Suggested Real-world Shelf Life */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Expected Field Shelf Life (Days):</span>
              </label>
              <input
                type="number"
                min={1}
                max={1500}
                value={suggestedShelfLife}
                onChange={(e) => setSuggestedShelfLife(e.target.value)}
                placeholder="e.g. 45"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Practitioner Notes / Comments */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Field Notes & Biochemical Observations (Optional):</span>
            </label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. 'In commercial transit at 35°C, oxygen scavenger masterbatch is typically incorporated to prevent rancidity'..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Stored in local browser storage ('packwise_history') for model refinement.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg"
              >
                Dismiss
              </button>

              <button
                type="submit"
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-emerald-300" />
                <span>Save Correction to History</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
