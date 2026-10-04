import {
  UserInputConditions,
  MLRecommendation,
  PendingTrainingCandidate,
} from '../types/packaging';

const LOCAL_CANDIDATES_KEY = 'packwise_pending_candidates';

// Pre-seeded initial candidates for immediate review demonstration
export const INITIAL_PRE_SEEDED_CANDIDATES: PendingTrainingCandidate[] = [
  {
    id: 'cand_init_1',
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    commodityName: 'Organic Black Turmeric (Curcuma caesia)',
    category: 'Condiments',
    moisture_percent: 12.0,
    pH: 6.1,
    fat_percent: 1.8,
    respiration_rate: 'None',
    respiration_mg_CO2_kg_hr: 0,
    storage_temperature_C: 22,
    relative_humidity_percent: 55,
    storage_type: 'Dry Storage',
    desired_shelf_life_days: 180,
    recommendedMaterialId: 'aluminum_foil_laminate',
    recommendedMaterialName: 'Aluminum Foil Multi-Layer Laminate',
    predictedShelfLifeDays: 240,
    confidenceScore: 92,
    status: 'pending',
    syntheticRowsYield: 250,
    source: 'user_recommendation',
  },
  {
    id: 'cand_init_2',
    timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    commodityName: 'Vacuum Freeze-Dried Strawberries',
    category: 'Snacks',
    moisture_percent: 2.5,
    pH: 3.8,
    fat_percent: 0.4,
    respiration_rate: 'None',
    respiration_mg_CO2_kg_hr: 0,
    storage_temperature_C: 20,
    relative_humidity_percent: 45,
    storage_type: 'Dry Storage',
    desired_shelf_life_days: 270,
    recommendedMaterialId: 'evoh_multilayer',
    recommendedMaterialName: 'EVOH Multilayer Barrier Film',
    predictedShelfLifeDays: 300,
    confidenceScore: 89,
    status: 'pending',
    syntheticRowsYield: 200,
    source: 'user_recommendation',
  },
];

export function getStoredCandidates(): PendingTrainingCandidate[] {
  try {
    const raw = localStorage.getItem(LOCAL_CANDIDATES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse local pending candidates', err);
  }
  return INITIAL_PRE_SEEDED_CANDIDATES;
}

export function saveStoredCandidates(candidates: PendingTrainingCandidate[]) {
  try {
    localStorage.setItem(LOCAL_CANDIDATES_KEY, JSON.stringify(candidates));
  } catch (err) {
    console.warn('Failed to save local pending candidates', err);
  }
}

/**
 * Automated logger invoked by the recommendation pipeline.
 * Records every unique user-generated input condition as a candidate for admin review.
 */
export async function logUserGeneratedCandidate(
  conditions: UserInputConditions,
  recommendation: MLRecommendation,
  source: 'user_recommendation' | 'whatif_simulator' | 'api_query' = 'user_recommendation'
): Promise<{ isNew: boolean; candidate: PendingTrainingCandidate }> {
  const currentList = getStoredCandidates();

  // Deduplication check: check if an identical or near-identical condition already exists
  const isDuplicate = currentList.some((item) => {
    const sameName =
      item.commodityName.toLowerCase().trim() === conditions.commodityName.toLowerCase().trim();
    if (!sameName) return false;

    // Check numerical proximity (within 3% moisture, 0.4 pH, 2°C temp)
    const moistureClose = Math.abs(item.moisture_percent - conditions.moisture_percent) < 3.0;
    const phClose = Math.abs(item.pH - conditions.pH) < 0.4;
    const tempClose = Math.abs(item.storage_temperature_C - conditions.storage_temperature_C) < 2.0;

    return moistureClose && phClose && tempClose;
  });

  if (isDuplicate) {
    const existing = currentList.find(
      (item) => item.commodityName.toLowerCase().trim() === conditions.commodityName.toLowerCase().trim()
    )!;
    return { isNew: false, candidate: existing };
  }

  // Create new unique candidate
  const candidateId = `cand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newCandidate: PendingTrainingCandidate = {
    id: candidateId,
    timestamp: new Date().toISOString(),
    commodityName: conditions.commodityName,
    category: conditions.category,
    moisture_percent: Number(conditions.moisture_percent),
    pH: Number(conditions.pH),
    fat_percent: Number(conditions.fat_percent),
    respiration_rate: conditions.respiration_rate,
    respiration_mg_CO2_kg_hr: Number(conditions.respiration_mg_CO2_kg_hr),
    storage_temperature_C: Number(conditions.storage_temperature_C),
    relative_humidity_percent: Number(conditions.relative_humidity_percent),
    storage_type: conditions.storage_type,
    desired_shelf_life_days: Number(conditions.desired_shelf_life_days || 30),
    recommendedMaterialId:
      (recommendation as any).primaryRecommendation?.materialId ||
      recommendation.recommended_material.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    recommendedMaterialName:
      (recommendation as any).primaryRecommendation?.materialName ||
      recommendation.recommended_material,
    predictedShelfLifeDays: recommendation.predicted_shelf_life_days,
    confidenceScore: recommendation.confidence_score,
    status: 'pending',
    syntheticRowsYield: 200,
    source,
  };

  const updatedList = [newCandidate, ...currentList];
  saveStoredCandidates(updatedList);

  // Sync with backend API
  try {
    await fetch('/api/recommendations/log-candidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCandidate),
    });
  } catch (err) {
    console.warn('Backend log candidate sync skipped (local store active):', err);
  }

  return { isNew: true, candidate: newCandidate };
}
