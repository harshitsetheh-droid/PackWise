/**
 * Core type definitions for PackWise AI decision-support system.
 */

export type FoodCategory =
  | 'Fresh fruits'
  | 'Fresh vegetables'
  | 'Grains'
  | 'Flours'
  | 'Pulses'
  | 'Nuts'
  | 'Dairy'
  | 'Frozen foods'
  | 'Meat'
  | 'Seafood'
  | 'Beverages'
  | 'Oils'
  | 'Bakery products'
  | 'Processed foods'
  | 'Snacks'
  | 'Condiments';

export type StorageType =
  | 'Ambient'
  | 'Chilled'
  | 'Frozen'
  | 'Deep Frozen'
  | 'Controlled Atmosphere'
  | 'Refrigerated'
  | 'Dry Storage'
  | 'Cold Chain';

export type RespirationRate = 'None' | 'Low' | 'Medium' | 'High' | 'Very High';

export type DataSource = 'dataset' | 'internal_database' | 'user_input' | 'ai_estimated' | 'learned_memory';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export type SealabilityClass = 'Poor' | 'Fair' | 'Good' | 'Very Good' | 'Excellent';

export type MAPSuitability = 'Recommended' | 'Optional' | 'Not Recommended';

export interface FieldResolution<T> {
  value: T;
  source: DataSource;
  confidence: ConfidenceLevel;
  estimated: boolean;
  notes?: string;
}

export interface Commodity {
  id: string;
  name: string;
  category: FoodCategory;
  moisture_percent: number;
  pH: number;
  fat_percent: number;
  respiration_rate: RespirationRate;
  respiration_mg_CO2_kg_hr: number;
  recommended_storage_temp_C: number;
  recommended_RH_percent: number;
  storage_type: StorageType;
  typical_shelf_life_days: number;
  primary_spoilage_factors: string[];
  description: string;
  icon?: string;
  isCustom?: boolean;
  fromMemory?: boolean;
  queryCount?: number;
  learnedAt?: string;
}

export interface PackagingMaterial {
  id: string;
  name: string;
  code: string;
  category: 'Polyolefin' | 'Polyester' | 'Barrier Multilayer' | 'Biodegradable' | 'Foil / Metalized' | 'Bio-based / Paper';
  structure_layers: string;
  OTR_cc_m2_day: number; // Typical at 23°C, 0% RH
  OTR_range: [number, number];
  WVTR_g_m2_day: number; // Typical at 38°C, 90% RH
  WVTR_range: [number, number];
  film_thickness_micron: number;
  thickness_range: [number, number];
  sealability: SealabilityClass;
  seal_temperature_C: number;
  mechanical_strength_MPa: number;
  seal_strength_N_per_15mm: number;
  MAP_suitability: MAPSuitability;
  cost_index_relative: number; // 1 to 10
  cost_estimate_per_1k_packs_usd: number;
  carbon_index_kgCO2_per_kg: number; // Simulated estimate
  recyclability: 'Widely Recyclable' | 'Specialty Recycled' | 'Non-Recyclable' | 'Industrial Compostable' | 'Home Compostable';
  is_biodegradable: boolean;
  advantages: string[];
  limitations: string[];
  typical_applications: string[];
}

export interface UserInputConditions {
  commodityName: string;
  category: FoodCategory;
  moisture_percent: number;
  pH: number;
  fat_percent: number;
  respiration_rate: RespirationRate;
  respiration_mg_CO2_kg_hr: number;
  storage_temperature_C: number;
  relative_humidity_percent: number;
  storage_type: StorageType;
  desired_shelf_life_days: number;
  transportation_duration_days: number;
  // Field resolutions
  fieldSources?: Record<string, DataSource>;
  fieldConfidences?: Record<string, ConfidenceLevel>;
  fieldEstimated?: Record<string, boolean>;
}

export interface PackagingAlternative {
  type: 'recommended' | 'lower_cost' | 'eco_friendly';
  label: string;
  material: string;
  structure: string;
  OTR_cc_m2_day: number;
  WVTR_g_m2_day: number;
  film_thickness_micron: number;
  sealability: SealabilityClass;
  mechanical_strength_MPa: number;
  predicted_shelf_life_days: number;
  cost_estimate_index: number; // 1-10
  cost_per_1k_packs: number;
  sustainability_score: number; // 0-100
  food_waste_risk_percent: number;
  packaging_impact_score: number; // 0-100
  pros: string[];
  trade_offs: string[];
}

export interface ContributingFactor {
  factor: string;
  direction: 'increase_barrier' | 'decrease_permeability' | 'increase_strength' | 'enable_breathing' | 'inert_gas';
  impactDescription: string;
  weight: number; // 0-100
}

export interface MLRecommendation {
  id: string;
  timestamp: string;
  commodityName: string;
  category: FoodCategory;
  inputConditions: UserInputConditions;

  // Primary ML predictions
  recommended_material: string;
  packaging_structure: string;
  OTR_cc_m2_day: number;
  WVTR_g_m2_day: number;
  film_thickness_micron: number;
  sealability: SealabilityClass;
  seal_temperature_C: number;
  mechanical_strength_MPa: number;
  seal_strength_N_per_15mm: number;
  MAP_suitability: MAPSuitability;
  recommended_MAP_O2_percent: number;
  recommended_MAP_CO2_percent: number;
  predicted_shelf_life_days: number;

  // Confidence & Validation
  confidence_score: number; // 0-100%
  confidence_level: ConfidenceLevel;
  confidence_reasons: string[];
  is_out_of_distribution: boolean;
  out_of_distribution_warnings: string[];

  // Explainable AI
  technical_explanation: string;
  msme_simple_explanation: string;
  top_contributing_factors: ContributingFactor[];

  // Sustainability & Food Loss Trade-off
  food_waste_risk_percent: number;
  packaging_environmental_score: number; // 0-100
  carbon_footprint_estimate_kgCO2e: number; // Simulated estimate

  // Alternatives
  alternatives: {
    recommended: PackagingAlternative;
    lower_cost: PackagingAlternative;
    eco_friendly: PackagingAlternative;
  };

  // User Rating & Refinement Feedback
  userFeedback?: RecommendationFeedback;
}

export type FeedbackRating = 'up' | 'down';

export interface RecommendationFeedback {
  rating: FeedbackRating;
  feedbackCategory?: string;
  suggestedMaterial?: string;
  suggestedShelfLifeDays?: number;
  comments?: string;
  submittedAt: string;
}

export interface WhatIfDelta {
  material_changed: boolean;
  old_material: string;
  new_material: string;
  otr_delta: number;
  wvtr_delta: number;
  thickness_delta: number;
  shelf_life_delta: number;
  food_waste_risk_delta: number;
  packaging_impact_delta: number;
  sealability_changed: boolean;
  map_changed: boolean;
}

export interface WhatIfComparison {
  original_conditions: UserInputConditions;
  new_conditions: UserInputConditions;
  original_recommendation: MLRecommendation;
  new_recommendation: MLRecommendation;
  deltas: WhatIfDelta;
  why_it_changed_explanation: string;
  primary_driver: string;
  risk_assessment: string;
}

export interface PackagingDiagnosis {
  directAnswer?: string;
  problemSummary: string;
  likelyCause: string;
  criticalParameter: string;
  parameterExplanation: string;
  suggestedImprovement: string;
  packagingAlternatives: {
    material: string;
    structure: string;
    whyBetter: string;
  }[];
  msmeFarmerTip: string;
  confidence: ConfidenceLevel;
}
