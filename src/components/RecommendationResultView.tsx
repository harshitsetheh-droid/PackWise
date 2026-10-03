import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  SlidersHorizontal,
  Scale,
  Stethoscope,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Thermometer,
  Calendar,
  Droplets,
  Truck,
  CheckCircle2,
  Info,
  ArrowRight,
  Sprout,
  BookmarkCheck,
  Download,
  FileText,
  Table,
  ChevronDown,
  Share2,
  Check,
} from 'lucide-react';
import { MLRecommendation, RecommendationFeedback } from '../types/packaging';
import { ActiveTab } from './Sidebar';
import { exportRecommendationToCSV, exportRecommendationToPDF } from '../utils/exportReport';
import { RecommendationFeedbackWidget } from './RecommendationFeedbackWidget';
import { PackagingMetricTooltip } from './PackagingMetricTooltip';
import {
  UnitSystem,
  formatOTR,
  formatWVTR,
  formatThickness,
  formatTemperature,
  formatStrength,
} from '../utils/unitConversion';

interface RecommendationResultViewProps {
  recommendation: MLRecommendation;
  setActiveTab: (tab: ActiveTab) => void;
  onLaunchWhatIf: () => void;
  onSaveToHistory: (rec: MLRecommendation) => void;
  isMsmeMode: boolean;
  isSaved?: boolean;
  onUpdateFeedback?: (recId: string, feedback: RecommendationFeedback | undefined) => void;
}

export const RecommendationResultView: React.FC<RecommendationResultViewProps> = ({
  recommendation,
  setActiveTab,
  onLaunchWhatIf,
  onSaveToHistory,
  isMsmeMode,
  isSaved = false,
  onUpdateFeedback,
}) => {
  const { inputConditions } = recommendation;
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState<boolean>(false);
  const [isShareCopied, setIsShareCopied] = useState<boolean>(false);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const downloadRef = useRef<HTMLDivElement>(null);

  // Formatted engineering metrics according to the chosen unit system
  const formattedOTR = formatOTR(recommendation.OTR_cc_m2_day, unitSystem);
  const formattedWVTR = formatWVTR(recommendation.WVTR_g_m2_day, unitSystem);
  const formattedThickness = formatThickness(recommendation.film_thickness_micron, unitSystem);
  const formattedSealTemp = formatTemperature(recommendation.seal_temperature_C, unitSystem);
  const formattedStrength = formatStrength(recommendation.mechanical_strength_MPa, unitSystem);
  const formattedStorageTemp = formatTemperature(inputConditions.storage_temperature_C, unitSystem);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/?rec=${recommendation.id}&commodity=${encodeURIComponent(recommendation.commodityName)}`;
    const summaryText = `📦 PackWise AI Packaging Specification:
--------------------------------------------------
Commodity: ${recommendation.commodityName} (${recommendation.category})
Recommended Material: ${recommendation.recommended_material}
Layer Structure: ${recommendation.packaging_structure}
Predicted Shelf Life: ${recommendation.predicted_shelf_life_days} days (Target: ${inputConditions.desired_shelf_life_days}d)
Barrier Metrics: OTR ${formattedOTR.value} ${formattedOTR.unitStr} | WVTR ${formattedWVTR.value} ${formattedWVTR.unitStr} | Caliper ${formattedThickness.value} ${formattedThickness.unitStr}
Environmental Score: ${recommendation.packaging_environmental_score}/100
Food Waste Risk: ${recommendation.food_waste_risk_percent}%
Deep Link: ${shareUrl}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setIsShareCopied(true);
      setTimeout(() => setIsShareCopied(false), 3500);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setIsDownloadMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Recommendation Summary
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              ID: {recommendation.id.slice(0, 12)}
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
            {recommendation.commodityName}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Unit System Toggle Switch (Metric vs Imperial) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setUnitSystem('metric')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                unitSystem === 'metric'
                  ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/90'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Metric SI Units (g/m²/day, cc/m²/day, microns, °C)"
            >
              <span>Metric</span>
              <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(g/m²/day)</span>
            </button>
            <button
              onClick={() => setUnitSystem('imperial')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                unitSystem === 'imperial'
                  ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/90'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Imperial US Units (g/100in²/day, cc/100in²/day, mils, °F)"
            >
              <span>Imperial</span>
              <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(g/100in²/day)</span>
            </button>
          </div>

          {/* Download Report Button with PDF as Primary + CSV Dropdown */}
          <div className="relative inline-flex items-center shadow-2xs rounded-lg" ref={downloadRef}>
            <button
              onClick={() => exportRecommendationToPDF(recommendation, isMsmeMode, unitSystem)}
              className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white px-3 py-1.5 rounded-l-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Download formatted PDF engineering report"
            >
              <Download className="w-3.5 h-3.5 text-emerald-200" />
              <span>Download Report</span>
            </button>
            <button
              onClick={() => setIsDownloadMenuOpen((prev) => !prev)}
              className="bg-emerald-900 hover:bg-emerald-950 text-white px-1.5 py-1.5 rounded-r-lg border-l border-emerald-700 text-xs font-semibold transition-all cursor-pointer"
              title="More export formats"
              aria-label="Export options"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 text-emerald-200 transition-transform ${
                  isDownloadMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isDownloadMenuOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 min-w-64 space-y-1 animate-in fade-in duration-100">
                <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Export Format Options ({unitSystem.toUpperCase()})
                </div>

                <button
                  onClick={() => {
                    setIsDownloadMenuOpen(false);
                    exportRecommendationToPDF(recommendation, isMsmeMode, unitSystem);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 transition-colors flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 flex items-center gap-1.5">
                      <span>Export as PDF Report</span>
                      <span className="text-[9px] bg-rose-100 text-rose-800 font-extrabold px-1.5 py-0.2 rounded">
                        Printable
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Technical engineering dossier with {unitSystem} specifications
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsDownloadMenuOpen(false);
                    exportRecommendationToCSV(recommendation, unitSystem);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 transition-colors flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Table className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 flex items-center gap-1.5">
                      <span>Export as CSV File</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded">
                        Spreadsheet
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Raw tabular metrics for Excel, Sheets, and analytical storage
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Share Deep Link & Technical Summary Button */}
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              isShareCopied
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400 shadow-2xs'
            }`}
            title="Generate shareable link & copy specification summary to clipboard"
          >
            {isShareCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            onClick={() => onSaveToHistory(recommendation)}
            disabled={isSaved}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              isSaved
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-2xs'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isSaved ? 'Saved in History' : 'Save Recommendation'}</span>
          </button>

          <button
            onClick={onLaunchWhatIf}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>What-If Simulator</span>
          </button>
        </div>
      </div>

      {/* Share Toast Banner */}
      {isShareCopied && (
        <div className="bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-lg border border-emerald-700 flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check className="w-3 h-3" />
            </div>
            <span className="font-semibold">
              Shareable link and executive engineering summary copied to clipboard! Ready to paste into Slack, WhatsApp, or email.
            </span>
          </div>
          <button
            onClick={() => setIsShareCopied(false)}
            className="text-emerald-300 hover:text-white text-xs ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Out of Distribution Warning Banner if applicable */}
      {recommendation.is_out_of_distribution && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3 text-amber-900 text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Input Range Sensitivity Notice:</span>
            {recommendation.out_of_distribution_warnings.map((w, i) => (
              <p key={i} className="leading-snug">
                • {w}
              </p>
            ))}
            <p className="font-medium text-amber-800 pt-1">
              Confidence is calibrated accordingly. Experimental validation is advised for extreme operating ranges.
            </p>
          </div>
        </div>
      )}

      {/* Primary Recommended Packaging Card */}
      <div className="bg-white rounded-2xl border-2 border-emerald-600/30 p-6 md:p-8 shadow-sm relative overflow-hidden">
        {/* Ambient mint highlight badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Primary ML Recommendation (Model A)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">
              {recommendation.recommended_material}
            </h1>
            <p className="text-xs md:text-sm text-slate-600 mt-1 flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Layer Structure: {recommendation.packaging_structure}</span>
            </p>
          </div>

          {/* Confidence Badge */}
          <div className="bg-slate-50 border border-slate-200/90 p-3 rounded-xl text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <ShieldCheck
                className={`w-4 h-4 ${
                  recommendation.confidence_level === 'High'
                    ? 'text-emerald-700'
                    : recommendation.confidence_level === 'Medium'
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              />
              <span className="text-xs font-bold text-slate-700">Model Confidence</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">
              {recommendation.confidence_score}%
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                recommendation.confidence_level === 'High'
                  ? 'bg-emerald-100 text-emerald-800'
                  : recommendation.confidence_level === 'Medium'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {recommendation.confidence_level} Confidence
            </span>
          </div>
        </div>

        {/* Technical Specifications Grid (Models B, C, D, E, F, G, H) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          {/* OTR */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-[0_2px_5px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:border-emerald-500 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                <PackagingMetricTooltip metricKey="otr" label="OTR (Model D)" />
              </span>
              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded border border-emerald-200">
                {unitSystem === 'imperial' ? 'US' : 'SI'}
              </span>
            </div>
            <div className="text-base font-extrabold text-slate-900 mt-1">
              {formattedOTR.value}{' '}
              <span className="text-[10px] font-semibold text-slate-500">{formattedOTR.unitStr}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {recommendation.OTR_cc_m2_day > 2000 ? 'High breathability' : 'Oxygen barrier'}
            </p>
          </div>

          {/* WVTR */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-[0_2px_5px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:border-emerald-500 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                <PackagingMetricTooltip metricKey="wvtr" label="WVTR (Model E)" />
              </span>
              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded border border-emerald-200">
                {unitSystem === 'imperial' ? 'US' : 'SI'}
              </span>
            </div>
            <div className="text-base font-extrabold text-slate-900 mt-1">
              {formattedWVTR.value}{' '}
              <span className="text-[10px] font-semibold text-slate-500">{formattedWVTR.unitStr}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {recommendation.WVTR_g_m2_day < 2 ? 'Ultra-low moisture ingress' : 'Vapor permeable'}
            </p>
          </div>

          {/* Film Thickness */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-[0_2px_5px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:border-emerald-500 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                <PackagingMetricTooltip metricKey="thickness" label="Thickness (Model F)" />
              </span>
            </div>
            <div className="text-base font-extrabold text-slate-900 mt-1">
              {formattedThickness.value}{' '}
              <span className="text-[10px] font-semibold text-slate-500">{formattedThickness.unitStr}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Calibrated for transit vibration</p>
          </div>

          {/* Predicted Shelf Life */}
          <div className="bg-emerald-50/90 p-3.5 rounded-xl border-2 border-emerald-300 shadow-[0_2px_5px_rgba(16,185,129,0.08)] hover:border-emerald-500 hover:shadow-md transition-all duration-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              <PackagingMetricTooltip metricKey="shelf_life" label="Shelf Life (Model C)" />
            </span>
            <div className="text-base font-black text-emerald-950 mt-1">
              {recommendation.predicted_shelf_life_days}{' '}
              <span className="text-[10px] font-normal text-emerald-800">days predicted</span>
            </div>
            <p className="text-[10px] text-emerald-700 mt-1">
              Target: {recommendation.inputConditions.desired_shelf_life_days} days
            </p>
          </div>

          {/* Sealability */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-[0_2px_5px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:border-emerald-500 hover:shadow-md transition-all duration-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              <PackagingMetricTooltip metricKey="sealability" label="Sealability (Model B)" />
            </span>
            <div className="text-base font-extrabold text-slate-900 mt-1">
              {recommendation.sealability}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Seal Temp: ~{formattedSealTemp.value}{formattedSealTemp.unitStr}
            </p>
          </div>

          {/* Tensile & Seal Strength */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-[0_2px_5px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:border-emerald-500 hover:shadow-md transition-all duration-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              <PackagingMetricTooltip metricKey="mechanical_strength" label="Mechanical Strength" />
            </span>
            <div className="text-base font-extrabold text-slate-900 mt-1">
              {formattedStrength.value}{' '}
              <span className="text-[10px] font-semibold text-slate-500">{formattedStrength.unitStr}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Seal: {recommendation.seal_strength_N_per_15mm} N/15mm
            </p>
          </div>

          {/* MAP Suitability */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-[0_2px_5px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:border-emerald-500 hover:shadow-md transition-all duration-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              <PackagingMetricTooltip metricKey="map_suitability" label="MAP Suitability (Model G)" />
            </span>
            <div className="text-base font-extrabold text-slate-900 mt-1">
              {recommendation.MAP_suitability}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Modified Atmosphere Pack</p>
          </div>

          {/* Gas Mixture */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-[0_2px_5px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:border-emerald-500 hover:shadow-md transition-all duration-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              <PackagingMetricTooltip metricKey="map_gas" label="MAP Gas (Model H)" />
            </span>
            <div className="text-base font-extrabold text-slate-900 mt-1">
              {recommendation.recommended_MAP_O2_percent}% O₂ • {recommendation.recommended_MAP_CO2_percent}% CO₂
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Rest N₂ balance flush</p>
          </div>
        </div>

        {/* Operating Environment Chips */}
        <div className="bg-white rounded-xl p-3 border border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <span className="font-bold text-slate-800">Evaluated Under:</span>
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Thermometer className="w-3.5 h-3.5 text-slate-400" />
            {formattedStorageTemp.value} {formattedStorageTemp.unitStr}
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-slate-400" />
            {inputConditions.relative_humidity_percent}% RH
          </span>
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-slate-400" />
            {inputConditions.transportation_duration_days}d transit
          </span>
          <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-semibold">
            {inputConditions.storage_type}
          </span>
        </div>
      </div>

      {/* Explainable AI: "Why This Packaging?" Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Why This Packaging?</h3>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Explainable AI (XAI)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Biochemical and thermodynamic attribution behind Model A–H decisions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Display View:</span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded border ${
                isMsmeMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              {isMsmeMode ? 'MSME / Farmer Mode' : 'Engineering Mode'}
            </span>
          </div>
        </div>

        {/* Feature Attribution Bar Cards */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Top Driving Attributions:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendation.top_contributing_factors.map((f, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{f.factor}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                    {f.weight}% weight
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, f.weight * 2.5)}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{f.impactDescription}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dual Explanation: Technical vs Simple */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Engineering Technical Reason */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Technical Scientific Rationale</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-mono text-[11px]">
              {recommendation.technical_explanation}
            </p>
          </div>

          {/* MSME / Small Farmer Mode Explanation */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-amber-600" />
              <span>Small Farmer & MSME Friendly Explanation</span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed">
              {recommendation.msme_simple_explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Food Waste vs Packaging Impact Trade-off Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Food Waste vs Packaging Impact</h3>
            <p className="text-xs text-slate-500">
              Simulated estimate balancing product preservation and polymer carbon footprint
            </p>
          </div>
          <button
            onClick={() => setActiveTab('sustainability')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            LCA Trade-off Deep Dive →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
            <span className="text-xs font-semibold text-slate-500 block">
              <PackagingMetricTooltip metricKey="food_waste_risk" label="Predicted Food Waste Risk" />
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {recommendation.food_waste_risk_percent}%
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {recommendation.food_waste_risk_percent < 15
                ? 'Minimal spoilage risk under recommended barrier.'
                : 'Elevated risk due to storage conditions.'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
            <span className="text-xs font-semibold text-slate-500 block">
              <PackagingMetricTooltip metricKey="sustainability_score" label="Packaging Sustainability Score" />
            </span>
            <div className="text-2xl font-black text-emerald-800 mt-1">
              {recommendation.packaging_environmental_score}/100
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Recyclability & polymer carbon intensity metric
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
            <span className="text-xs font-semibold text-slate-500 block">
              <PackagingMetricTooltip metricKey="carbon_footprint" label="Carbon Index (Simulated)" />
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {recommendation.carbon_footprint_estimate_kgCO2e}{' '}
              <span className="text-xs font-normal text-slate-500">kg CO₂e/1k pk</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Simulated estimate (non-laboratory certified)</p>
          </div>
        </div>
      </div>

      {/* 3-Way Alternatives Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Alternative Packaging Options</h3>
            <p className="text-xs text-slate-500">
              Evaluated lower-cost and eco-friendly alternatives
            </p>
          </div>
          <button
            onClick={() => setActiveTab('compare')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            Open Full 3-Way Matrix →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recommended */}
          <div className="p-4 rounded-xl border-2 border-emerald-500/50 bg-emerald-50/30 space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Primary Match
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              {recommendation.alternatives.recommended.material}
            </h4>
            <div className="text-xs text-slate-600">
              Shelf Life: ~{recommendation.alternatives.recommended.predicted_shelf_life_days} days
            </div>
            <div className="text-xs font-semibold text-emerald-900">
              OTR: {formatOTR(recommendation.alternatives.recommended.OTR_cc_m2_day, unitSystem).value} {formatOTR(recommendation.alternatives.recommended.OTR_cc_m2_day, unitSystem).unitStr}
            </div>
            <div className="text-xs text-slate-600">
              Cost Index: {recommendation.alternatives.recommended.cost_estimate_index}/10
            </div>
          </div>

          {/* Lower Cost */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
              Lower Cost Alternative
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              {recommendation.alternatives.lower_cost.material}
            </h4>
            <div className="text-xs text-slate-600">
              Shelf Life: ~{recommendation.alternatives.lower_cost.predicted_shelf_life_days} days
            </div>
            <div className="text-xs font-semibold text-slate-700">
              OTR: {formatOTR(recommendation.alternatives.lower_cost.OTR_cc_m2_day, unitSystem).value} {formatOTR(recommendation.alternatives.lower_cost.OTR_cc_m2_day, unitSystem).unitStr}
            </div>
            <div className="text-xs text-slate-600">
              Cost Index: {recommendation.alternatives.lower_cost.cost_estimate_index}/10
            </div>
          </div>

          {/* Eco-Friendly */}
          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
              Eco-Friendly Alternative
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              {recommendation.alternatives.eco_friendly.material}
            </h4>
            <div className="text-xs text-slate-600">
              Shelf Life: ~{recommendation.alternatives.eco_friendly.predicted_shelf_life_days} days
            </div>
            <div className="text-xs font-semibold text-teal-900">
              OTR: {formatOTR(recommendation.alternatives.eco_friendly.OTR_cc_m2_day, unitSystem).value} {formatOTR(recommendation.alternatives.eco_friendly.OTR_cc_m2_day, unitSystem).unitStr}
            </div>
            <div className="text-xs text-slate-600">
              Cost Index: {recommendation.alternatives.eco_friendly.cost_estimate_index}/10
            </div>
          </div>
        </div>
      </div>

      {/* User Rating & Continuous Refinement Feedback Widget */}
      <RecommendationFeedbackWidget
        currentFeedback={recommendation.userFeedback}
        onSaveFeedback={(feedback) => onUpdateFeedback?.(recommendation.id, feedback)}
        commodityName={recommendation.commodityName}
      />

      {/* Bottom Launch Banner for What-If Simulator (Core USP) */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200 bg-emerald-950/60 px-2.5 py-0.5 rounded-full mb-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Interactive Scenario Simulator</span>
          </div>
          <h3 className="text-xl font-extrabold text-white">
            What if transportation takes 6 days instead of {inputConditions.transportation_duration_days}?
          </h3>
          <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
            What if summer temperatures spike to 35°C? Test how the ML model re-calculates barrier thickness, OTR/WVTR,
            and shelf-life predictions in real time.
          </p>
        </div>

        <button
          onClick={onLaunchWhatIf}
          className="bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all shrink-0 flex items-center gap-2"
        >
          <span>Run What-If Simulation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
