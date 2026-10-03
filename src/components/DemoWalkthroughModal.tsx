import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  Scale,
  Stethoscope,
  Leaf,
  Layers,
  Thermometer,
  Calendar,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface DemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const DemoWalkthroughModal: React.FC<DemoWalkthroughModalProps> = ({
  isOpen,
  onClose,
  setActiveTab,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  if (!isOpen) return null;

  const demoSteps = [
    {
      step: 1,
      title: 'Select Commodity (Fresh Strawberries)',
      tab: 'recommend' as ActiveTab,
      desc: 'Demonstrates our verified food database covering 40+ commodities across 16 categories, including high-perishable soft berries.',
      highlight: 'Strawberry selected: 91% moisture, pH 3.5, respiration rate: Very High (55 mg CO2/kg-hr).',
    },
    {
      step: 2,
      title: 'Data Resolution & Biological Baseline',
      tab: 'recommend' as ActiveTab,
      desc: 'Transparent provenance: Every biological feature is marked with its verified source or AI-assisted estimate.',
      highlight: 'Pre-flight check confirms zero silent hallucinations and establishes postharvest respiration kinetics.',
    },
    {
      step: 3,
      title: 'Multi-Task ML Engine Execution',
      tab: 'recommend' as ActiveTab,
      desc: 'Runs 8 tabular sub-models: Material (Model A), Sealability (Model B), Shelf Life (Model C), OTR (Model D), WVTR (Model E), Thickness (Model F), MAP (Model G & H).',
      highlight: 'Recommends Micro-Perforated Equilibrium Film (32µm BOPP) with high OTR (12,000 cc) to prevent suffocation.',
    },
    {
      step: 4,
      title: 'Explainable AI (Technical & MSME)',
      tab: 'recommend' as ActiveTab,
      desc: 'Dual explanations: In-depth thermodynamic barrier matching for engineers, plus zero-jargon advice for small farmers.',
      highlight: 'Explains why airtight plastic rots berries and how laser micro-holes permit breathing without dehydration.',
    },
    {
      step: 5,
      title: 'Launch What-If Simulator (Core USP)',
      tab: 'whatif' as ActiveTab,
      desc: 'The primary innovation of PackWise AI: dynamically simulates real-world supply chain disruptions.',
      highlight: 'Loads Strawberry baseline at 2°C chilled, 7 days shelf-life target, 1 day local transit.',
    },
    {
      step: 6,
      title: 'Disruption: Temperature Spike (+18°C)',
      tab: 'whatif' as ActiveTab,
      desc: 'User changes storage temperature from 2°C to 20°C (simulating cold chain failure or room-temperature retail).',
      highlight: 'Arrhenius factor Q10 = 2.2 accelerates respiration and microbial growth exponentially.',
    },
    {
      step: 7,
      title: 'Disruption: Shelf-Life Extended to 14 Days',
      tab: 'whatif' as ActiveTab,
      desc: 'Retailer demands 14 days shelf life instead of 7 days.',
      highlight: 'Target barrier demands change to maintain water activity equilibrium over 2x duration.',
    },
    {
      step: 8,
      title: 'Disruption: Transit Extended to 5 Days',
      tab: 'whatif' as ActiveTab,
      desc: 'Logistics routes through inter-state freight roads.',
      highlight: 'Model B and Model F automatically increase film gauge thickness to resist transit flex cracking.',
    },
    {
      step: 9,
      title: 'Dynamic ML Pipeline Recalculation',
      tab: 'whatif' as ActiveTab,
      desc: 'The system does not use hardcoded sliders—it executes the exact same ML pipeline on the new features.',
      highlight: 'Re-evaluates models A through H in under 50ms.',
    },
    {
      step: 10,
      title: 'Inspect Before vs. After Deltas',
      tab: 'whatif' as ActiveTab,
      desc: 'Clear visual diff: Thickness increased by +12µm, food spoilage risk delta calculated, and root-cause explanation generated.',
      highlight: 'Shows why the material and specifications adapted to the new environmental stress.',
    },
    {
      step: 11,
      title: '3-Way Material Comparison Matrix',
      tab: 'compare' as ActiveTab,
      desc: 'Side-by-side evaluation: Recommended Packaging vs. Lower-Cost Option vs. Eco-Friendly Bio-Film.',
      highlight: 'Demonstrates multi-attribute trade-offs: cost, shelf life, sealability, and food waste risk.',
    },
    {
      step: 12,
      title: 'Food Waste vs. Packaging Impact',
      tab: 'sustainability' as ActiveTab,
      desc: 'Reveals that undertreated packaging increases food loss by 50%—which carries 20x more embodied emissions than plastic.',
      highlight: 'Empowers sustainable decision-making grounded in lifecycle realities.',
    },
    {
      step: 13,
      title: 'Packaging Doctor Diagnostic Clinic',
      tab: 'doctor' as ActiveTab,
      desc: 'Natural-language diagnostic clinic: users describe issues like "chips are soggy" or "tomatoes spoil quickly".',
      highlight: 'Identifies failure parameter (WVTR), explains biochemical cause, and prescribes immediate corrective actions.',
    },
  ];

  const current = demoSteps[currentStep - 1];

  const handleJumpToTab = () => {
    setActiveTab(current.tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase bg-emerald-700/80 px-2 py-0.5 rounded text-emerald-200">
                PackWise Platform
              </span>
              <span className="text-xs font-semibold text-emerald-200">
                Feature Walkthrough
              </span>
            </div>
            <h2 className="text-xl font-black">
              13-Step Decision Support Demonstration
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-emerald-600 h-full transition-all duration-300"
            style={{ width: `${(currentStep / 13) * 100}%` }}
          ></div>
        </div>

        {/* Step Content */}
        <div className="p-6 md:p-8 space-y-5 overflow-y-auto flex-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Step {currentStep} of 13</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
              Feature: {current.tab.toUpperCase()}
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900">{current.title}</h3>

          <p className="text-sm text-slate-600 leading-relaxed">{current.desc}</p>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-xs text-emerald-950 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Key Engineering Insight: </span>
              <span>{current.highlight}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleJumpToTab}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100/80 hover:bg-emerald-200/80 px-3 py-1.5 rounded-lg border border-emerald-300 transition-colors"
          >
            <span>Open This Feature in App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {currentStep < 13 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(13, prev + 1))}
              className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <span>Next ({currentStep + 1}/13)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <span>Finish Walkthrough</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
