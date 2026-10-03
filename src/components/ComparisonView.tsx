import React, { useState, useMemo } from 'react';
import {
  Scale,
  Sparkles,
  Layers,
  Calendar,
  DollarSign,
  Leaf,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Info,
  CheckCircle2,
  Search,
  Filter,
  Check,
  ChevronDown,
} from 'lucide-react';
import { MLRecommendation, PackagingAlternative, Commodity } from '../types/packaging';
import { COMMODITIES_DATABASE } from '../data/commodities';
import { CommoditySearchAutocomplete } from './CommoditySearchAutocomplete';
import { PACKAGING_MATERIALS } from '../data/materials';
import { runPackagingRecommendationPipeline } from '../ml/engine';

interface ComparisonViewProps {
  currentRecommendation?: MLRecommendation | null;
  onSelectAlternative?: (alt: PackagingAlternative) => void;
  onNavigateToWhatIf?: () => void;
  isMsmeMode: boolean;
}

const POPULAR_COMMODITY_PILLS = [
  'Fresh Strawberries',
  'Potato Chips',
  'Paneer',
  'Basmati Rice',
  'Roasted Almonds',
  'Mango Pickle',
  'White Bread',
  'Whole Wheat Flour',
  'Fresh Milk',
  'Apples',
];

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  currentRecommendation,
  onSelectAlternative,
  onNavigateToWhatIf,
  isMsmeMode,
}) => {
  // Commodity selection state
  const initialCommodityName = currentRecommendation
    ? currentRecommendation.commodityName
    : 'Fresh Strawberries';

  const [selectedCommodityName, setSelectedCommodityName] = useState<string>(initialCommodityName);
  const [commoditySearch, setCommoditySearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPrioritization, setSelectedPrioritization] = useState<'balanced' | 'budget' | 'eco'>('balanced');
  
  // Custom comparison mode state
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customMat1Id, setCustomMat1Id] = useState<string>('metallized_pet');
  const [customMat2Id, setCustomMat2Id] = useState<string>('bopp_opp');

  // Find active commodity from database or use baseline
  const activeCommodity: Commodity = useMemo(() => {
    const found = COMMODITIES_DATABASE.find(
      (c) => c.name.toLowerCase() === selectedCommodityName.toLowerCase()
    );
    if (found) return found;

    // Fallback if not directly found in static database
    return {
      id: 'active_comm',
      name: selectedCommodityName,
      category: 'Processed foods',
      moisture_percent: 50,
      pH: 5.5,
      fat_percent: 5,
      respiration_rate: 'None',
      respiration_mg_CO2_kg_hr: 0,
      recommended_storage_temp_C: 15,
      recommended_RH_percent: 65,
      storage_type: 'Ambient',
      typical_shelf_life_days: 30,
      primary_spoilage_factors: ['Moisture ingress'],
      description: selectedCommodityName,
      icon: '🍱',
    };
  }, [selectedCommodityName]);

  // Compute recommendation pipeline dynamically for THIS specific commodity
  const dynamicRec: MLRecommendation = useMemo(() => {
    return runPackagingRecommendationPipeline({
      commodityName: activeCommodity.name,
      category: activeCommodity.category,
      moisture_percent: activeCommodity.moisture_percent,
      pH: activeCommodity.pH,
      fat_percent: activeCommodity.fat_percent,
      respiration_rate: activeCommodity.respiration_rate,
      respiration_mg_CO2_kg_hr: activeCommodity.respiration_mg_CO2_kg_hr,
      storage_temperature_C: activeCommodity.recommended_storage_temp_C,
      relative_humidity_percent: activeCommodity.recommended_RH_percent,
      storage_type: activeCommodity.storage_type,
      desired_shelf_life_days: activeCommodity.typical_shelf_life_days,
      transportation_duration_days: 2,
    });
  }, [activeCommodity]);

  const { recommended, lower_cost, eco_friendly } = dynamicRec.alternatives;
  const options = [recommended, lower_cost, eco_friendly];

  // Filtered commodities list for selector dropdown
  const filteredCommodities = useMemo(() => {
    return COMMODITIES_DATABASE.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(commoditySearch.toLowerCase()) ||
        c.category.toLowerCase().includes(commoditySearch.toLowerCase());
      const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [commoditySearch, selectedCategory]);

  // Find custom materials for side-by-side comparison
  const customMat1 = useMemo(() => PACKAGING_MATERIALS.find((m) => m.id === customMat1Id) || PACKAGING_MATERIALS[0], [customMat1Id]);
  const customMat2 = useMemo(() => PACKAGING_MATERIALS.find((m) => m.id === customMat2Id) || PACKAGING_MATERIALS[1], [customMat2Id]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-300 mb-2">
              <Scale className="w-3.5 h-3.5 text-emerald-700" />
              <span>COMMODITY-SPECIFIC DECISION MATRIX</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">
              Packaging Options & Trade-Offs
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
              Packaging performance is <strong>not universal</strong>. Each food has unique respiration, moisture, and fat kinetics.
              Compare calibrated packaging structures tailored specifically for{' '}
              <strong className="text-emerald-800 font-bold">{activeCommodity.name}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Decision Focus:</span>
            <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1">
              <button
                onClick={() => setSelectedPrioritization('balanced')}
                className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
                  selectedPrioritization === 'balanced'
                    ? 'bg-white text-emerald-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Balanced
              </button>
              <button
                onClick={() => setSelectedPrioritization('budget')}
                className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
                  selectedPrioritization === 'budget'
                    ? 'bg-white text-emerald-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lowest Cost
              </button>
              <button
                onClick={() => setSelectedPrioritization('eco')}
                className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
                  selectedPrioritization === 'eco'
                    ? 'bg-white text-emerald-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Eco Priority
              </button>
            </div>
          </div>
        </div>

        {/* Commodity Selector Bar */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 max-w-md">
              <CommoditySearchAutocomplete
                selectedCommodityName={selectedCommodityName}
                onSelectCommodity={(comm) => setSelectedCommodityName(comm.name)}
                placeholder="Search food commodity (e.g. Potato, Paneer, Rice)..."
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCustomMode(!isCustomMode)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  isCustomMode
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isCustomMode ? '✓ Custom Material Mode Active' : 'Switch to Custom Material Comparison'}
              </button>
            </div>
          </div>

          {/* Quick Commodity Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">Quick Select:</span>
            {POPULAR_COMMODITY_PILLS.map((pill) => {
              const isPillActive = activeCommodity.name.toLowerCase().includes(pill.toLowerCase());
              return (
                <button
                  key={pill}
                  onClick={() => setSelectedCommodityName(pill)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                    isPillActive
                      ? 'bg-emerald-700 text-white border-emerald-700 font-bold shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {pill}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mode 1: 3-Way Standard Decision Matrix (Recommended vs Lower-Cost vs Eco-Friendly) */}
      {!isCustomMode ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {options.map((opt, i) => {
            const isPrimary = opt.type === 'recommended';
            const isLowerCost = opt.type === 'lower_cost';
            const isEco = opt.type === 'eco_friendly';

            return (
              <div
                key={opt.type}
                className={`bg-white rounded-2xl border-2 p-6 shadow-xs flex flex-col justify-between transition-all relative ${
                  isPrimary
                    ? 'border-emerald-600 ring-2 ring-emerald-500/10'
                    : isEco
                    ? 'border-teal-400 hover:border-teal-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Badge */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        isPrimary
                          ? 'bg-emerald-100 text-emerald-900'
                          : isEco
                          ? 'bg-teal-100 text-teal-900'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {isPrimary ? 'Recommended Packaging' : opt.label}
                    </span>
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      Option {String.fromCharCode(65 + i)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1">{opt.material}</h3>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{opt.structure}</p>

                  {/* Core Specifications Table */}
                  <div className="divide-y divide-slate-100 text-xs mb-6">
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-500">Oxygen Barrier (OTR)</span>
                      <span className="font-bold text-slate-800">
                        {opt.OTR_cc_m2_day} <span className="font-normal text-slate-400">cc/m²/day</span>
                      </span>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-500">Moisture Barrier (WVTR)</span>
                      <span className="font-bold text-slate-800">
                        {opt.WVTR_g_m2_day} <span className="font-normal text-slate-400">g/m²/day</span>
                      </span>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-500">Film Thickness</span>
                      <span className="font-bold text-slate-800">{opt.film_thickness_micron} µm</span>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-500">Sealability</span>
                      <span className="font-bold text-slate-800">{opt.sealability}</span>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-500">Predicted Shelf Life for {activeCommodity.name}</span>
                      <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        ~{opt.predicted_shelf_life_days} Days
                      </span>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-500">Material Cost Index</span>
                      <span className="font-bold text-slate-800">
                        ₹{(opt.cost_per_1k_packs * 0.083).toFixed(2)} / pouch (~${opt.cost_per_1k_packs.toFixed(1)}/1k)
                      </span>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-500">Sustainability Score</span>
                      <span className="font-bold text-emerald-700">{opt.sustainability_score}/100</span>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-500">Food Waste Risk</span>
                      <span
                        className={`font-bold ${
                          opt.food_waste_risk_percent > 30 ? 'text-rose-600' : 'text-slate-800'
                        }`}
                      >
                        {opt.food_waste_risk_percent}%
                      </span>
                    </div>
                  </div>

                  {/* Pros and Trade-offs list */}
                  <div className="space-y-3 mb-6">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                        Key Strengths for {activeCommodity.name}:
                      </span>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {opt.pros.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                        Trade-Offs to Consider:
                      </span>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {opt.trade_offs.map((t, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => onSelectAlternative && onSelectAlternative(opt)}
                  className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                    isPrimary
                      ? 'bg-emerald-800 hover:bg-emerald-900 text-white ring-2 ring-emerald-600/30'
                      : isEco
                      ? 'bg-teal-700 hover:bg-teal-800 text-white ring-2 ring-teal-600/30'
                      : 'bg-slate-900 hover:bg-black text-white ring-2 ring-slate-700/30'
                  }`}
                >
                  <span>Select {isPrimary ? 'Recommended' : isLowerCost ? 'Lower-Cost' : 'Eco-Friendly'} Structure</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Mode 2: Custom Head-to-Head Material Comparison */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">
              Custom Material Head-to-Head Comparison for {activeCommodity.name}
            </h3>
            <p className="text-xs text-slate-500">
              Pick any two packaging materials from the industrial catalog to compare how they perform on this food.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Material 1 Selector & Card */}
            <div className="p-5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/20 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Material A:</label>
                <select
                  value={customMat1Id}
                  onChange={(e) => setCustomMat1Id(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {PACKAGING_MATERIALS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.structure_layers}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 text-xs divide-y divide-slate-200/60">
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">OTR (Oxygen Transmission):</span>
                  <span className="font-bold text-slate-800">{customMat1.OTR_cc_m2_day} cc/m²/day</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">WVTR (Moisture Transmission):</span>
                  <span className="font-bold text-slate-800">{customMat1.WVTR_g_m2_day} g/m²/day</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">Thickness / Density:</span>
                  <span className="font-bold text-slate-800">{customMat1.film_thickness_micron} µm</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">Estimated Cost:</span>
                  <span className="font-bold text-emerald-800">₹{(customMat1.cost_estimate_per_1k_packs_usd * 0.083).toFixed(2)} / pouch</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">Recyclability:</span>
                  <span className="font-bold text-slate-800">{customMat1.recyclability}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">Predicted {activeCommodity.name} Life:</span>
                  <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    ~{Math.max(3, Math.round(activeCommodity.typical_shelf_life_days * (customMat1.WVTR_g_m2_day < 2 ? 1.2 : 0.6)))} Days
                  </span>
                </div>
              </div>
            </div>

            {/* Material 2 Selector & Card */}
            <div className="p-5 rounded-2xl border-2 border-teal-500/40 bg-teal-50/20 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Material B:</label>
                <select
                  value={customMat2Id}
                  onChange={(e) => setCustomMat2Id(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {PACKAGING_MATERIALS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.structure_layers}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 text-xs divide-y divide-slate-200/60">
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">OTR (Oxygen Transmission):</span>
                  <span className="font-bold text-slate-800">{customMat2.OTR_cc_m2_day} cc/m²/day</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">WVTR (Moisture Transmission):</span>
                  <span className="font-bold text-slate-800">{customMat2.WVTR_g_m2_day} g/m²/day</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">Thickness / Density:</span>
                  <span className="font-bold text-slate-800">{customMat2.film_thickness_micron} µm</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">Estimated Cost:</span>
                  <span className="font-bold text-teal-800">₹{(customMat2.cost_estimate_per_1k_packs_usd * 0.083).toFixed(2)} / pouch</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">Recyclability:</span>
                  <span className="font-bold text-slate-800">{customMat2.recyclability}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">Predicted {activeCommodity.name} Life:</span>
                  <span className="font-extrabold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                    ~{Math.max(3, Math.round(activeCommodity.typical_shelf_life_days * (customMat2.WVTR_g_m2_day < 2 ? 1.2 : 0.6)))} Days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Dynamic Decision Advisory & Simulation Launcher */}
      <div
        onClick={() => onNavigateToWhatIf && onNavigateToWhatIf()}
        className="group bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/80 border-2 border-emerald-300 hover:border-emerald-600 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-3"
        title="Click to simulate this recommendation in the What-If Simulator"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Interactive Engineering Advisory
              </span>
              <h4 className="text-sm font-extrabold text-slate-900">
                Tailored Production Recommendation for {activeCommodity.name}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900 bg-emerald-100 group-hover:bg-emerald-200 px-3 py-1.5 rounded-xl border border-emerald-300 transition-colors shrink-0">
            <span>Simulate in What-If Engine</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Dynamic Quantitative Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-white/90 rounded-xl border border-slate-200/80 space-y-0.5">
            <span className="text-slate-500 font-semibold block text-[11px]">Recommended Lifespan</span>
            <span className="text-sm font-black text-emerald-800">
              ~{options[0].predicted_shelf_life_days} Days
            </span>
            <span className="text-[10px] text-slate-400 block">
              vs ~{options[1].predicted_shelf_life_days}d on budget material
            </span>
          </div>

          <div className="p-3 bg-white/90 rounded-xl border border-slate-200/80 space-y-0.5">
            <span className="text-slate-500 font-semibold block text-[11px]">Cost Difference</span>
            <span className="text-sm font-black text-slate-900">
              ₹{(Math.abs(options[0].cost_per_1k_packs - options[1].cost_per_1k_packs) * 0.083).toFixed(2)} / pouch
            </span>
            <span className="text-[10px] text-emerald-700 font-medium block">
              Lower-Cost saves ~{Math.round((1 - options[1].cost_per_1k_packs / options[0].cost_per_1k_packs) * 100)}% on film
            </span>
          </div>

          <div className="p-3 bg-white/90 rounded-xl border border-slate-200/80 space-y-0.5">
            <span className="text-slate-500 font-semibold block text-[11px]">Spoilage Risk Delta</span>
            <span className={`text-sm font-black ${options[1].food_waste_risk_percent > 30 ? 'text-rose-600' : 'text-slate-900'}`}>
              +{options[1].food_waste_risk_percent - options[0].food_waste_risk_percent}% Extra Risk
            </span>
            <span className="text-[10px] text-slate-400 block">
              {options[1].food_waste_risk_percent}% risk if using {options[1].material.split(' ')[0]}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed pt-1">
          {activeCommodity.respiration_rate !== 'None'
            ? `Because ${activeCommodity.name} has active respiration (${activeCommodity.respiration_rate}), opting for Lower-Cost unperforated films risks suffocation and sweating within ${options[1].predicted_shelf_life_days} days. Recommended breathable structures protect wholesale market value.`
            : activeCommodity.moisture_percent < 10
            ? `${activeCommodity.name} is highly hygroscopic. If ambient humidity exceeds 70%, Lower-Cost packaging causes sogginess ~${options[0].predicted_shelf_life_days - options[1].predicted_shelf_life_days} days earlier. Recommended Met-BOPP/Foil prevents texture failure.`
            : `For local distribution (<50 km), Lower-Cost saves ₹${(Math.abs(options[0].cost_per_1k_packs - options[1].cost_per_1k_packs) * 0.083).toFixed(2)}/pack. For long haul transit, Recommended prevents spoilage returns.`}
        </p>
      </div>
    </div>
  );
};
