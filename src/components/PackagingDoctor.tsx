import React, { useState } from 'react';
import {
  Stethoscope,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Layers,
  Sprout,
  Loader2,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { diagnosePackagingProblem } from '../services/api';
import { PackagingDiagnosis } from '../types/packaging';
import { VoiceInputButton } from './VoiceInputButton';

interface PackagingDoctorProps {
  isMsmeMode: boolean;
}

const PRESET_SYMPTOMS = [
  {
    title: 'Chips are becoming soggy',
    desc: 'Fried crispy chips lose crunch after 2 weeks on the shelf',
    commodity: 'Fried Potato Chips',
    packaging: 'BOPP Monolayer pouch',
  },
  {
    title: 'Tomatoes spoil quickly and rot',
    desc: 'Fresh tomatoes develop white mold and sweat inside the packet',
    commodity: 'Fresh Tomatoes',
    packaging: 'Standard sealed LDPE bag',
  },
  {
    title: 'Moisture condensing inside packet',
    desc: 'Heavy droplets form on film walls, causing water pooling on produce',
    commodity: 'Baby Spinach Leaves',
    packaging: 'Sealed Polypropylene film',
  },
  {
    title: 'Fresh paneer turns sour & slimy',
    desc: 'Cottage cheese shows yellowish discoloration and whey separation after 4 days',
    commodity: 'Fresh Dairy Paneer',
    packaging: 'Standard vacuum bag at 6°C',
  },
  {
    title: 'Packet seal leaks during transit',
    desc: 'Seams burst open during mountain/high-altitude road transport',
    commodity: 'Puffed Snacks / Namkeen',
    packaging: 'Multi-layer laminated pouch',
  },
  {
    title: 'Product becomes brittle / oxidized',
    desc: 'Almonds and nuts taste rancid and stale after 1 month',
    commodity: 'Roasted Raw Almonds',
    packaging: 'Transparent PET pouch',
  },
];

export const PackagingDoctor: React.FC<PackagingDoctorProps> = ({ isMsmeMode }) => {
  const [problemText, setProblemText] = useState<string>('');
  const [commodity, setCommodity] = useState<string>('');
  const [currentPackaging, setCurrentPackaging] = useState<string>('');
  const [storageCond, setStorageCond] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<PackagingDiagnosis | null>(null);

  const handleDiagnose = async (textToDiagnose?: string, comm?: string, pack?: string) => {
    const query = textToDiagnose || problemText;
    if (!query.trim()) return;

    setIsLoading(true);
    const result = await diagnosePackagingProblem(
      query,
      comm || commodity,
      pack || currentPackaging,
      storageCond
    );
    setDiagnosis(result);
    setIsLoading(false);
  };

  const selectPreset = (preset: typeof PRESET_SYMPTOMS[0]) => {
    setProblemText(preset.desc);
    setCommodity(preset.commodity);
    setCurrentPackaging(preset.packaging);
    handleDiagnose(preset.desc, preset.commodity, preset.packaging);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Clinic Header */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-900 text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-teal-800 text-teal-200 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-teal-200 uppercase tracking-wider">
            Packaging Doctor Diagnostic Clinic
          </span>
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2">
          Diagnose Food Packaging Failures
        </h1>
        <p className="text-xs md:text-sm text-teal-100/90 max-w-2xl leading-relaxed">
          Describe any quality loss, seal failure, moisture ingress, or premature spoilage.
          Our diagnostic engine analyzes the biochemical root-cause, flags the critical packaging parameter,
          and prescribes upgraded material structures.
        </p>
      </div>

      {/* Preset Common Symptoms */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Common Spoilage Symptoms (Click to Diagnose):</span>
          </span>
          <span className="text-[10px] text-slate-400">One-click failure analysis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESET_SYMPTOMS.map((preset, i) => (
            <button
              key={i}
              onClick={() => selectPreset(preset)}
              className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 text-left transition-all group"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-teal-900 flex items-center justify-between">
                <span>{preset.title}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-teal-600 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Input Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Custom Problem Description</h3>
          <span className="text-[11px] text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
            Voice & Text Input Enabled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative flex items-center">
            <input
              type="text"
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              placeholder="Food Commodity (e.g. Potato chips, Tomatoes)"
              className="w-full text-xs pl-3 pr-10 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
              <VoiceInputButton
                onTranscript={(text) => setCommodity(text)}
                size="sm"
                tooltip="Speak commodity name"
              />
            </div>
          </div>

          <input
            type="text"
            value={currentPackaging}
            onChange={(e) => setCurrentPackaging(e.target.value)}
            placeholder="Current Packaging (e.g. Polythene bag, LDPE film)"
            className="text-xs px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />

          <input
            type="text"
            value={storageCond}
            onChange={(e) => setStorageCond(e.target.value)}
            placeholder="Storage Condition (e.g. Ambient 30°C, 80% RH)"
            className="text-xs px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-700">
              Describe what is going wrong (or click microphone to speak):
            </label>
            <VoiceInputButton
              onTranscript={(text) => {
                setProblemText((prev) => (prev ? `${prev} ${text}` : text));
              }}
              size="sm"
              tooltip="Speak failure symptoms with microphone"
            />
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="Describe symptoms (e.g. 'The chips are becoming soggy within 10 days', 'Tomatoes are rotting and smelling bad inside sealed plastic', 'Seals burst open during delivery'). Click the mic to speak hands-free..."
              className="w-full text-xs p-3 pr-12 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 leading-relaxed"
            />
          </div>
        </div>

        <button
          onClick={() => handleDiagnose()}
          disabled={isLoading || !problemText.trim()}
          className="w-full bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Root Cause with Packaging Doctor...</span>
            </>
          ) : (
            <>
              <Stethoscope className="w-4 h-4 text-teal-300" />
              <span>Diagnose Issue & Prescribe Upgrades</span>
            </>
          )}
        </button>
      </div>

      {/* Diagnostic Prescription Results */}
      {diagnosis && (
        <div className="bg-white rounded-2xl border-2 border-teal-500/40 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded">
                  Clinical Diagnosis Report
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Confidence: {diagnosis.confidence}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                {diagnosis.problemSummary}
              </h2>
            </div>

            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          {/* Doctor's Direct Answer & Action Plan */}
          {diagnosis.directAnswer && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50/90 via-emerald-50/70 to-teal-50/90 border-2 border-teal-400 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-950 font-black text-sm">
                  <Sparkles className="w-4 h-4 text-teal-700" />
                  <span>Packaging Doctor's Direct Clinical Answer:</span>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-800 text-white px-2.5 py-0.5 rounded-full">
                  Direct Rx
                </span>
              </div>
              <p className="text-sm text-slate-900 leading-relaxed font-semibold">
                {diagnosis.directAnswer}
              </p>
            </div>
          )}

          {/* Breakdown Steps (Problem -> Cause -> Parameter -> Suggested Improvement) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Likely Root Cause */}
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-1.5">
              <div className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Likely Biochemical / Physical Cause</span>
              </div>
              <p className="text-xs text-rose-950 leading-relaxed font-medium">
                {diagnosis.likelyCause}
              </p>
            </div>

            {/* Critical Packaging Parameter */}
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-1.5">
              <div className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                <span>Critical Packaging Parameter: {diagnosis.criticalParameter}</span>
              </div>
              <p className="text-xs text-teal-950 leading-relaxed">
                {diagnosis.parameterExplanation}
              </p>
            </div>
          </div>

          {/* Immediate Corrective Action */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
            <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Immediate Corrective Action</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed font-medium">
              {diagnosis.suggestedImprovement}
            </p>
          </div>

          {/* Recommended Upgraded Materials */}
          {diagnosis.packagingAlternatives && diagnosis.packagingAlternatives.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Prescribed Packaging Material Upgrades:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {diagnosis.packagingAlternatives.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1"
                  >
                    <span className="text-xs font-bold text-slate-900 block">{alt.material}</span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      Structure: {alt.structure}
                    </span>
                    <p className="text-[11px] text-teal-900 font-medium pt-1">
                      ✓ {alt.whyBetter}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Small Farmer / MSME Actionable Tip */}
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/80 flex items-start gap-3">
            <Sprout className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 space-y-1">
              <span className="font-bold">Small Producer / MSME Tip (No Jargon):</span>
              <p className="leading-relaxed">{diagnosis.msmeFarmerTip}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
