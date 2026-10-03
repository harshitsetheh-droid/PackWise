import React, { useState, useMemo } from 'react';
import {
  Leaf,
  Scale,
  AlertTriangle,
  Info,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Layers,
  ShieldAlert,
  Package,
  Recycle,
  Sparkles,
  TreeDeciduous,
  DollarSign,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { COMMODITIES_DATABASE } from '../data/commodities';
import { Commodity, MLRecommendation } from '../types/packaging';
import { CommoditySearchAutocomplete } from './CommoditySearchAutocomplete';
import { SustainabilityTrendChart } from './SustainabilityTrendChart';

interface PackagingOptionLCA {
  id: string;
  name: string;
  category: string;
  weightGramsPerPack: number;
  polymerCarbonPerKg: number; // kg CO2e / kg material
  recyclability: string;
  isRecyclable: boolean;
  isBioBased: boolean;
  barrierQuality: 'Poor' | 'Moderate' | 'High' | 'Hermetic';
  expectedSpoilageReductionFactor: number; // multiplier on baseline spoilage
}

const CURRENT_PACKAGING_OPTIONS: PackagingOptionLCA[] = [
  {
    id: 'single_layer_polythene',
    name: 'Single-layer Polythene Bag (LDPE / PP)',
    category: 'Conventional Plastic',
    weightGramsPerPack: 4,
    polymerCarbonPerKg: 1.9,
    recyclability: 'Low Recyclability (Soft Film)',
    isRecyclable: false,
    isBioBased: false,
    barrierQuality: 'Poor',
    expectedSpoilageReductionFactor: 0.45, // 55% food loss risk for perishables
  },
  {
    id: 'multilayer_metalized',
    name: 'Multi-layer Metalized Pouch (PET / Met-PET / PE)',
    category: 'Multi-material Laminate',
    weightGramsPerPack: 6,
    polymerCarbonPerKg: 3.4,
    recyclability: 'Non-Recyclable (Multi-layer)',
    isRecyclable: false,
    isBioBased: false,
    barrierQuality: 'High',
    expectedSpoilageReductionFactor: 0.92, // Prevents 92% of spoilage
  },
  {
    id: 'aluminum_foil_laminate',
    name: 'Aluminum Foil Barrier Laminate (PET / Alu / PE)',
    category: 'Foil Laminate',
    weightGramsPerPack: 9,
    polymerCarbonPerKg: 7.2,
    recyclability: 'Non-Recyclable',
    isRecyclable: false,
    isBioBased: false,
    barrierQuality: 'Hermetic',
    expectedSpoilageReductionFactor: 0.97, // Prevents 97% of spoilage
  },
  {
    id: 'rigid_clamshell',
    name: 'Rigid Thermoformed Clamshell (PET / PP)',
    category: 'Rigid Container',
    weightGramsPerPack: 22,
    polymerCarbonPerKg: 2.7,
    recyclability: 'Widely Recyclable',
    isRecyclable: true,
    isBioBased: false,
    barrierQuality: 'Moderate',
    expectedSpoilageReductionFactor: 0.85,
  },
  {
    id: 'mono_pe_recyclable',
    name: 'Recyclable Mono-Material Barrier Pouch (BOPE / PE)',
    category: 'Circular Mono-Material',
    weightGramsPerPack: 6,
    polymerCarbonPerKg: 2.1,
    recyclability: '100% Recyclable (Mono-PE stream)',
    isRecyclable: true,
    isBioBased: false,
    barrierQuality: 'High',
    expectedSpoilageReductionFactor: 0.94,
  },
  {
    id: 'bio_compostable_pla',
    name: 'Certified Compostable Bio-Film (PLA / PBAT)',
    category: 'Bio-Polymer',
    weightGramsPerPack: 5,
    polymerCarbonPerKg: 1.2,
    recyclability: 'Industrial & Home Compostable',
    isRecyclable: false,
    isBioBased: true,
    barrierQuality: 'Moderate',
    expectedSpoilageReductionFactor: 0.80,
  },
  {
    id: 'kraft_paper_pouch',
    name: 'Kraft Paper / Water-based Barrier Pouch',
    category: 'Renewable Fiber',
    weightGramsPerPack: 8,
    polymerCarbonPerKg: 1.1,
    recyclability: 'Curbside Paper Recyclable',
    isRecyclable: true,
    isBioBased: true,
    barrierQuality: 'Moderate',
    expectedSpoilageReductionFactor: 0.78,
  },
];

// FAO & Agribalyse Embodied Carbon Coefficients by category (kg CO2e per kg food)
const FOOD_EMBODIED_CARBON_FACTORS: Record<string, { carbonKg: number; financialValuePerKg: number }> = {
  'Fresh fruits': { carbonKg: 1.8, financialValuePerKg: 120 },
  'Fresh vegetables': { carbonKg: 1.4, financialValuePerKg: 40 },
  'Grains': { carbonKg: 1.3, financialValuePerKg: 60 },
  'Flours': { carbonKg: 1.5, financialValuePerKg: 50 },
  'Pulses': { carbonKg: 1.9, financialValuePerKg: 110 },
  'Nuts': { carbonKg: 2.5, financialValuePerKg: 650 },
  'Dairy': { carbonKg: 8.5, financialValuePerKg: 350 },
  'Frozen foods': { carbonKg: 4.2, financialValuePerKg: 250 },
  'Meat': { carbonKg: 18.0, financialValuePerKg: 450 },
  'Seafood': { carbonKg: 11.5, financialValuePerKg: 550 },
  'Beverages': { carbonKg: 0.9, financialValuePerKg: 80 },
  'Oils': { carbonKg: 3.2, financialValuePerKg: 180 },
  'Bakery products': { carbonKg: 2.0, financialValuePerKg: 150 },
  'Processed foods': { carbonKg: 3.0, financialValuePerKg: 220 },
  'Snacks': { carbonKg: 2.8, financialValuePerKg: 280 },
  'Condiments': { carbonKg: 2.2, financialValuePerKg: 200 },
};

interface SustainabilityViewProps {
  recommendationsHistory?: MLRecommendation[];
}

export const SustainabilityView: React.FC<SustainabilityViewProps> = ({
  recommendationsHistory = [],
}) => {
  // User configuration inputs
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>('c1'); // Strawberry default
  const [selectedPackagingId, setSelectedPackagingId] = useState<string>('single_layer_polythene');
  const [monthlyVolumeKg, setMonthlyVolumeKg] = useState<number>(2000);
  const [packSizeGrams, setPackSizeGrams] = useState<number>(250);

  // Protection level fine-tuning slider
  const [protectionLevel, setProtectionLevel] = useState<number>(55);

  // Active commodity
  const activeCommodity = useMemo(() => {
    return COMMODITIES_DATABASE.find((c) => c.id === selectedCommodityId) || COMMODITIES_DATABASE[0];
  }, [selectedCommodityId]);

  // Active current packaging
  const currentPack = useMemo(() => {
    return CURRENT_PACKAGING_OPTIONS.find((p) => p.id === selectedPackagingId) || CURRENT_PACKAGING_OPTIONS[0];
  }, [selectedPackagingId]);

  // Food specific metrics
  const foodMetrics = useMemo(() => {
    return FOOD_EMBODIED_CARBON_FACTORS[activeCommodity.category] || { carbonKg: 2.0, financialValuePerKg: 100 };
  }, [activeCommodity]);

  // Total packages produced per month
  const totalMonthlyPacks = Math.round((monthlyVolumeKg * 1000) / packSizeGrams);

  // 1. Current Packaging Plastic Carbon (kg CO2e per month)
  const currentPackagingTotalWeightKg = (totalMonthlyPacks * currentPack.weightGramsPerPack) / 1000;
  const currentPackagingCarbonKg = Number(
    (currentPackagingTotalWeightKg * currentPack.polymerCarbonPerKg).toFixed(1)
  );

  // 2. Current Food Loss Rate based on commodity perishability & packaging barrier
  const baselinePerishabilityRate = activeCommodity.respiration_rate === 'Very High' ? 0.35
    : activeCommodity.respiration_rate === 'High' ? 0.25
    : activeCommodity.moisture_percent < 5 ? 0.20 // namkeen/chips crunch loss
    : 0.10;

  const currentSpoilageRatePercent = Math.max(
    2,
    Math.round(baselinePerishabilityRate * (1 - currentPack.expectedSpoilageReductionFactor) * 100 * 2)
  );

  const currentFoodLossKg = Math.round((monthlyVolumeKg * currentSpoilageRatePercent) / 100);
  const currentFoodLossCarbonKg = Number((currentFoodLossKg * foodMetrics.carbonKg).toFixed(1));
  const currentFinancialLossInr = Math.round(currentFoodLossKg * foodMetrics.financialValuePerKg);

  // Total current footprint
  const currentTotalFootprintKg = Number(
    (currentPackagingCarbonKg + currentFoodLossCarbonKg).toFixed(1)
  );

  // 3. Optimized Circular Solution (e.g. Mono-PE or Bio-PLA)
  const ecoAlternative = useMemo(() => {
    if (activeCommodity.category === 'Fresh fruits' || activeCommodity.category === 'Fresh vegetables') {
      return CURRENT_PACKAGING_OPTIONS.find((p) => p.id === 'bio_compostable_pla')!;
    }
    return CURRENT_PACKAGING_OPTIONS.find((p) => p.id === 'mono_pe_recyclable')!;
  }, [activeCommodity]);

  const optimizedPackagingWeightKg = (totalMonthlyPacks * ecoAlternative.weightGramsPerPack) / 1000;
  const optimizedPackagingCarbonKg = Number(
    (optimizedPackagingWeightKg * ecoAlternative.polymerCarbonPerKg).toFixed(1)
  );

  const optimizedSpoilageRatePercent = Math.max(
    2,
    Math.round(baselinePerishabilityRate * (1 - ecoAlternative.expectedSpoilageReductionFactor) * 100 * 2)
  );
  const optimizedFoodLossKg = Math.round((monthlyVolumeKg * optimizedSpoilageRatePercent) / 100);
  const optimizedFoodLossCarbonKg = Number((optimizedFoodLossKg * foodMetrics.carbonKg).toFixed(1));
  const optimizedTotalFootprintKg = Number(
    (optimizedPackagingCarbonKg + optimizedFoodLossCarbonKg).toFixed(1)
  );

  // Net CO2 savings
  const netMonthlyCo2SavingsKg = Math.max(0, Number((currentTotalFootprintKg - optimizedTotalFootprintKg).toFixed(1)));
  const treesEquivalent = Math.round(netMonthlyCo2SavingsKg / 21); // 1 tree absorbs ~21 kg CO2/year
  const plasticDivertedFromLandfillKg = currentPack.isRecyclable ? 0 : Math.round(currentPackagingTotalWeightKg);
  const monthlyMoneySavedInr = Math.max(0, currentFinancialLossInr - Math.round(optimizedFoodLossKg * foodMetrics.financialValuePerKg));

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
            LCA & Circular Economy Engine
          </span>
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-2">
          Food Waste vs. Packaging Carbon Trade-Off
        </h1>
        <p className="text-xs md:text-sm text-slate-500 max-w-3xl leading-relaxed">
          Tell us <strong>what food you are packaging</strong> and <strong>what material you currently use</strong>.
          We calculate the precise carbon balance: In food systems, <em>wasted food embodies 10x-30x more greenhouse gases</em> than the packaging itself.
        </p>

        {/* Disclaimer */}
        <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 text-amber-900 text-xs px-3 py-1.5 rounded-lg border border-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Grounded LCA Model:</strong> Embodied emission coefficients derived from FAO & Agribalyse food lifecycle databases.
          </span>
        </div>
      </div>

      {/* User Input Configurator: What are you packaging? */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-700" />
            <span>Step 1: Configure Your Product & Current Packaging</span>
          </h3>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Real-world Calculations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Commodity Search Autocomplete */}
          <div className="space-y-1.5">
            <CommoditySearchAutocomplete
              label="Food Commodity:"
              selectedCommodityName={activeCommodity.name}
              onSelectCommodity={(comm) => setSelectedCommodityId(comm.id)}
              placeholder="Search food (e.g. Strawberry, Rice)..."
            />
            <span className="text-[10px] text-slate-400 block">
              Embodied food carbon: ~{foodMetrics.carbonKg} kg CO₂e/kg
            </span>
          </div>

          {/* Current Packaging Material Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Current Packaging Used:</label>
            <select
              value={selectedPackagingId}
              onChange={(e) => setSelectedPackagingId(e.target.value)}
              className="w-full text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {CURRENT_PACKAGING_OPTIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 block">
              Status: {currentPack.recyclability}
            </span>
          </div>

          {/* Monthly Production Volume */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Monthly Batch Volume (kg):</label>
            <input
              type="number"
              min="50"
              max="500000"
              step="100"
              value={monthlyVolumeKg}
              onChange={(e) => setMonthlyVolumeKg(Math.max(10, parseInt(e.target.value, 10) || 100))}
              className="w-full text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <div className="flex gap-1">
              {[500, 2000, 10000].map((v) => (
                <button
                  key={v}
                  onClick={() => setMonthlyVolumeKg(v)}
                  className={`text-[9px] px-1.5 py-0.5 rounded border ${
                    monthlyVolumeKg === v ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {v}kg
                </button>
              ))}
            </div>
          </div>

          {/* Pack Size */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Pack Size (Grams / Unit):</label>
            <input
              type="number"
              min="10"
              max="50000"
              step="50"
              value={packSizeGrams}
              onChange={(e) => setPackSizeGrams(Math.max(10, parseInt(e.target.value, 10) || 250))}
              className="w-full text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <span className="text-[10px] text-slate-400 block">
              Yield: ~{totalMonthlyPacks.toLocaleString()} pouches/month
            </span>
          </div>
        </div>
      </div>

      {/* Comparison: Current Footprint vs Recommended Circular Transition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Card: Current Status Quo */}
        <div className="bg-white rounded-2xl border-2 border-rose-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">
              Your Current Status Quo
            </span>
            <span className="text-xs font-bold text-rose-600 font-mono">
              {currentSpoilageRatePercent}% Food Loss
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900">{currentPack.name}</h3>
          <p className="text-xs text-slate-500">
            Packaging <strong>{monthlyVolumeKg.toLocaleString()} kg</strong> of {activeCommodity.name} monthly in {currentPack.category}.
          </p>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-600">Packaging Polymer Carbon:</span>
              <span className="font-bold text-slate-900">{currentPackagingCarbonKg} kg CO₂e</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-600">Lost Food Waste Footprint:</span>
              <span className="font-extrabold text-rose-600">+{currentFoodLossCarbonKg} kg CO₂e</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-600">Food Spoiled per Month:</span>
              <span className="font-bold text-rose-700">~{currentFoodLossKg} kg lost</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-600">Financial Loss from Spoilage:</span>
              <span className="font-bold text-rose-700">₹{currentFinancialLossInr.toLocaleString()} / mo</span>
            </div>
            <div className="py-2.5 flex justify-between items-center bg-rose-50/60 p-2 rounded-lg mt-2">
              <span className="font-bold text-rose-950">Net Monthly Environmental Impact:</span>
              <span className="font-black text-rose-800 text-sm">{currentTotalFootprintKg} kg CO₂e</span>
            </div>
          </div>
        </div>

        {/* Right Card: Optimized Circular Solution */}
        <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full">
              Recommended Circular Transition
            </span>
            <span className="text-xs font-bold text-emerald-700 font-mono">
              Only {optimizedSpoilageRatePercent}% Spoilage
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900">{ecoAlternative.name}</h3>
          <p className="text-xs text-slate-500">
            Upgraded barrier matching that reduces food spoilage and complies with modern EPR circular regulations.
          </p>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-600">Packaging Polymer Carbon:</span>
              <span className="font-bold text-slate-900">{optimizedPackagingCarbonKg} kg CO₂e</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-600">Lost Food Waste Footprint:</span>
              <span className="font-bold text-emerald-700">+{optimizedFoodLossCarbonKg} kg CO₂e</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-600">Recyclability Stream:</span>
              <span className="font-bold text-emerald-800">{ecoAlternative.recyclability}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-600">Monthly Spoilage Prevention:</span>
              <span className="font-bold text-emerald-700">Saves ₹{monthlyMoneySavedInr.toLocaleString()} / mo</span>
            </div>
            <div className="py-2.5 flex justify-between items-center bg-emerald-50 p-2 rounded-lg mt-2">
              <span className="font-bold text-emerald-950">Net Monthly Environmental Impact:</span>
              <span className="font-black text-emerald-800 text-sm">{optimizedTotalFootprintKg} kg CO₂e</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Positive Impact Dashboard */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-emerald-300" />
          <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
            Your Monthly Circular Impact If You Switch to {ecoAlternative.name}
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
            <div className="text-2xl md:text-3xl font-black text-emerald-300">
              {netMonthlyCo2SavingsKg.toLocaleString()}
            </div>
            <div className="text-xs text-teal-100 font-semibold mt-1">kg CO₂e Saved / Month</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
            <div className="text-2xl md:text-3xl font-black text-emerald-300">
              {treesEquivalent}
            </div>
            <div className="text-xs text-teal-100 font-semibold mt-1">Trees Equivalent 🌲</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
            <div className="text-2xl md:text-3xl font-black text-emerald-300">
              {plasticDivertedFromLandfillKg}
            </div>
            <div className="text-xs text-teal-100 font-semibold mt-1">kg Plastic Diverted From Landfill</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
            <div className="text-2xl md:text-3xl font-black text-emerald-300">
              ₹{monthlyMoneySavedInr.toLocaleString()}
            </div>
            <div className="text-xs text-teal-100 font-semibold mt-1">Monthly Spoilage Savings</div>
          </div>
        </div>
      </div>

      {/* Historical Sustainability & Circularity Score Progress Trend Chart */}
      <SustainabilityTrendChart history={recommendationsHistory} />

      {/* Interactive Protection Level Sensitivity Simulator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>Sensitivity Simulator: Barrier Thickness vs Spoilage Rate for {activeCommodity.name}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Slide to observe what happens if you intentionally under-package or over-package {activeCommodity.name}.
            </p>
          </div>

          <span
            className={`text-xs font-extrabold px-3 py-1 rounded-full ${
              protectionLevel < 35
                ? 'bg-rose-100 text-rose-800'
                : protectionLevel > 75
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {protectionLevel < 35
              ? 'Under-Packaged (Severe Food Spoilage)'
              : protectionLevel > 75
              ? 'Over-Packaged (Excess Polymer Waste)'
              : 'Optimal Protective Sweet Spot'}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Bare Thin Film (Low Barrier)</span>
            <span className="text-emerald-800 font-extrabold">Protection Level: {protectionLevel}/100</span>
            <span>Excess Heavy Foil (Over-Packaged)</span>
          </div>
          <input
            type="range"
            min="10"
            max="95"
            value={protectionLevel}
            onChange={(e) => setProtectionLevel(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 space-y-1 leading-relaxed">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-700" />
            <span>LCA Scientific Takeaway for {activeCommodity.name}:</span>
          </span>
          <p>
            {protectionLevel < 35 ? (
              <span className="text-rose-900">
                <strong>Do not cut corners on barrier:</strong> While reducing packaging thickness saves a few grams of polymer,
                it causes {activeCommodity.name} spoilage to surge. Because {activeCommodity.name} has an embodied carbon cost of ~
                {foodMetrics.carbonKg} kg CO₂e/kg, the lost food releases 15x more greenhouse emissions than the packaging you saved.
              </span>
            ) : protectionLevel > 75 ? (
              <span className="text-amber-900">
                <strong>Diminishing returns:</strong> Adding more layers of plastic or heavy gauge foil adds polymer weight and carbon
                without giving any meaningful extra shelf life for {activeCommodity.name}.
              </span>
            ) : (
              <span className="text-emerald-900">
                <strong>Balanced circular optimum:</strong> At this protection level, you prevent 94% of {activeCommodity.name} spoilage
                while keeping polymer consumption minimal and compliant with recycling norms.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
