import React, { useState } from 'react';
import { Info } from 'lucide-react';

export interface MetricDefinition {
  title: string;
  fullName: string;
  standard?: string;
  definition: string;
  significance: string;
}

export const PACKAGING_DEFINITIONS: Record<string, MetricDefinition> = {
  otr: {
    title: 'OTR',
    fullName: 'Oxygen Transmission Rate',
    standard: 'ASTM D3985 / ISO 15105-2',
    definition:
      'Volume of oxygen gas passing through a square meter of film in a 24-hour period under standard conditions (23°C, 0% RH).',
    significance:
      'Critical for preventing lipid rancidity, enzymatic browning, color fading, and aerobic mould proliferation in oxygen-sensitive foods.',
  },
  wvtr: {
    title: 'WVTR',
    fullName: 'Water Vapor Transmission Rate',
    standard: 'ASTM F1249 / ISO 15106-3',
    definition:
      'Mass of water vapor permeating through film area per day under accelerated tropical humidity (38°C, 90% RH).',
    significance:
      'Maintains critical water activity equilibrium; prevents dry snacks from turning soggy and moist fresh foods from dehydration.',
  },
  thickness: {
    title: 'Thickness',
    fullName: 'Total Film Caliper / Gauge',
    standard: 'ASTM D6988',
    definition:
      'Combined structural caliper of co-extruded or laminated barrier film layers, measured in microns (µm) or mils.',
    significance:
      'Directly governs puncture resistance, drop-impact durability, flex-crack resistance, and seal integrity during transit.',
  },
  shelf_life: {
    title: 'Shelf Life',
    fullName: 'Predicted Commercial Shelf Life',
    standard: 'Arrhenius Shelf Life Modeling',
    definition:
      'Estimated duration that food remains organoleptically fresh, microbially safe, and commercially viable in the prescribed package.',
    significance:
      'Balances required distribution logistics against food degradation kinetics under evaluated temperature and humidity.',
  },
  sealability: {
    title: 'Sealability',
    fullName: 'Hermetic Heat Sealing Window',
    standard: 'ASTM F88 / ASTM F2029',
    definition:
      'Optimal temperature range and seal jaw pressure required to melt the sealant layer into a continuous, leak-free weld.',
    significance:
      'Ensures packages remain hermetic without channel leaks, micro-pinholes, or thermal burn-through on high-speed FFS machines.',
  },
  mechanical_strength: {
    title: 'Mechanical Strength',
    fullName: 'Tensile & Rupture Strength',
    standard: 'ASTM D882 / ISO 527-3',
    definition:
      'Tensile stress resistance (in MPa or psi) and seal joint peel force (N / 15mm) the film sustains before physical failure.',
    significance:
      'Withstands transit vibrations, pallet compression in warehouses, and rough cargo handling without bursting.',
  },
  map_suitability: {
    title: 'MAP Suitability',
    fullName: 'Modified Atmosphere Packaging',
    standard: 'ISO 22000 Hygiene Standards',
    definition:
      'Whether the food product benefits from headspace evacuation and replacement with food-grade protective gases.',
    significance:
      'Suppresses fungal growth, retards ethylene respiration in fruits, and eliminates need for synthetic chemical preservatives.',
  },
  map_gas: {
    title: 'Gas Mixture',
    fullName: 'Protective Headspace Gas Formulation',
    standard: 'EIGA / FDA Food Contact Guidelines',
    definition:
      'Prescribed headspace gas ratio of Carbon Dioxide (CO₂ - antimicrobial), Oxygen (O₂ - color/respiration), and Nitrogen (N₂ - inert filler).',
    significance:
      'CO₂ dissolves into food moisture to inhibit aerobic bacteria; N₂ prevents packaging collapse from gas absorption.',
  },
  food_waste_risk: {
    title: 'Food Waste Risk',
    fullName: 'Predicted Spoilage Probability',
    standard: 'FAO Food Loss & Waste Protocol',
    definition:
      'Calculated percentage likelihood of perishable food loss before reaching the end consumer under current conditions.',
    significance:
      'Every 1% reduction in spoilage saves significant embodied farming water, fertilizers, and greenhouse gas emissions.',
  },
  sustainability_score: {
    title: 'Circularity Score',
    fullName: 'Packaging Environmental Score',
    standard: 'ISO 14040/44 LCA Methodology',
    definition:
      'Multi-parameter circularity index (0–100) scoring mono-material purity, recyclability, carbon intensity, and compostability.',
    significance:
      'Guides brand owners toward EPR (Extended Producer Responsibility) compliance and Plastic Waste Management rules.',
  },
  carbon_footprint: {
    title: 'Carbon Footprint',
    fullName: 'Embodied Polymer Greenhouse Gas Index',
    standard: 'GHG Protocol Product Standard',
    definition:
      'Estimated cradle-to-gate greenhouse emissions (kg CO₂e) per 1,000 packaging units manufactured and distributed.',
    significance:
      'Helps evaluate the environmental trade-off: ensuring packaging carbon is lower than the embodied carbon of saved food.',
  },
};

interface PackagingMetricTooltipProps {
  metricKey: keyof typeof PACKAGING_DEFINITIONS;
  label?: string;
  className?: string;
}

export const PackagingMetricTooltip: React.FC<PackagingMetricTooltipProps> = ({
  metricKey,
  label,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const def = PACKAGING_DEFINITIONS[metricKey];

  if (!def) return <span>{label}</span>;

  return (
    <div
      className={`relative inline-flex items-center gap-1 group/tooltip ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen((prev) => !prev)}
    >
      <span className="cursor-help">{label || def.title}</span>
      <button
        type="button"
        aria-label={`Definition of ${def.fullName}`}
        className="text-slate-400 group-hover/tooltip:text-emerald-700 hover:text-emerald-800 transition-colors focus:outline-none"
      >
        <Info className="w-3 h-3 shrink-0" />
      </button>

      {/* Tooltip Popup Bubble */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-72 p-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 pointer-events-none text-left animate-in fade-in duration-150">
          <div className="flex items-center justify-between gap-1 pb-1 border-b border-slate-700/80 mb-1.5">
            <span className="font-extrabold text-xs text-emerald-400">
              {def.fullName} ({def.title})
            </span>
            {def.standard && (
              <span className="text-[9px] font-mono bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded">
                {def.standard}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-200 leading-snug mb-1.5 font-normal">
            {def.definition}
          </p>
          <div className="text-[10px] text-emerald-200/90 bg-emerald-950/60 p-1.5 rounded-lg border border-emerald-800/40 leading-snug">
            <strong className="text-emerald-400">Engineering Purpose:</strong> {def.significance}
          </div>
          {/* Caret arrow */}
          <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
};
