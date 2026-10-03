import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Database,
  Layers,
  Sparkles,
  FileCode,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { DATASET_METRICS } from '../ml/datasetMetrics';

export const AboutModal: React.FC = () => {
  const models = Object.values(DATASET_METRICS.trainedModels);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
            System Architecture & Model Governance
          </span>
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-2">
          PackWise AI Technical Specifications
        </h1>
        <p className="text-xs md:text-sm text-slate-500 max-w-3xl leading-relaxed">
          PackWise AI decouples the postharvest data layer,
          multi-task ML inference models, and Gemini AI explanation layer to guarantee explainability,
          zero hallucination risk, and seamless future real-world laboratory dataset swaps.
        </p>

        {/* Model Versioning Status Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Model Version</span>
            <span className="font-extrabold text-slate-900">PackWise ML Tabular v1.4</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Training Dataset</span>
            <span className="font-extrabold text-slate-900">Synthetic Dev Dataset</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Dataset Size</span>
            <span className="font-extrabold text-slate-900">20,000 Records</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Architecture Status</span>
            <span className="font-extrabold text-emerald-800">Production-Ready API</span>
          </div>
        </div>
      </div>

      {/* Ten Success Criteria Answered */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Core Technical Evaluation Matrix: 10 Key System Criteria
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-bold text-slate-900">1. What problem is being solved?</span>
            <p className="text-slate-600 mt-1">
              Food packaging mismatches cause huge postharvest spoilage (40% of farm produce). PackWise AI matches
              commodity respiration/biochemistry with exact polymer barrier thermodynamics.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-bold text-slate-900">2. How does the ML model recommend?</span>
            <p className="text-slate-600 mt-1">
              Decoupled multi-task pipeline (Models A–H): Material, OTR, WVTR, thickness, sealability, and MAP gas
              formulations are predicted independently.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-bold text-slate-900">3. Why was that packaging chosen?</span>
            <p className="text-slate-600 mt-1">
              Explainable AI (XAI) feature attribution pinpoints driving factors: respiration, water activity, lipid
              rancidity, or transit vibration.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-bold text-slate-900">4. What happens when conditions change?</span>
            <p className="text-slate-600 mt-1">
              Our PRIMARY USP—the What-If Simulator—re-runs the identical ML pipeline dynamically to compute before/after
              deltas and explain specification changes.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-bold text-slate-900">5. Can the system compare alternatives?</span>
            <p className="text-slate-600 mt-1">
              3-Way comparative matrix ranks Recommended vs Lower-Cost vs Eco-Friendly alternatives with transparent
              pros and trade-offs.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-bold text-slate-900">6. Food waste vs packaging waste?</span>
            <p className="text-slate-600 mt-1">
              Refutes "less packaging is always better" by modeling how food loss embodies 10x-30x more carbon than
              protective barrier polymers.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-bold text-slate-900">7. Can it diagnose packaging problems?</span>
            <p className="text-slate-600 mt-1">
              The Packaging Doctor provides a clinical failure diagnostic engine identifying problem → cause → parameter →
              action → material upgrade.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-bold text-slate-900">8. Can small farmers & MSMEs understand?</span>
            <p className="text-slate-600 mt-1">
              Dedicated MSME Mode switches technical terms (e.g., WVTR) into everyday analogies ("protection from moisture
              leakage so chips stay crisp").
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-bold text-slate-900">9. Does it know when data is uncertain?</span>
            <p className="text-slate-600 mt-1">
              Out-of-Distribution (OOD) range check flags extreme inputs and lowers confidence, preventing dangerous
              overconfident predictions.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-bold text-slate-900">10. Can synthetic data be swapped with real data?</span>
            <p className="text-slate-600 mt-1">
              Clean architectural separation: The data layer is decoupled in TypeScript modules. Loading laboratory-certified
              CSV datasets requires zero frontend redesign.
            </p>
          </div>
        </div>
      </div>

      {/* Model Benchmark Performance (Models A–H on 20,000 synthetic records) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Model Performance Benchmark (Synthetic Development Dataset)
            </h3>
            <p className="text-xs text-slate-500">
              Transparent reporting of test set metrics across all 8 multi-task ML models.
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
            Synthetic Benchmark
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {models.map((m, i) => (
            <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900">{m.modelName}</span>
                <p className="text-[11px] text-slate-500">
                  Target: <span className="font-mono text-slate-700">{m.targetFeature}</span> • Algorithm:{' '}
                  {m.algorithm}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {m.classificationMetrics && (
                  <>
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      Acc: {(m.classificationMetrics.accuracy * 100).toFixed(1)}%
                    </span>
                    <span className="text-slate-600">
                      F1: {m.classificationMetrics.macroF1.toFixed(3)}
                    </span>
                  </>
                )}

                {m.regressionMetrics && (
                  <>
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      R²: {m.regressionMetrics.r2.toFixed(3)}
                    </span>
                    <span className="text-slate-600">
                      MAE: {m.regressionMetrics.mae} {m.regressionMetrics.unit}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
