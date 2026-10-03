import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Thermometer,
  Calendar,
  Droplets,
  Truck,
  RotateCcw,
  Sparkles,
  Zap,
  Info,
  Scale,
  Search,
  X,
  ChevronDown,
  Loader2,
  Check,
} from 'lucide-react';
import { UserInputConditions, MLRecommendation, StorageType, Commodity, FoodCategory, RespirationRate } from '../types/packaging';
import { runWhatIfSimulation } from '../ml/engine';
import { COMMODITIES_DATABASE } from '../data/commodities';
import { resolveCommodityWithAI } from '../services/api';

interface WhatIfSimulatorProps {
  initialRecommendation?: MLRecommendation | null;
  onApplyNewRecommendation?: (newRec: MLRecommendation) => void;
  isMsmeMode: boolean;
}

const STORAGE_TYPES: StorageType[] = [
  'Ambient',
  'Chilled',
  'Frozen',
  'Deep Frozen',
  'Controlled Atmosphere',
  'Refrigerated',
  'Dry Storage',
  'Cold Chain',
];

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  initialRecommendation,
  onApplyNewRecommendation,
  isMsmeMode,
}) => {
  // If no initial recommendation is provided, initialize with a standard perishable commodity (e.g., Strawberry or Fresh Tomatoes)
  const defaultBaseConditions: UserInputConditions = initialRecommendation
    ? initialRecommendation.inputConditions
    : {
        commodityName: 'Fresh Strawberries',
        category: 'Fresh fruits',
        moisture_percent: 91,
        pH: 3.5,
        fat_percent: 0.3,
        respiration_rate: 'Very High',
        respiration_mg_CO2_kg_hr: 55,
        storage_temperature_C: 2,
        relative_humidity_percent: 92,
        storage_type: 'Cold Chain',
        desired_shelf_life_days: 7,
        transportation_duration_days: 1,
      };

  const [baseConditions, setBaseConditions] = useState<UserInputConditions>(defaultBaseConditions);

  // Autocomplete type-to-search state
  const [productSearch, setProductSearch] = useState<string>(defaultBaseConditions.commodityName);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isAiResolving, setIsAiResolving] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suggestions on every single keystroke
  const filteredSuggestions = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return COMMODITIES_DATABASE;
    return COMMODITIES_DATABASE.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.primary_spoilage_factors.some((f) => f.toLowerCase().includes(q))
    );
  }, [productSearch]);

  const handleSelectCommodity = (comm: Commodity) => {
    const newBase: UserInputConditions = {
      commodityName: comm.name,
      category: comm.category,
      moisture_percent: comm.moisture_percent,
      pH: comm.pH,
      fat_percent: comm.fat_percent,
      respiration_rate: comm.respiration_rate,
      respiration_mg_CO2_kg_hr: comm.respiration_mg_CO2_kg_hr,
      storage_temperature_C: comm.recommended_storage_temp_C,
      relative_humidity_percent: comm.recommended_RH_percent,
      storage_type: comm.storage_type,
      desired_shelf_life_days: comm.typical_shelf_life_days,
      transportation_duration_days: 2,
    };
    setBaseConditions(newBase);
    setProductSearch(comm.name);
    setSimTemp(newBase.storage_temperature_C);
    setSimRh(newBase.relative_humidity_percent);
    setSimShelfLife(newBase.desired_shelf_life_days);
    setSimTransit(newBase.transportation_duration_days);
    setSimStorageType(newBase.storage_type);
    setIsDropdownOpen(false);
  };

  const handleAiResolveCommodity = async () => {
    if (!productSearch.trim()) return;
    setIsAiResolving(true);
    const res = await resolveCommodityWithAI(productSearch.trim());
    if (res && res.commodity) {
      const comm: Commodity = {
        id: `custom_${Date.now()}`,
        name: res.commodity.name || productSearch.trim(),
        category: (res.commodity.category as FoodCategory) || 'Processed foods',
        moisture_percent: res.commodity.moisture_percent ?? 50,
        pH: res.commodity.pH ?? 5.5,
        fat_percent: res.commodity.fat_percent ?? 5,
        respiration_rate: (res.commodity.respiration_rate as RespirationRate) || 'None',
        respiration_mg_CO2_kg_hr: res.commodity.respiration_mg_CO2_kg_hr ?? 0,
        recommended_storage_temp_C: res.commodity.recommended_storage_temp_C ?? 15,
        recommended_RH_percent: res.commodity.recommended_RH_percent ?? 65,
        storage_type: (res.commodity.storage_type as StorageType) || 'Ambient',
        typical_shelf_life_days: res.commodity.typical_shelf_life_days ?? 30,
        primary_spoilage_factors: res.commodity.primary_spoilage_factors || ['Moisture loss'],
        description: res.commodity.description || `AI resolved product: ${productSearch.trim()}`,
        isCustom: true,
        icon: '✨',
      };
      handleSelectCommodity(comm);
    }
    setIsAiResolving(false);
  };

  // Simulated Modified Conditions state
  const [simTemp, setSimTemp] = useState<number>(defaultBaseConditions.storage_temperature_C);
  const [simRh, setSimRh] = useState<number>(defaultBaseConditions.relative_humidity_percent);
  const [simShelfLife, setSimShelfLife] = useState<number>(defaultBaseConditions.desired_shelf_life_days);
  const [simTransit, setSimTransit] = useState<number>(defaultBaseConditions.transportation_duration_days);
  const [simStorageType, setSimStorageType] = useState<StorageType>(defaultBaseConditions.storage_type);
  const [simThickness, setSimThickness] = useState<number>(50); // Film thickness (microns)
  const [simAtmosphere, setSimAtmosphere] = useState<'ambient' | 'nitrogen' | 'map'>('ambient');

  // Construct modified conditions object
  const modifiedConditions: UserInputConditions = useMemo(() => {
    return {
      ...baseConditions,
      storage_temperature_C: simTemp,
      relative_humidity_percent: simRh,
      desired_shelf_life_days: simShelfLife,
      transportation_duration_days: simTransit,
      storage_type: simStorageType,
    };
  }, [baseConditions, simTemp, simRh, simShelfLife, simTransit, simStorageType]);

  // Execute the exact same ML pipeline dynamically
  const simulationResult = useMemo(() => {
    return runWhatIfSimulation(baseConditions, modifiedConditions);
  }, [baseConditions, modifiedConditions]);

  const { original_recommendation, new_recommendation, deltas } = simulationResult;

  // Real-time responsive Arrhenius reaction kinetics
  const deltaT = simTemp - baseConditions.storage_temperature_C;
  const arrheniusFactor = Number(Math.pow(2.15, deltaT / 10).toFixed(2));
  const gasFlushMultiplier = simAtmosphere === 'nitrogen' ? 1.65 : simAtmosphere === 'map' ? 2.2 : 1.0;
  const thicknessMultiplier = Math.sqrt(simThickness / 50);

  // Calibrated achievable shelf life
  const responsiveShelfLifeDays = Math.max(
    1,
    Math.round(
      (new_recommendation.predicted_shelf_life_days / Math.max(0.2, arrheniusFactor)) *
        thicknessMultiplier *
        gasFlushMultiplier
    )
  );

  // Spoilage risk index (3% - 95%)
  const spoilageRiskPercent = Math.min(
    95,
    Math.max(
      3,
      Math.round(
        (arrheniusFactor > 1.2 ? 35 * (arrheniusFactor - 1) : 8) +
          (simRh > 80 ? (simRh - 80) * 1.2 : 0) +
          (simTransit > 4 ? (simTransit - 3) * 4 : 0) -
          (simAtmosphere !== 'ambient' ? 25 : 0) -
          (simThickness > 60 ? (simThickness - 50) * 0.25 : 0)
      )
    )
  );

  // Quick Preset Scenarios
  const applyPreset = (preset: 'heatwave' | 'transit' | 'extended_shelf' | 'monsoon') => {
    if (preset === 'heatwave') {
      setSimTemp(Math.min(38, baseConditions.storage_temperature_C + 18));
      setSimStorageType('Ambient');
    } else if (preset === 'transit') {
      setSimTransit(Math.min(12, baseConditions.transportation_duration_days + 6));
    } else if (preset === 'extended_shelf') {
      setSimShelfLife(Math.min(365, baseConditions.desired_shelf_life_days * 2.5));
    } else if (preset === 'monsoon') {
      setSimRh(96);
      setSimTemp(Math.max(28, baseConditions.storage_temperature_C));
    }
  };

  const resetToOriginal = () => {
    setSimTemp(baseConditions.storage_temperature_C);
    setSimRh(baseConditions.relative_humidity_percent);
    setSimShelfLife(baseConditions.desired_shelf_life_days);
    setSimTransit(baseConditions.transportation_duration_days);
    setSimStorageType(baseConditions.storage_type);
    setSimThickness(50);
    setSimAtmosphere('ambient');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Title & Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-300 mb-2">
              <Zap className="w-3.5 h-3.5 text-emerald-700" />
              <span>PRIMARY PRODUCT USP</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">
              What-If Packaging Simulator
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
              Modify real-world storage temperature, transit logistics, and shelf-life requirements.
              The exact same 8-task ML recommendation engine re-evaluates the food kinetics and displays
              detailed specification deltas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetToOriginal}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Values</span>
            </button>

            {onApplyNewRecommendation && (
              <button
                onClick={() => onApplyNewRecommendation(new_recommendation)}
                className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Apply Simulated Recommendation</span>
              </button>
            )}
          </div>
        </div>

        {/* Commodity Search & Instant Autocomplete Suggestions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 relative" ref={dropdownRef}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 max-w-2xl">
            <span className="text-xs font-bold text-slate-700 shrink-0 flex items-center gap-1.5">
              <span>Active Commodity:</span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                Type to Search
              </span>
            </span>

            {/* Type-to-search Autocomplete Input Box */}
            <div className="relative flex-1">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-emerald-700 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={productSearch}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  placeholder="Type product name (e.g., Potato, Strawberry, Rice, Milk)..."
                  className="w-full text-xs font-semibold pl-9 pr-16 py-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-50 focus:bg-white text-slate-900 border border-emerald-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all placeholder:text-slate-400"
                />

                <div className="absolute right-2 flex items-center gap-1">
                  {productSearch && (
                    <button
                      onClick={() => {
                        setProductSearch('');
                        setIsDropdownOpen(true);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
                      title="Clear text"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="p-1 rounded-md text-emerald-800 hover:bg-emerald-100"
                    title="Toggle suggestions list"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Real-time Suggestions Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-80 flex flex-col">
                  {/* Dropdown Header */}
                  <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {filteredSuggestions.length > 0
                        ? `Suggestions matching "${productSearch}" (${filteredSuggestions.length})`
                        : `No direct match for "${productSearch}"`}
                    </span>
                    <span className="text-[10px] text-emerald-700">Click to load baseline</span>
                  </div>

                  {/* Suggestion Items List */}
                  <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
                    {filteredSuggestions.map((comm) => {
                      const isSelected = baseConditions.commodityName.toLowerCase() === comm.name.toLowerCase();
                      return (
                        <button
                          key={comm.id}
                          onClick={() => handleSelectCommodity(comm)}
                          className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-emerald-50/80 transition-colors group ${
                            isSelected ? 'bg-emerald-50/90 font-bold' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xl p-1 bg-white rounded-lg border border-slate-100 shadow-xs shrink-0">
                              {comm.icon || '📦'}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-950">
                                  {comm.name}
                                </span>
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded shrink-0">
                                  {comm.category}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                                <span>Moisture: {comm.moisture_percent}%</span>
                                <span>•</span>
                                <span>pH: {comm.pH}</span>
                                <span>•</span>
                                <span>Resp: {comm.respiration_rate}</span>
                                <span>•</span>
                                <span>Typical: {comm.typical_shelf_life_days}d</span>
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="text-emerald-700 text-xs font-bold shrink-0 ml-2 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Active</span>
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {/* AI Resolution Option if no exact match or user typed custom food */}
                    {productSearch.trim().length > 1 && (
                      <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-emerald-200">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-emerald-950 block">
                              Can't find "{productSearch.trim()}"?
                            </span>
                            <span className="text-[11px] text-slate-600">
                              Use Gemini AI to estimate biological properties and run the ML simulator.
                            </span>
                          </div>
                          <button
                            onClick={handleAiResolveCommodity}
                            disabled={isAiResolving}
                            className="bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            {isAiResolving ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Resolving...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                                <span>AI Resolve & Load</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Biological Baseline Summary Chips */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 shrink-0">
            <span className="font-semibold text-slate-700">Properties:</span>
            <span>H₂O: <strong className="text-slate-900">{baseConditions.moisture_percent}%</strong></span>
            <span>•</span>
            <span>pH: <strong className="text-slate-900">{baseConditions.pH}</strong></span>
            <span>•</span>
            <span>Resp: <strong className="text-slate-900">{baseConditions.respiration_rate}</strong></span>
          </div>
        </div>
      </div>

      {/* Preset Stress Scenarios Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <span className="text-xs font-bold text-slate-800">Quick Test Stress Scenarios:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('heatwave')}
            className="text-xs font-semibold bg-white hover:bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
            <span>Heatwave Break (+18°C)</span>
          </button>
          <button
            onClick={() => applyPreset('transit')}
            className="text-xs font-semibold bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5 text-amber-600" />
            <span>Extended Export (+6d Transit)</span>
          </button>
          <button
            onClick={() => applyPreset('extended_shelf')}
            className="text-xs font-semibold bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>2.5× Shelf-Life Target</span>
          </button>
          <button
            onClick={() => applyPreset('monsoon')}
            className="text-xs font-semibold bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span>Monsoon Humidity (96% RH)</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Controls & Real-Time Diff */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Condition Sliders (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
              <span>Simulated Conditions</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Live Recalculation
            </span>
          </div>

          {/* Storage Temperature Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                <span>Storage Temperature</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 line-through">
                  {baseConditions.storage_temperature_C}°C
                </span>
                <span className="text-xs font-bold text-slate-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {simTemp}°C
                </span>
              </div>
            </div>
            <input
              type="range"
              min="-20"
              max="45"
              step="1"
              value={simTemp}
              onChange={(e) => setSimTemp(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-20°C (Deep Frozen)</span>
              <span>4°C (Chilled)</span>
              <span>25°C (Room)</span>
              <span>45°C (Extreme)</span>
            </div>
          </div>

          {/* Desired Shelf Life Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Desired Shelf Life</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 line-through">
                  {baseConditions.desired_shelf_life_days}d
                </span>
                <span className="text-xs font-bold text-slate-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {simShelfLife} Days
                </span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="365"
              step="1"
              value={simShelfLife}
              onChange={(e) => setSimShelfLife(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 Day</span>
              <span>30 Days</span>
              <span>180 Days</span>
              <span>365 Days</span>
            </div>
          </div>

          {/* Transportation Duration Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-500" />
                <span>Transportation Duration</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 line-through">
                  {baseConditions.transportation_duration_days}d
                </span>
                <span className="text-xs font-bold text-slate-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {simTransit} Days
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="14"
              step="1"
              value={simTransit}
              onChange={(e) => setSimTransit(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 (Local)</span>
              <span>3 Days</span>
              <span>7 Days</span>
              <span>14 Days</span>
            </div>
          </div>

          {/* Relative Humidity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span>Relative Humidity</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 line-through">
                  {baseConditions.relative_humidity_percent}%
                </span>
                <span className="text-xs font-bold text-slate-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {simRh}% RH
                </span>
              </div>
            </div>
            <input
              type="range"
              min="20"
              max="98"
              step="1"
              value={simRh}
              onChange={(e) => setSimRh(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Storage Type Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">Storage Protocol</label>
            <div className="grid grid-cols-2 gap-1.5">
              {STORAGE_TYPES.slice(0, 6).map((st) => (
                <button
                  key={st}
                  onClick={() => setSimStorageType(st)}
                  className={`text-[11px] font-semibold p-2 rounded-lg border transition-all ${
                    simStorageType === st
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Film Barrier Thickness Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>Simulated Film Thickness</span>
              </label>
              <span className="text-xs font-bold text-slate-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {simThickness} µm
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="130"
              step="5"
              value={simThickness}
              onChange={(e) => setSimThickness(parseInt(e.target.value, 10))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>20µm (Thin)</span>
              <span>50µm (Standard)</span>
              <span>90µm (Heavy)</span>
              <span>130µm (Rigid)</span>
            </div>
          </div>

          {/* Atmosphere Flush Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Headspace Packaging Atmosphere</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setSimAtmosphere('ambient')}
                className={`text-[10px] font-bold p-2 rounded-lg border text-center transition-all ${
                  simAtmosphere === 'ambient'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Ambient Air
              </button>
              <button
                onClick={() => setSimAtmosphere('nitrogen')}
                className={`text-[10px] font-bold p-2 rounded-lg border text-center transition-all ${
                  simAtmosphere === 'nitrogen'
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                99% N₂ Flush
              </button>
              <button
                onClick={() => setSimAtmosphere('map')}
                className={`text-[10px] font-bold p-2 rounded-lg border text-center transition-all ${
                  simAtmosphere === 'map'
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Active MAP (N₂/CO₂)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Before vs After Comparison & Deltas (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Live Reactive Kinetics & Spoilage Risk Gauge */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Live Food Kinetics & Real-time Spoilage Risk:</span>
              </span>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                  spoilageRiskPercent > 50
                    ? 'bg-rose-100 text-rose-800'
                    : spoilageRiskPercent > 25
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {spoilageRiskPercent}% Spoilage Risk
              </span>
            </div>

            {/* Visual Risk Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  spoilageRiskPercent > 50
                    ? 'bg-rose-600'
                    : spoilageRiskPercent > 25
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
                }`}
                style={{ width: `${spoilageRiskPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-semibold">Arrhenius Acceleration</span>
                <span className={`font-bold ${arrheniusFactor > 1.5 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {arrheniusFactor}× Decay Rate
                </span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-semibold">Achievable Shelf-Life</span>
                <span className="font-extrabold text-emerald-800">
                  ~{responsiveShelfLifeDays} Days
                </span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-semibold">Atmospheric Gas Shield</span>
                <span className="font-bold text-teal-800">
                  {simAtmosphere === 'ambient' ? 'Normal Air' : simAtmosphere === 'nitrogen' ? '+65% Barrier' : '+120% Barrier'}
                </span>
              </div>
            </div>
          </div>

          {/* Material Change Alert Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
              deltas.material_changed
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex items-center gap-3">
              {deltas.material_changed ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">
                  {deltas.material_changed ? 'Material Structure Shifted!' : 'Material Structure Stable'}
                </span>
                <span className="text-sm font-extrabold flex items-center gap-2">
                  <span>{deltas.old_material}</span>
                  {deltas.material_changed && (
                    <>
                      <ArrowRight className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-800 underline">{deltas.new_material}</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                deltas.material_changed ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
              }`}
            >
              {deltas.material_changed ? 'Re-Engineered' : 'Spec Refined'}
            </span>
          </div>

          {/* Multi-Parameter Delta Comparison Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Calculated Engineering Deltas (Original vs Simulated)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* OTR Delta */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">OTR Requirement</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {original_recommendation.OTR_cc_m2_day} → {new_recommendation.OTR_cc_m2_day}
                </div>
                <div
                  className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${
                    deltas.otr_delta > 0
                      ? 'text-blue-600'
                      : deltas.otr_delta < 0
                      ? 'text-amber-700'
                      : 'text-slate-500'
                  }`}
                >
                  {deltas.otr_delta > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : deltas.otr_delta < 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : null}
                  <span>
                    {deltas.otr_delta > 0 ? `+${deltas.otr_delta}` : deltas.otr_delta} cc/m²/day
                  </span>
                </div>
              </div>

              {/* WVTR Delta */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">WVTR Requirement</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {original_recommendation.WVTR_g_m2_day} → {new_recommendation.WVTR_g_m2_day}
                </div>
                <div
                  className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${
                    deltas.wvtr_delta < 0
                      ? 'text-rose-600'
                      : deltas.wvtr_delta > 0
                      ? 'text-blue-600'
                      : 'text-slate-500'
                  }`}
                >
                  {deltas.wvtr_delta < 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : deltas.wvtr_delta > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : null}
                  <span>
                    {deltas.wvtr_delta > 0 ? `+${deltas.wvtr_delta}` : deltas.wvtr_delta} g/m²/day
                  </span>
                </div>
              </div>

              {/* Film Thickness Delta */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Thickness</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {original_recommendation.film_thickness_micron}µm → {new_recommendation.film_thickness_micron}µm
                </div>
                <div
                  className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${
                    deltas.thickness_delta > 0
                      ? 'text-amber-700'
                      : deltas.thickness_delta < 0
                      ? 'text-emerald-700'
                      : 'text-slate-500'
                  }`}
                >
                  {deltas.thickness_delta > 0 ? <TrendingUp className="w-3 h-3" /> : null}
                  <span>
                    {deltas.thickness_delta > 0 ? `+${deltas.thickness_delta}` : deltas.thickness_delta} µm
                  </span>
                </div>
              </div>

              {/* Shelf-Life Delta */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Achievable Shelf Life</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {original_recommendation.predicted_shelf_life_days}d → {new_recommendation.predicted_shelf_life_days}d
                </div>
                <div
                  className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${
                    deltas.shelf_life_delta > 0
                      ? 'text-emerald-700'
                      : deltas.shelf_life_delta < 0
                      ? 'text-rose-600'
                      : 'text-slate-500'
                  }`}
                >
                  {deltas.shelf_life_delta > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : deltas.shelf_life_delta < 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : null}
                  <span>
                    {deltas.shelf_life_delta > 0 ? `+${deltas.shelf_life_delta}` : deltas.shelf_life_delta} days
                  </span>
                </div>
              </div>

              {/* Food Waste Risk Delta */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Food Spoilage Risk</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {original_recommendation.food_waste_risk_percent}% → {new_recommendation.food_waste_risk_percent}%
                </div>
                <div
                  className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${
                    deltas.food_waste_risk_delta > 0
                      ? 'text-rose-600 font-bold'
                      : deltas.food_waste_risk_delta < 0
                      ? 'text-emerald-700 font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  {deltas.food_waste_risk_delta > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : deltas.food_waste_risk_delta < 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : null}
                  <span>
                    {deltas.food_waste_risk_delta > 0 ? `+${deltas.food_waste_risk_delta}` : deltas.food_waste_risk_delta}%
                  </span>
                </div>
              </div>

              {/* Packaging Carbon Impact Delta */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Carbon Index</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {original_recommendation.carbon_footprint_estimate_kgCO2e} →{' '}
                  {new_recommendation.carbon_footprint_estimate_kgCO2e}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  <span>
                    {deltas.packaging_impact_delta > 0
                      ? `+${deltas.packaging_impact_delta.toFixed(2)}`
                      : deltas.packaging_impact_delta.toFixed(2)}{' '}
                    kg CO₂e
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Deep Explainability: "Why Did The Recommendation Change?" */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-700" />
              <h4 className="text-sm font-bold text-slate-900">
                Why Did The Recommendation Change?
              </h4>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 leading-relaxed font-medium">
              {simulationResult.why_it_changed_explanation}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
              <Scale className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Risk Assessment: </span>
                <span>{simulationResult.risk_assessment}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
