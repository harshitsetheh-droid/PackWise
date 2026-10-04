import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  User,
  Info,
  Thermometer,
  Droplets,
  Truck,
  Calendar,
  Layers,
  Search,
  PlusCircle,
  Loader2,
  Brain,
} from 'lucide-react';
import { COMMODITIES_DATABASE } from '../data/commodities';
import {
  Commodity,
  FoodCategory,
  StorageType,
  RespirationRate,
  UserInputConditions,
  DataSource,
  ConfidenceLevel,
} from '../types/packaging';
import { resolveCommodityWithAI, fetchLearnedCommodities, recordUserConditionFeedback } from '../services/api';
import { VoiceInputButton } from './VoiceInputButton';

interface RecommendationWizardProps {
  onGenerateRecommendation: (conditions: UserInputConditions) => void;
  isMsmeMode: boolean;
  totalTrainingRows?: number;
  setTotalTrainingRows?: React.Dispatch<React.SetStateAction<number>>;
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

const FOOD_CATEGORIES: FoodCategory[] = [
  'Fresh fruits',
  'Fresh vegetables',
  'Grains',
  'Flours',
  'Pulses',
  'Nuts',
  'Dairy',
  'Frozen foods',
  'Meat',
  'Seafood',
  'Beverages',
  'Oils',
  'Bakery products',
  'Processed foods',
  'Snacks',
  'Condiments',
];

export const RecommendationWizard: React.FC<RecommendationWizardProps> = ({
  onGenerateRecommendation,
  isMsmeMode,
  totalTrainingRows,
  setTotalTrainingRows,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Custom commodity resolution state
  const [isResolvingWithAI, setIsResolvingWithAI] = useState<boolean>(false);
  const [aiResolutionStatus, setAiResolutionStatus] = useState<string | null>(null);
  const [learnedCommodities, setLearnedCommodities] = useState<Commodity[]>([]);

  useEffect(() => {
    fetchLearnedCommodities().then((items) => {
      if (items && items.length > 0) {
        setLearnedCommodities(items);
      }
    });
  }, []);

  // Form State
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity>(COMMODITIES_DATABASE[0]);
  const [moisture, setMoisture] = useState<number>(COMMODITIES_DATABASE[0].moisture_percent);
  const [ph, setPh] = useState<number>(COMMODITIES_DATABASE[0].pH);
  const [fat, setFat] = useState<number>(COMMODITIES_DATABASE[0].fat_percent);
  const [respirationRate, setRespirationRate] = useState<RespirationRate>(COMMODITIES_DATABASE[0].respiration_rate);
  const [respirationMg, setRespirationMg] = useState<number>(COMMODITIES_DATABASE[0].respiration_mg_CO2_kg_hr);

  const [temperature, setTemperature] = useState<number>(COMMODITIES_DATABASE[0].recommended_storage_temp_C);
  const [rh, setRh] = useState<number>(COMMODITIES_DATABASE[0].recommended_RH_percent);
  const [storageType, setStorageType] = useState<StorageType>(COMMODITIES_DATABASE[0].storage_type);
  const [transitDays, setTransitDays] = useState<number>(2);
  const [desiredShelfLifeDays, setDesiredShelfLifeDays] = useState<number>(COMMODITIES_DATABASE[0].typical_shelf_life_days);

  // Metadata track: data source & confidence per field
  const [fieldSources, setFieldSources] = useState<Record<string, DataSource>>({
    moisture: 'dataset',
    ph: 'dataset',
    fat: 'dataset',
    respiration: 'dataset',
    temperature: 'dataset',
    rh: 'dataset',
    storageType: 'dataset',
  });

  const [fieldConfidences, setFieldConfidences] = useState<Record<string, ConfidenceLevel>>({
    moisture: 'High',
    ph: 'High',
    fat: 'High',
    respiration: 'High',
    temperature: 'High',
    rh: 'High',
    storageType: 'High',
  });

  const [fieldEstimated, setFieldEstimated] = useState<Record<string, boolean>>({
    moisture: false,
    ph: false,
    fat: false,
    respiration: false,
  });

  // Handler when user selects a known commodity
  const handleSelectCommodity = (comm: Commodity) => {
    setSelectedCommodity(comm);
    setMoisture(comm.moisture_percent);
    setPh(comm.pH);
    setFat(comm.fat_percent);
    setRespirationRate(comm.respiration_rate);
    setRespirationMg(comm.respiration_mg_CO2_kg_hr);
    setTemperature(comm.recommended_storage_temp_C);
    setRh(comm.recommended_RH_percent);
    setStorageType(comm.storage_type);
    setDesiredShelfLifeDays(comm.typical_shelf_life_days);

    // Reset sources or assign learned memory
    if (comm.fromMemory) {
      setFieldSources({
        moisture: 'learned_memory',
        ph: 'learned_memory',
        fat: 'learned_memory',
        respiration: 'learned_memory',
        temperature: 'learned_memory',
        rh: 'learned_memory',
        storageType: 'learned_memory',
      });
      setFieldConfidences({
        moisture: 'High',
        ph: 'High',
        fat: 'High',
        respiration: 'High',
        temperature: 'High',
        rh: 'High',
        storageType: 'High',
      });
      setFieldEstimated({
        moisture: false,
        ph: false,
        fat: false,
        respiration: false,
      });
      setAiResolutionStatus(
        `🧠 Retrieved from Self-Learning Knowledge Base (Searched ${comm.queryCount || 1}x by community). 0 API tokens consumed.`
      );
    } else {
      setFieldSources({
        moisture: 'dataset',
        ph: 'dataset',
        fat: 'dataset',
        respiration: 'dataset',
        temperature: 'dataset',
        rh: 'dataset',
        storageType: 'dataset',
      });
      setFieldConfidences({
        moisture: 'High',
        ph: 'High',
        fat: 'High',
        respiration: 'High',
        temperature: 'High',
        rh: 'High',
        storageType: 'High',
      });
      setFieldEstimated({
        moisture: false,
        ph: false,
        fat: false,
        respiration: false,
      });
    }
  };

  // Handler for AI-assisted data resolution for unknown commodities
  const handleResolveWithAI = async (overrideName?: string) => {
    const targetName = (overrideName || searchTerm).trim();
    if (!targetName) return;
    setIsResolvingWithAI(true);
    setAiResolutionStatus(`Checking Knowledge Store & resolving properties for "${targetName}"...`);

    const result = await resolveCommodityWithAI(targetName);

    if (result && result.commodity) {
      const isFromMem = Boolean(result.fromMemory);
      const comm: Commodity = {
        id: `custom_${Date.now()}`,
        name: result.commodity.name || targetName,
        category: (result.commodity.category as FoodCategory) || 'Processed foods',
        moisture_percent: result.commodity.moisture_percent ?? 50,
        pH: result.commodity.pH ?? 5.5,
        fat_percent: result.commodity.fat_percent ?? 5,
        respiration_rate: (result.commodity.respiration_rate as RespirationRate) || 'None',
        respiration_mg_CO2_kg_hr: result.commodity.respiration_mg_CO2_kg_hr ?? 0,
        recommended_storage_temp_C: result.commodity.recommended_storage_temp_C ?? 15,
        recommended_RH_percent: result.commodity.recommended_RH_percent ?? 65,
        storage_type: (result.commodity.storage_type as StorageType) || 'Ambient',
        typical_shelf_life_days: result.commodity.typical_shelf_life_days ?? 30,
        primary_spoilage_factors: result.commodity.primary_spoilage_factors || ['Moisture loss'],
        description: result.commodity.description || (isFromMem ? `Remembered from previous search.` : `AI estimated commodity: ${targetName}`),
        isCustom: true,
        icon: isFromMem ? '🧠' : '✨',
        fromMemory: isFromMem,
        queryCount: result.queryCount || 1,
        learnedAt: result.learnedAt,
      };

      setSelectedCommodity(comm);
      setMoisture(comm.moisture_percent);
      setPh(comm.pH);
      setFat(comm.fat_percent);
      setRespirationRate(comm.respiration_rate);
      setRespirationMg(comm.respiration_mg_CO2_kg_hr);
      setTemperature(comm.recommended_storage_temp_C);
      setRh(comm.recommended_RH_percent);
      setStorageType(comm.storage_type);
      setDesiredShelfLifeDays(comm.typical_shelf_life_days);

      if (isFromMem) {
        setFieldSources({
          moisture: 'learned_memory',
          ph: 'learned_memory',
          fat: 'learned_memory',
          respiration: 'learned_memory',
          temperature: 'learned_memory',
          rh: 'learned_memory',
          storageType: 'learned_memory',
        });
        setFieldConfidences({
          moisture: 'High',
          ph: 'High',
          fat: 'High',
          respiration: 'High',
          temperature: 'High',
          rh: 'High',
          storageType: 'High',
        });
        setFieldEstimated({
          moisture: false,
          ph: false,
          fat: false,
          respiration: false,
        });
        setAiResolutionStatus(
          `🧠 Retrieved from Self-Learning Knowledge Base! (Queried ${result.queryCount || 1} times previously — 0 duplicate training rows added).`
        );
      } else {
        setFieldSources({
          moisture: 'ai_estimated',
          ph: 'ai_estimated',
          fat: 'ai_estimated',
          respiration: 'ai_estimated',
          temperature: 'ai_estimated',
          rh: 'ai_estimated',
          storageType: 'ai_estimated',
        });
        setFieldConfidences({
          moisture: result.confidence,
          ph: result.confidence,
          fat: result.confidence,
          respiration: result.confidence,
          temperature: result.confidence,
          rh: result.confidence,
          storageType: result.confidence,
        });
        setFieldEstimated({
          moisture: true,
          ph: true,
          fat: true,
          respiration: true,
        });

        if (result.totalTrainingRows && setTotalTrainingRows) {
          setTotalTrainingRows(result.totalTrainingRows);
        }

        const rowsNotice = result.rowsAdded ? ` (+${result.rowsAdded} training rows added)` : '';
        setAiResolutionStatus(
          `✨ Newly discovered commodity "${comm.name}" analyzed & added to training dataset${rowsNotice} with zero duplicates!`
        );
        // Refresh learned list
        fetchLearnedCommodities().then(setLearnedCommodities);
      }
    }
    setIsResolvingWithAI(false);
  };

  // Submit and run pipeline
  const handleSubmit = () => {
    // Record user condition feedback for continuous learning
    recordUserConditionFeedback({
      commodityName: selectedCommodity.name,
      storage_temperature_C: temperature,
      relative_humidity_percent: rh,
      desired_shelf_life_days: desiredShelfLifeDays,
    });

    const conditions: UserInputConditions = {
      commodityName: selectedCommodity.name,
      category: selectedCommodity.category,
      moisture_percent: moisture,
      pH: ph,
      fat_percent: fat,
      respiration_rate: respirationRate,
      respiration_mg_CO2_kg_hr: respirationMg,
      storage_temperature_C: temperature,
      relative_humidity_percent: rh,
      storage_type: storageType,
      desired_shelf_life_days: desiredShelfLifeDays,
      transportation_duration_days: transitDays,
      fieldSources,
      fieldConfidences,
      fieldEstimated,
    };
    onGenerateRecommendation(conditions);
  };

  // Combine learned commodities (prioritized) + empirical database
  const allAvailableCommodities = [
    ...learnedCommodities,
    ...COMMODITIES_DATABASE.filter(
      (c) => !learnedCommodities.some((lc) => lc.name.toLowerCase() === c.name.toLowerCase())
    ),
  ];

  // Filtered commodities
  const filteredCommodities = allAvailableCommodities.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const steps = [
    { num: 1, title: 'Select Food', desc: 'Pick or resolve commodity' },
    { num: 2, title: 'Properties', desc: 'Moisture, pH & Respiration' },
    { num: 3, title: 'Environment', desc: 'Storage & Humidity' },
    { num: 4, title: 'Transit', desc: 'Logistics duration' },
    { num: 5, title: 'Shelf Life', desc: 'Target duration' },
    { num: 6, title: 'Validation', desc: 'Transparency & ML Run' },
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden pb-8">
      {/* Wizard Step Indicator Header */}
      <div className="bg-slate-50/80 border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              New Packaging Recommendation
            </h2>
            <p className="text-xs text-slate-500">
              Step {currentStep} of 6: {steps[currentStep - 1].title}
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
            ML Tabular Pipeline
          </span>
        </div>

        {/* Mobile Step Bar (Visible on mobile, hidden on sm+) */}
        <div className="sm:hidden space-y-2 mb-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">
              Step {currentStep} of 6: {steps[currentStep - 1].title}
            </span>
            <span className="text-[11px] text-slate-500">{steps[currentStep - 1].desc}</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-700 h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Desktop / Tablet Step dots (Hidden on mobile, visible on sm+) */}
        <div className="hidden sm:grid sm:grid-cols-6 gap-2">
          {steps.map((s) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`text-left p-2 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                    : 'bg-white text-slate-400 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      isCurrent
                        ? 'bg-white text-emerald-900'
                        : isDone
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDone ? '✓' : s.num}
                  </span>
                  <span className="text-[11px] font-bold truncate">{s.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6 md:p-8">
        {/* ================= STEP 1: Select Commodity ================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Select Food Commodity</h3>
                <p className="text-xs text-slate-500">
                  Choose from our verified postharvest database or request AI resolution for a new commodity.
                </p>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="All">All Categories</option>
                {FOOD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Self-Learning Memory Active Banner */}
            {learnedCommodities.length > 0 && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs">
                <Brain className="w-4 h-4 text-purple-700 shrink-0" />
                <span className="font-semibold">
                  Continuous Self-Learning Active:
                </span>
                <span className="text-purple-700">
                  {learnedCommodities.length} community products memorized in persistent store.
                </span>
              </div>
            )}

            {/* Unified Search Bar with Voice-to-Text & Built-in AI Resolve */}
            <div className="space-y-2">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchTerm.trim() && filteredCommodities.length === 0) {
                      e.preventDefault();
                      handleResolveWithAI(searchTerm);
                    }
                  }}
                  placeholder="Search 89+ foods or click mic to speak (e.g. Apple, Paneer, Jackfruit Chips)..."
                  className="w-full text-xs pl-10 pr-36 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs text-slate-900 placeholder:text-slate-400 bg-white"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <VoiceInputButton
                    onTranscript={(voiceText) => {
                      setSearchTerm(voiceText);
                    }}
                    size="sm"
                    tooltip="Speak commodity name with microphone"
                  />

                  {searchTerm.trim().length > 0 && (
                    <button
                      onClick={() => handleResolveWithAI(searchTerm)}
                      disabled={isResolvingWithAI}
                      className="bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                      title="Auto-resolve or load this product using Gemini AI & Memory Store"
                    >
                      {isResolvingWithAI ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Resolving...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-emerald-300" />
                          <span>AI Resolve</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Status feedback message */}
              {aiResolutionStatus && (
                <div className="text-xs font-medium text-emerald-800 bg-emerald-50/80 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="flex-1">{aiResolutionStatus}</span>
                  <button
                    onClick={() => setAiResolutionStatus(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Instant Auto-Resolve banner when typing something unlisted */}
              {searchTerm.trim().length > 1 &&
                !allAvailableCommodities.some(
                  (c) => c.name.toLowerCase() === searchTerm.trim().toLowerCase()
                ) && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>
                        Not in standard list? Auto-resolve biochemistry for <strong>"{searchTerm}"</strong>:
                      </span>
                    </div>
                    <button
                      onClick={() => handleResolveWithAI(searchTerm)}
                      disabled={isResolvingWithAI}
                      className="text-emerald-800 font-bold hover:underline flex items-center gap-1 text-[11px] self-start sm:self-auto"
                    >
                      {isResolvingWithAI ? 'Resolving...' : `Resolve "${searchTerm}" with AI & Memory ➔`}
                    </button>
                  </div>
                )}
            </div>

            {/* Commodity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
              {filteredCommodities.map((comm) => {
                const isSelected = selectedCommodity.id === comm.id;
                return (
                  <button
                    key={comm.id}
                    onClick={() => handleSelectCommodity(comm)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="text-2xl p-1 bg-white rounded-lg border border-slate-100 shadow-xs">
                      {comm.icon || '🍏'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-slate-900 truncate">{comm.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] text-slate-500 block truncate">{comm.category}</span>
                        {comm.fromMemory && (
                          <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded border border-purple-200 shrink-0">
                            🧠 Learned ({comm.queryCount || 1}x)
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-600">
                        <span>H2O: {comm.moisture_percent}%</span>
                        <span>•</span>
                        <span>Resp: {comm.respiration_rate}</span>
                        <span>•</span>
                        <span>{comm.typical_shelf_life_days}d</span>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredCommodities.length === 0 && (
                <div className="col-span-full text-center py-8 px-4 bg-slate-50/80 rounded-xl border border-dashed border-slate-300">
                  <div className="text-2xl mb-1">🔍</div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1">
                    No matching commodity found for "{searchTerm}"
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto mb-3">
                    Click below to auto-resolve biochemical parameters with Gemini AI and permanently save it in the memory store:
                  </p>
                  <button
                    onClick={() => handleResolveWithAI(searchTerm)}
                    disabled={isResolvingWithAI}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-2 shadow-xs transition-colors"
                  >
                    {isResolvingWithAI ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Resolving "{searchTerm}"...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Auto-Resolve & Memorize "{searchTerm}"</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 2: Food Properties ================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Food Properties & Biochemistry</h3>
                <p className="text-xs text-slate-500">
                  Known baseline properties loaded from verified database. Modify if your batch differs.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                {selectedCommodity.name}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Moisture */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span>Moisture Content (%)</span>
                  </label>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      fieldSources.moisture === 'dataset'
                        ? 'bg-emerald-100 text-emerald-800'
                        : fieldSources.moisture === 'ai_estimated'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Source: {fieldSources.moisture === 'dataset' ? 'Verified DB' : fieldSources.moisture}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="98"
                    step="0.5"
                    value={moisture}
                    onChange={(e) => {
                      setMoisture(parseFloat(e.target.value));
                      setFieldSources((prev) => ({ ...prev, moisture: 'user_input' }));
                      setFieldConfidences((prev) => ({ ...prev, moisture: 'High' }));
                    }}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="text-sm font-bold text-slate-900 w-14 text-right">{moisture}%</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {moisture > 70
                    ? 'High water activity: susceptible to rapid bacterial/fungal decay.'
                    : moisture < 5
                    ? 'Crisp/dry food: extremely sensitive to moisture vapor absorption and sogginess.'
                    : 'Intermediate moisture food.'}
                </p>
              </div>

              {/* pH Level */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Acidity / pH Level</label>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      fieldSources.ph === 'dataset'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Source: {fieldSources.ph === 'dataset' ? 'Verified DB' : fieldSources.ph}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="2.5"
                    max="8.5"
                    step="0.1"
                    value={ph}
                    onChange={(e) => {
                      setPh(parseFloat(e.target.value));
                      setFieldSources((prev) => ({ ...prev, ph: 'user_input' }));
                    }}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="text-sm font-bold text-slate-900 w-14 text-right">pH {ph}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {ph < 4.5
                    ? 'High acid food: naturally inhibits Clostridium botulinum growth.'
                    : 'Low acid food (pH ≥ 4.6): requires strict refrigeration or hermetic barrier.'}
                </p>
              </div>

              {/* Fat / Oil % */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Fat / Oil Content (%)</label>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      fieldSources.fat === 'dataset'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Source: {fieldSources.fat === 'dataset' ? 'Verified DB' : fieldSources.fat}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="85"
                    step="0.5"
                    value={fat}
                    onChange={(e) => {
                      setFat(parseFloat(e.target.value));
                      setFieldSources((prev) => ({ ...prev, fat: 'user_input' }));
                    }}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="text-sm font-bold text-slate-900 w-14 text-right">{fat}%</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {fat > 20
                    ? 'High fat content: oxygen and light barrier required to prevent rancid off-flavors.'
                    : 'Low fat product: lower lipid auto-oxidation risk.'}
                </p>
              </div>

              {/* Respiration Rate */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Postharvest Respiration Rate</label>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      fieldSources.respiration === 'dataset'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Source: {fieldSources.respiration === 'dataset' ? 'Verified DB' : fieldSources.respiration}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-1">
                  {(['None', 'Low', 'Medium', 'High', 'Very High'] as RespirationRate[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRespirationRate(r);
                        setFieldSources((prev) => ({ ...prev, respiration: 'user_input' }));
                      }}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        respirationRate === r
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  {respirationRate !== 'None'
                    ? 'Living tissue: requires breathable or micro-perforated film to avoid suffocation.'
                    : 'Non-respiring processed or dry food.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: Storage Conditions ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Storage & Environmental Conditions</h3>
              <p className="text-xs text-slate-500">
                Storage temperature and relative humidity directly drive Arrhenius degradation rates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Storage Type */}
              <div className="md:col-span-2 p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="text-xs font-bold text-slate-800">Storage Type Protocol</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {STORAGE_TYPES.map((st) => (
                    <button
                      key={st}
                      onClick={() => setStorageType(st)}
                      className={`p-2.5 rounded-lg text-xs font-semibold text-center border transition-all ${
                        storageType === st
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                    <span>Storage Temperature (°C)</span>
                  </label>
                  <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {temperature}°C
                  </span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="45"
                  step="1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>-20°C (Frozen)</span>
                  <span>4°C (Chilled)</span>
                  <span>22°C (Ambient)</span>
                  <span>40°C (Hot)</span>
                </div>
              </div>

              {/* Relative Humidity */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span>Relative Humidity (%)</span>
                  </label>
                  <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {rh}% RH
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="98"
                  step="1"
                  value={rh}
                  onChange={(e) => setRh(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>20% (Arid)</span>
                  <span>50% (Standard)</span>
                  <span>75% (Humid)</span>
                  <span>95% (Tropical)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: Transportation Duration ================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Transportation & Logistics</h3>
              <p className="text-xs text-slate-500">
                Transit duration increases vibration stress, flex cracks, and seal integrity requirements.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Transit Duration (Days)</div>
                    <div className="text-xs text-slate-500">Estimated transport time from farm/factory to retail</div>
                  </div>
                </div>
                <span className="text-base font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300">
                  {transitDays} {transitDays === 1 ? 'Day' : 'Days'}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="14"
                step="1"
                value={transitDays}
                onChange={(e) => setTransitDays(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600"
              />

              <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                <button
                  onClick={() => setTransitDays(1)}
                  className={`p-2 rounded-lg text-xs font-semibold border ${
                    transitDays === 1 ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  Local (1 Day)
                </button>
                <button
                  onClick={() => setTransitDays(3)}
                  className={`p-2 rounded-lg text-xs font-semibold border ${
                    transitDays === 3 ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  Regional (3 Days)
                </button>
                <button
                  onClick={() => setTransitDays(7)}
                  className={`p-2 rounded-lg text-xs font-semibold border ${
                    transitDays === 7 ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  Interstate (7 Days)
                </button>
                <button
                  onClick={() => setTransitDays(12)}
                  className={`p-2 rounded-lg text-xs font-semibold border ${
                    transitDays === 12 ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  Export (12 Days)
                </button>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  {transitDays > 5
                    ? 'Long-haul transit detected: ML Model F will automatically increase film thickness (+15-30%) and Model B will enforce higher seal tensile strength (≥35 N/15mm).'
                    : 'Short transit: Standard gauge film is sufficient without excess polymer usage.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: Desired Shelf Life ================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Desired Shelf-Life Target</h3>
              <p className="text-xs text-slate-500">
                Specify your commercial distribution target. The system will calculate required barrier specifications.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Target Shelf Life (Days)</div>
                    <div className="text-xs text-slate-500">
                      Standard expectation for {selectedCommodity.name}: ~{selectedCommodity.typical_shelf_life_days} days
                    </div>
                  </div>
                </div>
                <span className="text-base font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300">
                  {desiredShelfLifeDays} Days
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="365"
                step="1"
                value={desiredShelfLifeDays}
                onChange={(e) => setDesiredShelfLifeDays(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600"
              />

              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-slate-500">Quick presets:</span>
                {[7, 14, 30, 90, 180, 365].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDesiredShelfLifeDays(d)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                      desiredShelfLifeDays === d
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 6: Pre-flight Data Validation & ML Execution ================= */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Pre-Flight Data Transparency & Model Run</h3>
              <p className="text-xs text-slate-500">
                Review data sources and confidence before executing the multi-task ML recommendation pipeline.
              </p>
            </div>

            {/* Transparency Ledger Table */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Input Metadata Ledger</span>
                <span className="text-emerald-700 font-semibold normal-case">
                  Layered Architecture: Priority 1-3 Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <div className="text-[10px] text-slate-400 font-semibold">Commodity</div>
                  <div className="font-bold text-slate-800 truncate">{selectedCommodity.name}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                    <Database className="w-2.5 h-2.5" />
                    <span>
                      {selectedCommodity.fromMemory
                        ? '🧠 Learned Memory'
                        : selectedCommodity.isCustom
                        ? 'AI Resolved'
                        : 'Internal DB'}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <div className="text-[10px] text-slate-400 font-semibold">Moisture & pH</div>
                  <div className="font-bold text-slate-800">
                    {moisture}% • pH {ph}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                    <span>
                      {fieldSources.moisture === 'learned_memory'
                        ? '🧠 Memory Cached'
                        : fieldSources.moisture === 'ai_estimated'
                        ? 'AI Estimated'
                        : 'Verified'}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <div className="text-[10px] text-slate-400 font-semibold">Storage & Temp</div>
                  <div className="font-bold text-slate-800">
                    {temperature}°C • {storageType}
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500">{rh}% RH</div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <div className="text-[10px] text-slate-400 font-semibold">Target & Transit</div>
                  <div className="font-bold text-slate-800">{desiredShelfLifeDays} days target</div>
                  <div className="mt-1 text-[10px] text-slate-500">{transitDays} days transit</div>
                </div>
              </div>
            </div>

            {/* Model Architecture Info Banner */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <Cpu className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950 space-y-1">
                <span className="font-bold">ML Execution Pipeline (Models A through H):</span>
                <p className="text-emerald-900/90 leading-relaxed">
                  Upon clicking below, the system executes 8 separate prediction models: Material Classification,
                  Sealability, Shelf-Life Arrhenius Regression, OTR, WVTR, Film Thickness, MAP Suitability, and Gas
                  Formulation.
                </p>
              </div>
            </div>

            {/* Submit Action */}
            <button
              onClick={handleSubmit}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Generate Packaging Recommendation (Execute ML Engine)</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous Step</span>
        </button>

        <div className="text-xs text-slate-400 font-medium">
          Step {currentStep} of 6
        </div>

        {currentStep < 6 ? (
          <button
            onClick={() => setCurrentStep((prev) => Math.min(6, prev + 1))}
            className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            <span>Execute Models</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
          </button>
        )}
      </div>
    </div>
  );
};
