import React, { useState } from 'react';
import {
  PackageSearch,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Leaf,
  Layers,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Zap,
  Info,
  X,
  Scale,
  Thermometer,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { PACKAGING_MATERIALS } from '../data/materials';
import { PackagingMaterial } from '../types/packaging';

interface MaterialExplorerProps {
  onNavigateToCompare?: (materialId?: string) => void;
  onNavigateToWhatIf?: (materialId?: string) => void;
  onSelectCommodityForCompare?: (commodityName: string) => void;
}

const CATEGORY_PILLS = [
  'All',
  'Polyolefin',
  'Barrier Multilayer',
  'Foil / Metalized',
  'Circular Mono-Material',
  'Polyester',
  'Biodegradable',
  'Bio-based / Paper',
  'Rigid Container',
];

export const MaterialExplorer: React.FC<MaterialExplorerProps> = ({
  onNavigateToCompare,
  onNavigateToWhatIf,
  onSelectCommodityForCompare,
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [barrierFilter, setBarrierFilter] = useState<string>('All');
  const [ecoFilter, setEcoFilter] = useState<string>('All');
  const [inspectingMaterial, setInspectingMaterial] = useState<PackagingMaterial | null>(null);

  const filteredMaterials = PACKAGING_MATERIALS.filter((mat) => {
    const matchesSearch =
      mat.name.toLowerCase().includes(search.toLowerCase()) ||
      mat.structure_layers.toLowerCase().includes(search.toLowerCase()) ||
      mat.category.toLowerCase().includes(search.toLowerCase()) ||
      mat.typical_applications.some((app) => app.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = selectedCategory === 'All' || mat.category.toLowerCase() === selectedCategory.toLowerCase();

    let matchesBarrier = true;
    if (barrierFilter === 'Ultra-High') {
      matchesBarrier = mat.OTR_cc_m2_day < 5 && mat.WVTR_g_m2_day < 2;
    } else if (barrierFilter === 'Moderate') {
      matchesBarrier = mat.OTR_cc_m2_day >= 5 && mat.OTR_cc_m2_day <= 500;
    } else if (barrierFilter === 'Breathable') {
      matchesBarrier = mat.OTR_cc_m2_day > 500;
    }

    let matchesEco = true;
    if (ecoFilter === 'Recyclable') {
      matchesEco = mat.recyclability.toLowerCase().includes('recyclable');
    } else if (ecoFilter === 'Biodegradable') {
      matchesEco = mat.is_biodegradable;
    }

    return matchesSearch && matchesCat && matchesBarrier && matchesEco;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-300 mb-2">
              <PackageSearch className="w-3.5 h-3.5 text-emerald-700" />
              <span>EXPANDED MATERIALS & BARRIER ENVELOPE CATALOG</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">
              Engineering Materials Explorer
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
              Technical barrier parameters, layer architectures, seal windows, and circular recyclability
              across <strong>{PACKAGING_MATERIALS.length} food packaging materials</strong>. Click any material or application to simulate.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              Showing <strong>{filteredMaterials.length}</strong> of {PACKAGING_MATERIALS.length} Materials
            </span>
          </div>
        </div>

        {/* Large Highly Visible Search Bar */}
        <div className="relative pt-2">
          <Search className="w-5 h-5 text-emerald-800 absolute left-4 top-5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search material, polymer, structure (e.g. EVOH, Foil, BOPP, Mono-PE, Strawberries)..."
            className="w-full text-sm font-bold pl-12 pr-12 py-3.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-50 focus:bg-white text-slate-900 border-2 border-emerald-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 shadow-sm transition-all placeholder:text-slate-400 placeholder:font-normal"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-5 p-1 text-slate-400 hover:text-slate-700 rounded-md"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Clickable Quick Category Filters */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-xs text-slate-400 font-bold mr-1">Category:</span>
          {CATEGORY_PILLS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white border-emerald-800 font-bold shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Additional Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 shrink-0">Barrier Level:</span>
            <select
              value={barrierFilter}
              onChange={(e) => setBarrierFilter(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="All">All Barrier Ranges</option>
              <option value="Ultra-High">Ultra-High Barrier (OTR &lt; 5, WVTR &lt; 2)</option>
              <option value="Moderate">Moderate Barrier (OTR 5–500)</option>
              <option value="Breathable">Breathable / Micro-Perforated (Produce)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 shrink-0">Sustainability:</span>
            <select
              value={ecoFilter}
              onChange={(e) => setEcoFilter(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="All">All Sustainability Classes</option>
              <option value="Recyclable">Widely Recyclable (Mono-materials)</option>
              <option value="Biodegradable">Certified Compostable (Bio-films)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Materials Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMaterials.map((mat) => (
          <div
            key={mat.id}
            className="bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-500 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
          >
            <div>
              {/* Card Top Badges */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <button
                  onClick={() => setSelectedCategory(mat.category)}
                  className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 hover:bg-emerald-100 hover:text-emerald-900 transition-colors"
                  title="Filter by this category"
                >
                  {mat.category}
                </button>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      mat.is_biodegradable
                        ? 'bg-teal-100 text-teal-800'
                        : mat.recyclability.toLowerCase().includes('widely')
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {mat.recyclability}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {mat.code}
                  </span>
                </div>
              </div>

              {/* Title & Layers */}
              <div
                onClick={() => setInspectingMaterial(mat)}
                className="cursor-pointer"
                title="Click to view detailed engineering spec"
              >
                <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-900 transition-colors flex items-center justify-between">
                  <span>{mat.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-2">
                  {mat.structure_layers}
                </p>
              </div>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Oxygen (OTR)</span>
                  <span className="font-extrabold text-slate-900 text-xs">
                    {mat.OTR_cc_m2_day} <span className="font-normal text-[10px] text-slate-500">cc/m²</span>
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Moisture (WVTR)</span>
                  <span className="font-extrabold text-slate-900 text-xs">
                    {mat.WVTR_g_m2_day} <span className="font-normal text-[10px] text-slate-500">g/m²</span>
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Cost Index</span>
                  <span className="font-extrabold text-emerald-800 text-xs">
                    ₹{(mat.cost_estimate_per_1k_packs_usd * 0.083).toFixed(2)}/pouch
                  </span>
                </div>
              </div>

              {/* Clickable Typical Applications */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Click Suitable Foods to Compare:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {mat.typical_applications.join(', ').split(', ').slice(0, 4).map((app, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (onSelectCommodityForCompare) {
                          onSelectCommodityForCompare(app.trim());
                        } else if (onNavigateToCompare) {
                          onNavigateToCompare(mat.id);
                        }
                      }}
                      className="text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors"
                      title={`Simulate packaging for ${app.trim()}`}
                    >
                      {app.trim()} ↗
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons: High Contrast & Fully Visible */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => onNavigateToCompare && onNavigateToCompare(mat.id)}
                className="py-3 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>Compare in Matrix</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>

              <button
                onClick={() => onNavigateToWhatIf && onNavigateToWhatIf(mat.id)}
                className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate in What-If</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No packaging materials found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching a different polymer name, barrier requirement, or clear your category filter.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setBarrierFilter('All');
              setEcoFilter('All');
            }}
            className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-4 py-2 rounded-lg hover:bg-emerald-100"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Material Detailed Specification Modal */}
      {inspectingMaterial && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                  {inspectingMaterial.category} • {inspectingMaterial.code}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  {inspectingMaterial.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {inspectingMaterial.structure_layers}
                </p>
              </div>
              <button
                onClick={() => setInspectingMaterial(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Specifications Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Oxygen (OTR)</span>
                <span className="text-sm font-bold text-slate-900">{inspectingMaterial.OTR_cc_m2_day} cc/m²</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Moisture (WVTR)</span>
                <span className="text-sm font-bold text-slate-900">{inspectingMaterial.WVTR_g_m2_day} g/m²</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Seal Window</span>
                <span className="text-sm font-bold text-slate-900">{inspectingMaterial.seal_temperature_C}°C</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Tensile Strength</span>
                <span className="text-sm font-bold text-slate-900">{inspectingMaterial.mechanical_strength_MPa} MPa</span>
              </div>
            </div>

            {/* Advantages and Limitations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Key Advantages:</span>
                </span>
                <ul className="space-y-1 text-slate-700">
                  {inspectingMaterial.advantages.map((adv, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-700">•</span>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Engineering Limitations:</span>
                </span>
                <ul className="space-y-1 text-slate-700">
                  {inspectingMaterial.limitations.map((lim, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-700">•</span>
                      <span>{lim}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal CTAs */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setInspectingMaterial(null)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200"
              >
                Close Inspector
              </button>
              <button
                onClick={() => {
                  setInspectingMaterial(null);
                  if (onNavigateToCompare) onNavigateToCompare(inspectingMaterial.id);
                }}
                className="text-xs font-black text-white bg-emerald-800 hover:bg-emerald-900 px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2"
              >
                <span>Compare this Material</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
