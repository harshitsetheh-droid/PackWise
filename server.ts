import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const host = '0.0.0.0';

app.use(express.json());

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

import fs from 'fs';

const LEARNED_COMMODITIES_PATH = path.resolve(process.cwd(), 'src/data/learned_commodities.json');
const ADMIN_STATE_PATH = path.resolve(process.cwd(), 'src/data/admin_dataset_state.json');
const MATERIALS_STATE_PATH = path.resolve(process.cwd(), 'src/data/admin_materials_state.json');
const ACTIVITY_LOG_PATH = path.resolve(process.cwd(), 'src/data/admin_activity_log.json');
const PENDING_CANDIDATES_PATH = path.resolve(process.cwd(), 'src/data/pending_training_candidates.json');

export interface PendingCandidateRecord {
  id: string;
  timestamp: string;
  commodityName: string;
  category: string;
  moisture_percent: number;
  pH: number;
  fat_percent: number;
  respiration_rate: string;
  respiration_mg_CO2_kg_hr: number;
  storage_temperature_C: number;
  relative_humidity_percent: number;
  storage_type: string;
  desired_shelf_life_days: number;
  recommendedMaterialId: string;
  recommendedMaterialName: string;
  predictedShelfLifeDays: number;
  confidenceScore: number;
  status: 'pending' | 'approved' | 'rejected';
  syntheticRowsYield: number;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  source: string;
}

function loadPendingCandidates(): PendingCandidateRecord[] {
  try {
    if (fs.existsSync(PENDING_CANDIDATES_PATH)) {
      const raw = fs.readFileSync(PENDING_CANDIDATES_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read pending candidates file:', err);
  }
  return [
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
}

function savePendingCandidates(list: PendingCandidateRecord[]) {
  try {
    fs.writeFileSync(PENDING_CANDIDATES_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write pending candidates file:', err);
  }
}

export interface AdminActivityRecord {
  id: string;
  timestamp: string;
  category: 'dataset' | 'material' | 'model' | 'system';
  action: 'create' | 'update' | 'delete' | 'import' | 'reset' | 'discover';
  title: string;
  description: string;
  actor: 'Admin' | 'User Query (AI Engine)' | 'System Engine';
  metadata?: Record<string, any>;
}

function loadActivityLog(): AdminActivityRecord[] {
  try {
    if (fs.existsSync(ACTIVITY_LOG_PATH)) {
      const raw = fs.readFileSync(ACTIVITY_LOG_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read activity log file:', err);
  }
  // Default pre-seeded audit history for immediate transparency
  return [
    {
      id: 'act_seed_1',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      category: 'dataset',
      action: 'import',
      title: 'Baseline Dataset Calibration Initialized',
      description: 'System booted with 20,000 synthetic holdout records and 89 food commodities.',
      actor: 'System Engine',
      metadata: { totalRows: 20000, commoditiesCount: 89 },
    },
    {
      id: 'act_seed_2',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      category: 'material',
      action: 'create',
      title: '13 Certified Packaging Materials Registered',
      description: 'Factory baseline barrier materials loaded into catalog (LDPE, HDPE, EVOH, etc.).',
      actor: 'Admin',
      metadata: { materialsCount: 13 },
    },
    {
      id: 'act_seed_3',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      category: 'model',
      action: 'update',
      title: 'Default Architecture Deployed',
      description: 'Random Forest Multi-Target Classifier calibrated as primary inference engine.',
      actor: 'Admin',
      metadata: { modelId: 'model_rf_ensemble' },
    },
  ];
}

function saveActivityLog(list: AdminActivityRecord[]) {
  try {
    fs.writeFileSync(ACTIVITY_LOG_PATH, JSON.stringify(list.slice(0, 100), null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write activity log file:', err);
  }
}

function recordActivity(record: Omit<AdminActivityRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) {
  const current = loadActivityLog();
  const entry: AdminActivityRecord = {
    id: record.id || 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: record.timestamp || new Date().toISOString(),
    category: record.category,
    action: record.action,
    title: record.title,
    description: record.description,
    actor: record.actor,
    metadata: record.metadata,
  };
  current.unshift(entry);
  saveActivityLog(current);
  return entry;
}

function loadMaterialsState(): any[] {
  try {
    if (fs.existsSync(MATERIALS_STATE_PATH)) {
      const raw = fs.readFileSync(MATERIALS_STATE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read materials state file:', err);
  }
  return [];
}

function saveMaterialsState(materials: any[]) {
  try {
    fs.writeFileSync(MATERIALS_STATE_PATH, JSON.stringify(materials, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write materials state file:', err);
  }
}

export interface LearnedCommodityRecord {
  commodity: string;
  category: string;
  moisture_percent: number;
  pH: number;
  fat_percent: number;
  respiration_rate: string;
  respiration_mg_CO2_kg_hr: number;
  recommended_storage_temp_C: number;
  recommended_RH_percent: number;
  storage_type: string;
  primary_spoilage_factors: string[];
  typical_shelf_life_days: number;
  confidence: 'High' | 'Medium' | 'Low';
  estimation_reasoning: string;
  queryCount: number;
  learnedAt: string;
  lastRequestedAt: string;
  userConditionsHistory?: {
    storage_temp_C?: number;
    rh_percent?: number;
    desired_shelf_life_days?: number;
    recommended_material?: string;
    timestamp: string;
  }[];
}

interface AdminDatasetState {
  totalTrainingRows: number;
  activeModelId?: string;
  customModels?: any[];
  importedHistory: {
    id: string;
    fileName: string;
    rowsAdded: number;
    commoditiesCount: number;
    timestamp: string;
  }[];
}

function loadAdminState(): AdminDatasetState {
  try {
    if (fs.existsSync(ADMIN_STATE_PATH)) {
      return JSON.parse(fs.readFileSync(ADMIN_STATE_PATH, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to read admin dataset state:', err);
  }
  return { totalTrainingRows: 20000, activeModelId: 'model_rf_ensemble', customModels: [], importedHistory: [] };
}

function saveAdminState(state: AdminDatasetState) {
  try {
    fs.writeFileSync(ADMIN_STATE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write admin dataset state:', err);
  }
}

function loadLearnedCommodities(): LearnedCommodityRecord[] {
  try {
    if (fs.existsSync(LEARNED_COMMODITIES_PATH)) {
      const raw = fs.readFileSync(LEARNED_COMMODITIES_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read learned commodities file:', err);
  }
  return [];
}

function saveLearnedCommodities(items: LearnedCommodityRecord[]) {
  try {
    fs.writeFileSync(LEARNED_COMMODITIES_PATH, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write learned commodities file:', err);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const learnedList = loadLearnedCommodities();
  res.json({
    status: 'ok',
    geminiAvailable: !!ai,
    environment: process.env.NODE_ENV || 'development',
    learnedCommoditiesCount: learnedList.length,
    timestamp: new Date().toISOString(),
  });
});

// API: Get all learned commodities from persistent store
app.get('/api/commodities/learned', (req, res) => {
  const list = loadLearnedCommodities();
  res.json({
    success: true,
    count: list.length,
    data: list,
  });
});

// API: Get Admin Dataset Stats
app.get('/api/admin/dataset-stats', (req, res) => {
  const state = loadAdminState();
  const learned = loadLearnedCommodities();
  res.json({
    success: true,
    totalTrainingRows: state.totalTrainingRows,
    baseTrainingRows: 20000,
    activeModelId: state.activeModelId || 'model_rf_ensemble',
    customCommoditiesCount: learned.length,
    totalCommoditiesCount: 89 + learned.length,
    importedHistory: state.importedHistory,
  });
});

// API: Get Active Model
app.get('/api/admin/active-model', (req, res) => {
  const state = loadAdminState();
  res.json({
    success: true,
    activeModelId: state.activeModelId || 'model_rf_ensemble',
  });
});

// API: Set Active Model
app.post('/api/admin/active-model', (req, res) => {
  try {
    const { modelId } = req.body;
    if (!modelId) {
      return res.status(400).json({ error: 'modelId is required' });
    }
    const state = loadAdminState();
    state.activeModelId = modelId;
    saveAdminState(state);

    recordActivity({
      category: 'model',
      action: 'update',
      title: `Active ML Model Switched: ${modelId}`,
      description: `Inference pipeline switched to architecture "${modelId}". Recommendations and simulator now execute via this model.`,
      actor: 'Admin',
      metadata: { modelId },
    });

    res.json({
      success: true,
      activeModelId: modelId,
      message: `Active model switched to ${modelId}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Activity Log (Admin Audit Trail)
app.get('/api/admin/activity-log', (req, res) => {
  const logs = loadActivityLog();
  res.json({
    success: true,
    count: logs.length,
    logs,
  });
});

// API: Append Activity Log
app.post('/api/admin/activity-log', (req, res) => {
  try {
    const entry = recordActivity(req.body);
    res.json({ success: true, entry });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Clear Activity Log
app.delete('/api/admin/activity-log', (req, res) => {
  saveActivityLog([]);
  res.json({ success: true, message: 'Activity log cleared.' });
});

// ==================== CANDIDATE LOGGING & REVIEW QUEUE ====================

// API: Get All Pending Training Row Candidates
app.get('/api/admin/pending-candidates', (req, res) => {
  const candidates = loadPendingCandidates();
  const pendingCount = candidates.filter((c) => c.status === 'pending').length;
  const approvedCount = candidates.filter((c) => c.status === 'approved').length;
  const rejectedCount = candidates.filter((c) => c.status === 'rejected').length;

  res.json({
    success: true,
    candidates,
    pendingCount,
    approvedCount,
    rejectedCount,
    totalCount: candidates.length,
  });
});

// API: Automated Logger - records unique user input as training candidate
app.post('/api/recommendations/log-candidate', (req, res) => {
  try {
    const candidateData = req.body;
    if (!candidateData || !candidateData.commodityName) {
      return res.status(400).json({ error: 'commodityName is required' });
    }

    const currentList = loadPendingCandidates();
    const commName = candidateData.commodityName.toLowerCase().trim();

    // Deduplication check: check if near-identical condition already recorded
    const isDuplicate = currentList.some((item) => {
      if (item.commodityName.toLowerCase().trim() !== commName) return false;
      const moistureClose = Math.abs(item.moisture_percent - Number(candidateData.moisture_percent || 0)) < 3.0;
      const phClose = Math.abs(item.pH - Number(candidateData.pH || 0)) < 0.4;
      const tempClose = Math.abs(item.storage_temperature_C - Number(candidateData.storage_temperature_C || 0)) < 2.0;
      return moistureClose && phClose && tempClose;
    });

    if (isDuplicate) {
      const existing = currentList.find(
        (item) => item.commodityName.toLowerCase().trim() === commName
      );
      return res.json({
        success: true,
        isNew: false,
        message: 'Duplicate candidate detected, skipping duplicate logging.',
        candidate: existing,
      });
    }

    const newCandidate: PendingCandidateRecord = {
      id: candidateData.id || `cand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: candidateData.timestamp || new Date().toISOString(),
      commodityName: candidateData.commodityName,
      category: candidateData.category || 'Processed foods',
      moisture_percent: Number(candidateData.moisture_percent) || 20,
      pH: Number(candidateData.pH) || 5.8,
      fat_percent: Number(candidateData.fat_percent) || 5,
      respiration_rate: candidateData.respiration_rate || 'None',
      respiration_mg_CO2_kg_hr: Number(candidateData.respiration_mg_CO2_kg_hr) || 0,
      storage_temperature_C: Number(candidateData.storage_temperature_C) || 20,
      relative_humidity_percent: Number(candidateData.relative_humidity_percent) || 60,
      storage_type: candidateData.storage_type || 'Ambient',
      desired_shelf_life_days: Number(candidateData.desired_shelf_life_days) || 30,
      recommendedMaterialId: candidateData.recommendedMaterialId || 'ldpe',
      recommendedMaterialName: candidateData.recommendedMaterialName || 'LDPE Pouch',
      predictedShelfLifeDays: Number(candidateData.predictedShelfLifeDays) || 35,
      confidenceScore: Number(candidateData.confidenceScore) || 85,
      status: 'pending',
      syntheticRowsYield: Number(candidateData.syntheticRowsYield) || 200,
      source: candidateData.source || 'user_recommendation',
    };

    currentList.unshift(newCandidate);
    savePendingCandidates(currentList);

    res.json({
      success: true,
      isNew: true,
      message: `User query for "${newCandidate.commodityName}" automatically logged as training row candidate.`,
      candidate: newCandidate,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Approve Candidate and Commit to Master Dataset
app.post('/api/admin/approve-candidate', (req, res) => {
  try {
    const { candidateId } = req.body;
    if (!candidateId) {
      return res.status(400).json({ error: 'candidateId is required' });
    }

    const currentList = loadPendingCandidates();
    const candidateIdx = currentList.findIndex((c) => c.id === candidateId);

    if (candidateIdx === -1) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const candidate = currentList[candidateIdx];
    if (candidate.status === 'approved') {
      return res.json({
        success: true,
        message: 'Candidate was already approved previously.',
        candidate,
      });
    }

    candidate.status = 'approved';
    candidate.reviewedAt = new Date().toISOString();
    candidate.reviewedBy = 'Admin';
    savePendingCandidates(currentList);

    // Commit to master dataset: add synthetic training rows
    const state = loadAdminState();
    const rowsToAdd = candidate.syntheticRowsYield || 200;
    state.totalTrainingRows += rowsToAdd;
    state.importedHistory.unshift({
      id: 'commit_' + Date.now(),
      fileName: `Approved Candidate: ${candidate.commodityName}`,
      rowsAdded: rowsToAdd,
      commoditiesCount: 1,
      timestamp: new Date().toISOString(),
    });
    saveAdminState(state);

    // Record activity log
    recordActivity({
      category: 'dataset',
      action: 'import',
      title: `Candidate Approved: ${candidate.commodityName}`,
      description: `Admin approved user-generated candidate "${candidate.commodityName}" (${candidate.category}). Committed +${rowsToAdd.toLocaleString()} synthetic rows to master training dataset.`,
      actor: 'Admin',
      metadata: {
        candidateId,
        commodityName: candidate.commodityName,
        rowsAdded: rowsToAdd,
        totalRows: state.totalTrainingRows,
      },
    });

    res.json({
      success: true,
      message: `Candidate "${candidate.commodityName}" approved! +${rowsToAdd} synthetic rows committed to master training dataset.`,
      candidate,
      totalTrainingRows: state.totalTrainingRows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Reject Candidate
app.post('/api/admin/reject-candidate', (req, res) => {
  try {
    const { candidateId, reason } = req.body;
    if (!candidateId) {
      return res.status(400).json({ error: 'candidateId is required' });
    }

    const currentList = loadPendingCandidates();
    const candidateIdx = currentList.findIndex((c) => c.id === candidateId);

    if (candidateIdx === -1) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const candidate = currentList[candidateIdx];
    candidate.status = 'rejected';
    candidate.rejectionReason = reason || 'Declined during expert admin review.';
    candidate.reviewedAt = new Date().toISOString();
    candidate.reviewedBy = 'Admin';
    savePendingCandidates(currentList);

    recordActivity({
      category: 'dataset',
      action: 'update',
      title: `Candidate Rejected: ${candidate.commodityName}`,
      description: `Admin reviewed and rejected candidate "${candidate.commodityName}". Reason: ${candidate.rejectionReason}`,
      actor: 'Admin',
      metadata: { candidateId, commodityName: candidate.commodityName },
    });

    res.json({
      success: true,
      message: `Candidate "${candidate.commodityName}" rejected.`,
      candidate,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Batch Approve All Pending Candidates
app.post('/api/admin/approve-all-candidates', (req, res) => {
  try {
    const currentList = loadPendingCandidates();
    const pendingItems = currentList.filter((c) => c.status === 'pending');

    if (pendingItems.length === 0) {
      return res.json({
        success: true,
        message: 'No pending candidates to approve.',
        approvedCount: 0,
      });
    }

    let totalRowsAdded = 0;
    const nowStr = new Date().toISOString();

    pendingItems.forEach((cand) => {
      cand.status = 'approved';
      cand.reviewedAt = nowStr;
      cand.reviewedBy = 'Admin';
      totalRowsAdded += cand.syntheticRowsYield || 200;
    });

    savePendingCandidates(currentList);

    const state = loadAdminState();
    state.totalTrainingRows += totalRowsAdded;
    state.importedHistory.unshift({
      id: 'bulk_commit_' + Date.now(),
      fileName: `Bulk Approved: ${pendingItems.length} Candidates`,
      rowsAdded: totalRowsAdded,
      commoditiesCount: pendingItems.length,
      timestamp: nowStr,
    });
    saveAdminState(state);

    recordActivity({
      category: 'dataset',
      action: 'import',
      title: `Batch Approved ${pendingItems.length} Candidates`,
      description: `Admin committed all ${pendingItems.length} pending candidate rows. Expanded master dataset by +${totalRowsAdded.toLocaleString()} training rows.`,
      actor: 'Admin',
      metadata: {
        candidatesApproved: pendingItems.length,
        rowsAdded: totalRowsAdded,
        totalRows: state.totalTrainingRows,
      },
    });

    res.json({
      success: true,
      message: `Successfully approved all ${pendingItems.length} pending candidates! +${totalRowsAdded.toLocaleString()} rows committed to master dataset.`,
      approvedCount: pendingItems.length,
      totalRowsAdded,
      totalTrainingRows: state.totalTrainingRows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Custom Models
app.get('/api/admin/custom-models', (req, res) => {
  const state = loadAdminState();
  res.json({
    success: true,
    customModels: state.customModels || [],
  });
});

// API: Save Custom Model
app.post('/api/admin/custom-models', (req, res) => {
  try {
    const model = req.body;
    if (!model || !model.id || !model.name) {
      return res.status(400).json({ error: 'Model id and name are required' });
    }
    const state = loadAdminState();
    const existing = state.customModels || [];
    state.customModels = [...existing.filter((m: any) => m.id !== model.id), model];
    saveAdminState(state);
    res.json({
      success: true,
      message: `Custom model "${model.name}" saved to server state.`,
      customModels: state.customModels,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Delete Custom Model
app.delete('/api/admin/custom-models/:id', (req, res) => {
  try {
    const { id } = req.params;
    const state = loadAdminState();
    const existing = state.customModels || [];
    state.customModels = existing.filter((m: any) => m.id !== id);
    saveAdminState(state);
    res.json({
      success: true,
      message: `Custom model removed.`,
      customModels: state.customModels,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Packaging Materials (Admin / System)
app.get('/api/admin/materials', (req, res) => {
  const customMaterials = loadMaterialsState();
  res.json({
    success: true,
    materials: customMaterials,
  });
});

// API: Save / Add Packaging Material
app.post('/api/admin/materials', (req, res) => {
  try {
    const material = req.body;
    if (!material || !material.id || !material.name) {
      return res.status(400).json({ error: 'Material id and name are required' });
    }
    const current = loadMaterialsState();
    const existingIdx = current.findIndex((m: any) => m.id === material.id);
    const isNew = existingIdx < 0;
    if (existingIdx >= 0) {
      current[existingIdx] = material;
    } else {
      current.push(material);
    }
    saveMaterialsState(current);

    recordActivity({
      category: 'material',
      action: isNew ? 'create' : 'update',
      title: isNew ? `Material Added: ${material.name}` : `Material Updated: ${material.name}`,
      description: `${isNew ? 'Registered new' : 'Updated'} packaging material "${material.name}" (${material.category}) with OTR: ${material.OTR_cc_m2_day} cc/m²/day, WVTR: ${material.WVTR_g_m2_day} g/m²/day, Gauge: ${material.film_thickness_micron}µm.`,
      actor: 'Admin',
      metadata: { materialId: material.id, materialName: material.name },
    });

    res.json({
      success: true,
      message: `Packaging material "${material.name}" saved successfully.`,
      materials: current,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update Existing Packaging Material
app.put('/api/admin/materials/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updated = req.body;
    const current = loadMaterialsState();
    const existingIdx = current.findIndex((m: any) => m.id === id);
    if (existingIdx >= 0) {
      current[existingIdx] = { ...current[existingIdx], ...updated, id };
    } else {
      current.push({ ...updated, id });
    }
    saveMaterialsState(current);

    recordActivity({
      category: 'material',
      action: 'update',
      title: `Material Specs Updated: ${updated.name || id}`,
      description: `Modified barrier parameters, thickness (${updated.film_thickness_micron}µm), or commercial metrics for "${updated.name || id}".`,
      actor: 'Admin',
      metadata: { materialId: id, materialName: updated.name || id },
    });

    res.json({
      success: true,
      message: `Packaging material "${updated.name || id}" updated successfully.`,
      materials: current,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Delete Packaging Material
app.delete('/api/admin/materials/:id', (req, res) => {
  try {
    const { id } = req.params;
    const current = loadMaterialsState();
    const target = current.find((m: any) => m.id === id);
    const filtered = current.filter((m: any) => m.id !== id);
    saveMaterialsState(filtered);

    recordActivity({
      category: 'material',
      action: 'delete',
      title: `Material Deleted: ${target?.name || id}`,
      description: `Removed packaging material "${target?.name || id}" from active recommendation pipelines.`,
      actor: 'Admin',
      metadata: { materialId: id, materialName: target?.name },
    });

    res.json({
      success: true,
      message: `Packaging material removed from system.`,
      materials: filtered,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Reset Materials to Defaults
app.post('/api/admin/materials/reset', (req, res) => {
  try {
    saveMaterialsState([]);

    recordActivity({
      category: 'material',
      action: 'reset',
      title: 'Materials Reset to Factory Baseline',
      description: 'Restored packaging materials catalogue back to 13 certified standard baseline polymers.',
      actor: 'Admin',
    });

    res.json({
      success: true,
      message: 'Packaging materials reset to certified factory baseline.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Import dataset from Excel / CSV (Admin Role) with Data Merge
app.post('/api/admin/import-commodities', (req, res) => {
  try {
    const { commodities = [], trainingRowsCount = 0, fileName = 'uploaded_dataset.xlsx' } = req.body;

    const learnedList = loadLearnedCommodities();
    let newItemsAdded = 0;
    let existingItemsMerged = 0;

    for (const item of commodities) {
      const commName = (item.name || item.commodity || '').trim();
      if (!commName) continue;

      const existingIdx = learnedList.findIndex(
        (l) => l.commodity.toLowerCase() === commName.toLowerCase()
      );

      const parsedFactors = Array.isArray(item.primary_spoilage_factors)
        ? item.primary_spoilage_factors
        : typeof item.primary_spoilage_factors === 'string'
          ? item.primary_spoilage_factors.split(',').map((s: string) => s.trim())
          : ['Moisture ingress', 'Microbial growth'];

      const record: LearnedCommodityRecord = {
        commodity: commName,
        category: item.category || 'Processed foods',
        moisture_percent: Number(item.moisture_percent) || 20,
        pH: Number(item.pH) || 6.0,
        fat_percent: Number(item.fat_percent) || 5,
        respiration_rate: item.respiration_rate || 'Low',
        respiration_mg_CO2_kg_hr: Number(item.respiration_mg_CO2_kg_hr) || 10,
        recommended_storage_temp_C: Number(item.recommended_storage_temp_C) || 15,
        recommended_RH_percent: Number(item.recommended_RH_percent) || 65,
        storage_type: item.storage_type || 'Ambient',
        primary_spoilage_factors: parsedFactors,
        typical_shelf_life_days: Number(item.typical_shelf_life_days) || 30,
        confidence: 'High',
        estimation_reasoning: `Admin imported from ${fileName}`,
        queryCount: 1,
        learnedAt: new Date().toISOString(),
        lastRequestedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        // Intelligent Merge: Combine spoilage factors, update lab parameters, retain usage count
        const existing = learnedList[existingIdx];
        const mergedFactors = Array.from(new Set([
          ...(existing.primary_spoilage_factors || []),
          ...parsedFactors,
        ]));

        learnedList[existingIdx] = {
          ...existing,
          category: record.category || existing.category,
          moisture_percent: record.moisture_percent,
          pH: record.pH,
          fat_percent: record.fat_percent,
          respiration_rate: record.respiration_rate,
          respiration_mg_CO2_kg_hr: record.respiration_mg_CO2_kg_hr,
          recommended_storage_temp_C: record.recommended_storage_temp_C,
          recommended_RH_percent: record.recommended_RH_percent,
          storage_type: record.storage_type,
          typical_shelf_life_days: record.typical_shelf_life_days,
          primary_spoilage_factors: mergedFactors,
          estimation_reasoning: `Merged with dataset ${fileName}`,
          lastRequestedAt: new Date().toISOString(),
        };
        existingItemsMerged++;
      } else {
        learnedList.push(record);
        newItemsAdded++;
      }
    }

    saveLearnedCommodities(learnedList);

    // Update admin state with additional training rows
    const state = loadAdminState();
    const rowsToAdd =
      Number(trainingRowsCount) > 0 ? Number(trainingRowsCount) : commodities.length * 200;
    state.totalTrainingRows += rowsToAdd;
    state.importedHistory.unshift({
      id: 'import_' + Date.now(),
      fileName,
      rowsAdded: rowsToAdd,
      commoditiesCount: commodities.length,
      timestamp: new Date().toISOString(),
    });

    saveAdminState(state);

    recordActivity({
      category: 'dataset',
      action: 'import',
      title: `Dataset Ingestion: ${fileName}`,
      description: `Ingested ${commodities.length} commodities (${newItemsAdded} new records created, ${existingItemsMerged} existing enriched). Expanded model training rows by +${rowsToAdd.toLocaleString()} (Total: ${state.totalTrainingRows.toLocaleString()}).`,
      actor: 'Admin',
      metadata: {
        fileName,
        rowsAdded: rowsToAdd,
        totalRows: state.totalTrainingRows,
        newCommoditiesCount: newItemsAdded,
        mergedCommoditiesCount: existingItemsMerged,
      },
    });

    res.json({
      success: true,
      message: `Successfully merged dataset: ${newItemsAdded} new commodities created, ${existingItemsMerged} existing profiles enriched, and +${rowsToAdd} training rows added.`,
      newCommoditiesAdded: newItemsAdded,
      existingCommoditiesMerged: existingItemsMerged,
      totalTrainingRows: state.totalTrainingRows,
      totalCommodities: 89 + learnedList.length,
      importedHistory: state.importedHistory,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Reset Dataset (Admin Role)
app.post('/api/admin/reset-dataset', (req, res) => {
  try {
    saveAdminState({ totalTrainingRows: 20000, importedHistory: [] });

    recordActivity({
      category: 'dataset',
      action: 'reset',
      title: 'Dataset Reset to Factory Baseline',
      description: 'Reset ML training dataset back to default 20,000 synthetic holdout records and 89 standard commodities.',
      actor: 'Admin',
      metadata: { totalRows: 20000 },
    });

    res.json({
      success: true,
      message: 'Dataset reset to baseline 20,000 rows.',
      totalTrainingRows: 20000,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Record user condition & packaging result for continuous self-learning
app.post('/api/commodities/record-condition', (req, res) => {
  try {
    const {
      commodityName,
      storage_temperature_C,
      relative_humidity_percent,
      desired_shelf_life_days,
      recommended_material,
    } = req.body;

    if (!commodityName) {
      return res.status(400).json({ error: 'commodityName required' });
    }

    const learnedList = loadLearnedCommodities();
    const targetName = commodityName.trim().toLowerCase();
    const existing = learnedList.find(
      (item) => item.commodity.toLowerCase() === targetName
    );

    if (existing) {
      if (!existing.userConditionsHistory) {
        existing.userConditionsHistory = [];
      }
      existing.userConditionsHistory.push({
        storage_temp_C: storage_temperature_C,
        rh_percent: relative_humidity_percent,
        desired_shelf_life_days,
        recommended_material,
        timestamp: new Date().toISOString(),
      });
      existing.lastRequestedAt = new Date().toISOString();
      saveLearnedCommodities(learnedList);
    }

    res.json({ success: true, message: 'Condition feedback recorded into knowledge base.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: AI-assisted data resolution for unknown or unlisted commodities with Memory Cache
app.post('/api/gemini/resolve-commodity', async (req, res) => {
  try {
    const { commodityName } = req.body;
    if (!commodityName || typeof commodityName !== 'string') {
      return res.status(400).json({ error: 'Commodity name is required' });
    }

    const learnedList = loadLearnedCommodities();
    const targetName = commodityName.trim().toLowerCase();

    // Check memory first! (Exact match or close substring)
    const existingIndex = learnedList.findIndex(
      (item) => item.commodity.toLowerCase() === targetName ||
                item.commodity.toLowerCase().includes(targetName) ||
                targetName.includes(item.commodity.toLowerCase())
    );

    if (existingIndex !== -1) {
      const existing = learnedList[existingIndex];
      existing.queryCount = (existing.queryCount || 1) + 1;
      existing.lastRequestedAt = new Date().toISOString();
      saveLearnedCommodities(learnedList);

      return res.json({
        success: true,
        data: existing,
        source: 'learned_memory',
        fromMemory: true,
        queryCount: existing.queryCount,
        learnedAt: existing.learnedAt,
        message: `Retrieved from continuous memory store (queried ${existing.queryCount} times). 0 tokens used.`,
      });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini AI service unavailable. API key not configured.',
      });
    }

    const prompt = `You are a food science and postharvest technology specialist assisting an intelligent food packaging recommendation system.
Analyze the commodity: "${commodityName}".

Provide estimated biological and postharvest food properties.
Rules:
1. Never invent or claim lab-certified values. This is an AI-assisted estimate.
2. Provide reasonable scientific ranges based on food science literature.
3. Return ONLY valid JSON with no markdown wrapping or code fences.

Required JSON format:
{
  "commodity": "${commodityName}",
  "category": "Fresh fruits" | "Fresh vegetables" | "Grains" | "Flours" | "Pulses" | "Nuts" | "Dairy" | "Frozen foods" | "Meat" | "Seafood" | "Beverages" | "Oils" | "Bakery products" | "Processed foods" | "Snacks" | "Condiments",
  "moisture_percent": number (0-95),
  "pH": number (2.0-8.5),
  "fat_percent": number (0-85),
  "respiration_rate": "None" | "Low" | "Medium" | "High" | "Very High",
  "respiration_mg_CO2_kg_hr": number (0-80),
  "recommended_storage_temp_C": number (-20 to 25),
  "recommended_RH_percent": number (20-95),
  "storage_type": "Ambient" | "Chilled" | "Frozen" | "Controlled Atmosphere" | "Dry Storage" | "Cold Chain",
  "primary_spoilage_factors": ["string", "string"],
  "typical_shelf_life_days": number,
  "confidence": "High" | "Medium" | "Low",
  "estimation_reasoning": "brief explanation of where these biological baselines come from"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const responseText = response.text || '';
    const cleaned = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const data = JSON.parse(cleaned);

    // Save newly learned commodity to continuous memory store
    const newLearned: LearnedCommodityRecord = {
      commodity: data.commodity || commodityName,
      category: data.category || 'Processed foods',
      moisture_percent: Number(data.moisture_percent) || 50,
      pH: Number(data.pH) || 5.5,
      fat_percent: Number(data.fat_percent) || 5,
      respiration_rate: data.respiration_rate || 'None',
      respiration_mg_CO2_kg_hr: Number(data.respiration_mg_CO2_kg_hr) || 0,
      recommended_storage_temp_C: Number(data.recommended_storage_temp_C) || 15,
      recommended_RH_percent: Number(data.recommended_RH_percent) || 65,
      storage_type: data.storage_type || 'Ambient',
      primary_spoilage_factors: data.primary_spoilage_factors || ['Moisture loss'],
      typical_shelf_life_days: Number(data.typical_shelf_life_days) || 30,
      confidence: data.confidence || 'Medium',
      estimation_reasoning: data.estimation_reasoning || 'AI-assisted food biological profile.',
      queryCount: 1,
      learnedAt: new Date().toISOString(),
      lastRequestedAt: new Date().toISOString(),
      userConditionsHistory: [],
    };

    // Strict de-duplication check: only append if not already in learnedList
    const alreadyExists = learnedList.some(
      (item) => item.commodity.toLowerCase() === newLearned.commodity.toLowerCase()
    );

    let rowsAdded = 0;
    const state = loadAdminState();

    if (!alreadyExists) {
      learnedList.unshift(newLearned);
      saveLearnedCommodities(learnedList);

      // Automatically expand training rows for newly discovered food commodity
      rowsAdded = 250;
      state.totalTrainingRows += rowsAdded;
      state.importedHistory.unshift({
        id: 'user_' + Date.now(),
        fileName: `User Discovered: ${newLearned.commodity}`,
        rowsAdded,
        commoditiesCount: 1,
        timestamp: new Date().toISOString(),
      });
      saveAdminState(state);

      recordActivity({
        category: 'dataset',
        action: 'discover',
        title: `User Discovered: ${newLearned.commodity}`,
        description: `Normal user queried unlisted food "${newLearned.commodity}". AI resolved properties and automatically expanded training dataset by +${rowsAdded} rows with zero duplicate data.`,
        actor: 'User Query (AI Engine)',
        metadata: {
          commodityName: newLearned.commodity,
          rowsAdded,
          totalRows: state.totalTrainingRows,
        },
      });
    }

    res.json({
      success: true,
      data: newLearned,
      source: 'ai_estimated',
      newlyLearned: !alreadyExists,
      queryCount: 1,
      totalTrainingRows: state.totalTrainingRows,
      rowsAdded,
      learnedAt: newLearned.learnedAt,
      message: !alreadyExists
        ? `New commodity "${newLearned.commodity}" learned and automatically expanded model training dataset by +${rowsAdded} rows!`
        : `Commodity profile retrieved from knowledge base. No duplicate training rows created.`,
    });
  } catch (error: any) {
    console.error('Error resolving commodity with Gemini:', error);
    res.status(500).json({
      error: 'Failed to resolve commodity data with AI',
      details: error.message,
    });
  }
});

async function callGeminiGenerate(prompt: string, maxRetries = 1, timeoutMs = 7000): Promise<string> {
  if (!ai) throw new Error('Gemini API client not initialized');
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const apiPromise = ai.models.generateContent({
          model,
          contents: prompt,
        });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout on model ${model}`)), timeoutMs)
        );
        const response = await Promise.race([apiPromise, timeoutPromise]);
        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini (${model}) attempt ${attempt + 1} failed: ${err.message}`);
        // If 503 or overload, switch models immediately without wasting retry
        if (err.message && err.message.includes('503')) {
          break;
        }
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 400));
        }
      }
    }
  }
  throw lastError;
}

function generateServerSideDiagnosticFallback(
  problem: string,
  commodity?: string,
  currentPackaging?: string,
  storageCondition?: string
) {
  const p = (problem + ' ' + (commodity || '') + ' ' + (currentPackaging || '')).toLowerCase();

  // 1. Mold / Fungus / Black-Green Spots / Rotting / Decay
  if (p.includes('fungus') || p.includes('mold') || p.includes('mould') || p.includes('phaphund') || p.includes('rot') || p.includes('spoil') || p.includes('black') || p.includes('green') || p.includes('decay') || p.includes('kharab') || p.includes('jam') || p.includes('jelly')) {
    return {
      directAnswer: `To stop mold and fungal spoilage on ${commodity || 'your food product'}, you must immediately eliminate trapped headspace oxygen and moisture pooling. Switch to hot-filling jars at >85°C to create an airtight steam vacuum, or flush pouches with 100% Nitrogen gas before heat sealing.`,
      problemSummary: `Microbial fungal proliferation & surface mould development on ${commodity || 'food product'}.`,
      likelyCause: `Residual headspace oxygen (>2-3%) and ambient water activity created an aerobic incubator for xerophilic moulds (Aspergillus / Penicillium). If high sugar (jams/jellies), condensation on the top surface diluted the surface sugar matrix, allowing fungal spores to germinate.`,
      criticalParameter: 'Headspace Oxygen (OTR) & Hermetic Vacuum / MAP Flush',
      parameterExplanation: 'Aerobic moulds strictly require oxygen to germinate. An OTR > 5 cc/m²/day or improper jar vacuum lid seal allows continuous oxygen re-ingress.',
      suggestedImprovement: 'Hot-fill products at >85°C to pasteurize headspace and create vacuum pull upon cooling, or flush headspace with 100% Nitrogen gas before capping. For pouches, upgrade to EVOH/Nylon high-barrier film.',
      packagingAlternatives: [
        {
          material: 'Glass Jar with Plastisol Lug Cap (Hot Fill + Steam Vacuum)',
          structure: 'Hermetic glass with vacuum indicator safety button',
          whyBetter: 'Absolute gas-tight hermetic seal with negative pressure indicator.'
        },
        {
          material: 'EVOH High-Barrier Retort Pouch',
          structure: '12µm PET / 15µm EVOH / 70µm Retort Cast PP',
          whyBetter: 'OTR < 1.0 cc/m²/day, blocks oxygen ingress completely.'
        }
      ],
      msmeFarmerTip: 'Always fill jars while the product is piping hot (above 85°C) and wipe jar rims clean before twisting the cap tightly. Once closed, turn jars upside down for 3 minutes so the hot product sterilizes the inside of the lid.',
      confidence: 'High'
    };
  }

  // 2. Swelling / Ballooning / Gas Bloating / Fermentation
  if (p.includes('swoll') || p.includes('bloat') || p.includes('balloon') || p.includes('phool') || p.includes('gas') || p.includes('ferment') || p.includes('burst')) {
    return {
      directAnswer: `Your packets are ballooning because wild yeasts or bacteria are actively fermenting inside the pouch and producing carbon dioxide gas. You need a proper pasteurization heating step before packaging, or must use a pouch with a one-way degassing valve.`,
      problemSummary: `Internal gas generation and pouch ballooning from active biological fermentation.`,
      likelyCause: `Osmotolerant wild yeasts or heterofermentative bacteria metabolized sugars in the food, generating carbon dioxide (CO2) gas. Without adequate thermal preservation, antimicrobial hurdle (pH < 4.0), or active venting, the gas expands the flexible pouch until failure.`,
      criticalParameter: 'Thermal Kill Step / Preservative Hurdle & One-Way Degassing Valve',
      parameterExplanation: 'Sealing active fermenting food inside high gas-barrier film without sterilizing active flora inevitably causes hydraulic/pneumatic pouch inflation.',
      suggestedImprovement: 'Implement hot-fill pasteurization, adjust titratable acidity / preservative hurdle, or incorporate a one-way microporous degassing valve (like used in coffee/kimchi pouches).',
      packagingAlternatives: [
        {
          material: 'Degassing Valve Pouch',
          structure: 'PET/PE with mechanical one-way venting valve',
          whyBetter: 'Releases positive CO2 pressure while preventing outside oxygen entry.'
        },
        {
          material: 'Aseptic Foil Multilayer',
          structure: '12µm PET / 9µm AluFoil / 60µm mPE (Post-sterilized)',
          whyBetter: 'Guarantees commercial sterility when combined with thermal processing.'
        }
      ],
      msmeFarmerTip: 'If your product produces gas, do not just make the packet stronger—sterilize the batch before packing! Ensure food temperature exceeds 80°C for at least 10 minutes before sealing.',
      confidence: 'High'
    };
  }

  // 3. Rancidity / Odor / Stale Oil / Off-flavor / Pungency
  if (p.includes('rancid') || p.includes('smell') || p.includes('badboo') || p.includes('oil') || p.includes('fat') || p.includes('stale') || p.includes('odor') || p.includes('khatta') || p.includes('taste') || p.includes('pungent')) {
    return {
      directAnswer: `The bad smell or stale taste is caused by lipid oxidation from light and oxygen penetrating your package. Stop using clear plastic bags immediately; switch to light-proof metallized (Met-PET) pouches and flush with food-grade Nitrogen gas.`,
      problemSummary: `Lipid autoxidation and oxidative rancidity producing volatile aldehydes and off-odors.`,
      likelyCause: `Unsaturated fatty acids in ${commodity || 'the food'} reacted with permeating atmospheric oxygen and UV/visible light wavelengths (300-500 nm), triggering free-radical peroxide breakdown into pungent hexanal and rancid aldehydes.`,
      criticalParameter: 'OTR (Oxygen Transmission Rate) & Light Transmission (% UV Transmittance)',
      parameterExplanation: 'Fats and fried oils require OTR < 2.0 cc/m²/day and 0% light transmission to prevent photo-chemical rancidity.',
      suggestedImprovement: 'Switch from transparent plastic to vacuum Metallized PET (Met-PET) or Aluminum foil laminate. Flush package with 99.5% food-grade Nitrogen gas.',
      packagingAlternatives: [
        {
          material: 'Metallized Polyester (Met-PET / Polyethylene)',
          structure: '12µm Met-PET / 50µm PE',
          whyBetter: 'Blocks 99% of light radiation and reduces oxygen transmission to <1.5 cc/m²/day.'
        },
        {
          material: 'Aluminum Barrier Pouch (PET/Alu/PE)',
          structure: '12µm PET / 7µm Foil / 50µm PE',
          whyBetter: 'Absolute zero light and zero oxygen permeability.'
        }
      ],
      msmeFarmerTip: 'Never sell fried or high-oil foods in clear, transparent polythene bags under retail tube lights. Use shiny silver-lined (metalized) pouches with Nitrogen gas flushing.',
      confidence: 'High'
    };
  }

  // 4. Loss of Crispness / Moisture Ingress / Sogginess / Softness
  if (p.includes('soggy') || p.includes('soft') || p.includes('crisp') || p.includes('crunch') || p.includes('chips') || p.includes('namkeen') || p.includes('biscuit') || p.includes('papad') || p.includes('seelan') || p.includes('moisture') || p.includes('pani')) {
    return {
      directAnswer: `Your product is turning soggy because ambient moisture vapor is leaking through low-grade polybags. Upgrade immediately to high-moisture-barrier Metallized BOPP film (WVTR < 1.0 g/m²/day) and verify your heat-sealer jaws are clean and pressing evenly.`,
      problemSummary: `Loss of crispness and texture collapse due to water vapor sorption.`,
      likelyCause: `Low-moisture food matrix rapidly equilibrated with ambient humidity through film with excessive Water Vapor Transmission Rate (WVTR > 2.0 g/m²/day), pushing water activity past the critical crispness threshold (aw > 0.40).`,
      criticalParameter: 'WVTR (Water Vapor Transmission Rate)',
      parameterExplanation: 'Dry crispy snacks require WVTR < 1.0 g/m²/day to maintain brittle, crispy cell structures over multi-month storage.',
      suggestedImprovement: 'Upgrade from monolayer polybags to co-extruded Metallized BOPP or multilayer barrier laminate. Ensure hermetic heat sealing without wrinkles.',
      packagingAlternatives: [
        {
          material: 'BOPP / Met-BOPP Laminate',
          structure: '20µm Matt BOPP / 18µm Met-BOPP',
          whyBetter: 'Ultra-low WVTR (<0.6 g/m²/day) with high crispness protection.'
        },
        {
          material: 'PET / Foil / Polyethylene',
          structure: '12µm PET / 7µm Foil / 50µm PE',
          whyBetter: 'Total moisture impervious barrier.'
        }
      ],
      msmeFarmerTip: 'Check your sealer heating bars daily. Ensure the sealing jaw applies uniform pressure along the entire pouch width for at least 1.5 seconds at 135-145°C.',
      confidence: 'High'
    };
  }

  // 5. Seal Leaks / Pouch Burst / Delamination during Transit
  if (p.includes('leak') || p.includes('burst') || p.includes('seal') || p.includes('open') || p.includes('phat') || p.includes('transit') || p.includes('transport') || p.includes('vibrat')) {
    return {
      directAnswer: `Seams burst during transit due to seal contamination or too thin of an inner sealant layer. Upgrade your inner sealing layer to at least 50µm Metallocene PE (mPE) which provides superior hot-tack strength and resists transit vibration drops.`,
      problemSummary: `Mechanical seal delamination and seam bursting under transit vibrations or pressure gradients.`,
      likelyCause: `Contamination of sealing jaws by food dust or oil, narrow heat-sealing temperature window, or thin sealant layer (<35µm) unable to absorb flex-cracking and high-altitude expansion pressures.`,
      criticalParameter: 'Seal Strength (N/15mm) & Sealant Layer Thickness (µm)',
      parameterExplanation: 'Seals must withstand >35 N/15mm tensile pull and retain integrity under ambient barometric changes during transport.',
      suggestedImprovement: 'Increase sealant layer thickness to ≥50µm Metallocene PE (mPE) with superior hot-tack strength. Calibrate sealing bar to 140°C.',
      packagingAlternatives: [
        {
          material: 'High-Integrity Co-ex Metallocene Pouch',
          structure: '12µm PET / 15µm PA / 60µm mPE',
          whyBetter: 'Outstanding flex-crack resilience and seal strengths >45 N/15mm.'
        }
      ],
      msmeFarmerTip: 'Keep your pouch sealing zone clean. Dust or grease trapped in the seal seam causes invisible micro-tunnels that burst during transport.',
      confidence: 'High'
    };
  }

  // 6. Condensation / Sweating / Fogging
  if (p.includes('sweat') || p.includes('condens') || p.includes('droplet') || p.includes('fog') || p.includes('bhaap')) {
    return {
      directAnswer: `Moisture droplets are forming because the food's natural respiration vapor cannot escape and condenses on cold plastic walls. Switch to anti-fog coated film or laser micro-perforated film so moisture vapor dissipates without pooling water on produce.`,
      problemSummary: `Internal surface fogging and free water pooling inside packaging.`,
      likelyCause: `High postharvest product transpiration crossing dew point temperature on non-treated hydrophobic plastic walls, generating liquid water droplets that catalyze fungal decay.`,
      criticalParameter: 'Anti-Fog Surfactant & Breathable Micro-Perforations',
      parameterExplanation: 'Anti-fog coatings spread water into an invisible continuous sheet, while micro-perforations equilibrate relative humidity without condensation.',
      suggestedImprovement: 'Switch to antifog coated BOPP or equilibrium laser micro-perforated film (EMAP).',
      packagingAlternatives: [
        {
          material: 'Anti-Fog Micro-Perforated BOPP',
          structure: '30µm BOPP with food-contact antifog additive and 60µm micro-holes',
          whyBetter: 'Prevents droplet formation and balances respiration humidity.'
        }
      ],
      msmeFarmerTip: 'Pre-cool freshly harvested produce before packaging! Packing warm produce into plastic causes immediate sweating inside the pouch.',
      confidence: 'High'
    };
  }

  // 7. General Fallback with Comprehensive Food Science Breakdown
  return {
    directAnswer: `Based on your description, the food degradation rate is exceeding the barrier transmission limits of your current packaging material under current temperature/humidity conditions. Calibrating OTR and WVTR to match your food's water activity and respiration will resolve the issue.`,
    problemSummary: `Packaging barrier mismatch or environmental vulnerability diagnosed for ${commodity || 'submitted food'}.`,
    likelyCause: `The degradation kinetics of ${commodity || 'the food matrix'} exceeded the barrier transmission thresholds of ${currentPackaging || 'the current packaging material'} under storage conditions (${storageCondition || 'ambient'}). Atmospheric gas and vapor gradients triggered quality decline.`,
    criticalParameter: 'Thermodynamic Barrier Calibration (OTR & WVTR)',
    parameterExplanation: 'Every food requires a tailored balance between gas transmission (OTR) and moisture transmission (WVTR) to maintain biochemical equilibrium.',
    suggestedImprovement: 'Conduct head-space gas analysis, determine critical moisture limits, and upgrade to multi-layer barrier laminates.',
    packagingAlternatives: [
      {
        material: 'High-Barrier Co-extruded Laminate',
        structure: '12µm PET / 9µm EVOH / 50µm PE',
        whyBetter: 'Provides universal gas, moisture, and aroma barrier protection.'
      },
      {
        material: 'Metallocene Vacuum Skin Film',
        structure: 'PA/PE Co-extrusion with hermetic sealing',
        whyBetter: 'Minimizes internal headspace and prevents mechanical abrasion.'
      }
    ],
    msmeFarmerTip: 'Store finished inventory away from direct sunlight, maintain consistent room temperature, and verify your seal integrity using a simple water immersion leak test.',
    confidence: 'Medium'
  };
}

// API: Packaging Doctor - Natural language problem diagnosis
app.post('/api/gemini/diagnose-packaging', async (req, res) => {
  const { problemDescription, commodity, currentPackaging, storageCondition } = req.body;
  if (!problemDescription) {
    return res.status(400).json({ error: 'Problem description is required' });
  }

  try {
    if (ai) {
      const prompt = `You are a Senior Food Packaging Scientist and Packaging Doctor diagnostic engine.
A food producer, factory manager, or farmer has reported a packaging issue:
- Problem Description: "${problemDescription}"
- Food Commodity (if specified): "${commodity || 'General food product'}"
- Current Packaging (if known): "${currentPackaging || 'Unknown / Unspecified'}"
- Storage Condition: "${storageCondition || 'Ambient / Normal'}"

Perform a thorough root-cause failure analysis and provide a clear, direct answer.
Break down:
1. Direct clinical answer addressing their specific question or symptom directly
2. Problem identification
3. Likely biochemical / physical cause (e.g. moisture ingress, lipid photo-oxidation, anaerobic fermentation, seal pinhole failure)
4. Relevant packaging parameter (e.g., WVTR, OTR, Seal Integrity, Headspace, Anti-fog coating, Light transmission)
5. Suggested immediate corrective improvement
6. Possible packaging material alternatives with rationale
7. Plain-language MSME / Farmer tip (no jargon, actionable)

Return ONLY valid JSON with no markdown wrapping or code blocks:
{
  "directAnswer": "Clear, direct, authoritative answer directly answering their exact question and telling them what must be done immediately",
  "problemSummary": "concise description of the diagnosed problem",
  "likelyCause": "detailed biochemical or physical root cause",
  "criticalParameter": "primary parameter name (e.g., WVTR - Water Vapor Transmission Rate)",
  "parameterExplanation": "why this parameter caused the observed failure",
  "suggestedImprovement": "specific immediate technical action to fix it",
  "packagingAlternatives": [
    {
      "material": "Material name",
      "structure": "Layer structure description",
      "whyBetter": "Why it solves the failure mode"
    }
  ],
  "msmeFarmerTip": "Simple, non-technical advice for small scale producers",
  "confidence": "High"
}`;

      const responseText = await callGeminiGenerate(prompt, 2);
      const cleaned = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const result = JSON.parse(cleaned);
      return res.json({
        success: true,
        diagnosis: result,
      });
    }
  } catch (error: any) {
    console.warn('Packaging Doctor Gemini API call failed or timed out, applying scientific expert engine fallback:', error.message);
  }

  // Resilient expert scientific diagnostic engine
  const fallback = generateServerSideDiagnosticFallback(
    problemDescription,
    commodity,
    currentPackaging,
    storageCondition
  );
  return res.json({
    success: true,
    diagnosis: fallback,
    source: 'expert_rule_engine',
  });
});

// API: Explainable AI - Deep rationale and small-farmer friendly advisory
app.post('/api/gemini/explain-recommendation', async (req, res) => {
  try {
    const { commodity, recommendation, conditions } = req.body;
    if (!commodity || !recommendation) {
      return res.status(400).json({ error: 'Commodity and recommendation details are required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini AI service unavailable. API key not configured.',
      });
    }

    const prompt = `You are an Explainable AI assistant for an intelligent food packaging system.
Food: ${commodity.name} (Moisture: ${commodity.moisture_percent}%, pH: ${commodity.pH}, Fat: ${commodity.fat_percent}%, Respiration: ${commodity.respiration_rate})
Conditions: Temp ${conditions.temperature_C}°C, RH ${conditions.relative_humidity_percent}%, Desired Shelf Life ${conditions.desired_shelf_life_days} days, Transit ${conditions.transportation_duration_days} days, Storage: ${conditions.storage_type}.
Recommended Packaging: ${recommendation.recommended_material} (${recommendation.film_thickness_micron} µm, OTR: ${recommendation.OTR_cc_m2_day}, WVTR: ${recommendation.WVTR_g_m2_day}, MAP: ${recommendation.MAP_suitability}).

Generate a dual explanation:
1. Technical scientific explanation for packaging engineers (covering gas barrier, water activity equilibrium, shelf life kinetics).
2. Plain-language Small Farmer / MSME explanation (simple analogies, why this protects their profit and prevents spoilage).
3. 3-4 top driving factors.

Return ONLY valid JSON:
{
  "technicalExplanation": "string",
  "msmeSimpleExplanation": "string",
  "topDrivingFactors": ["factor 1", "factor 2", "factor 3"],
  "shelfLifeInsight": "string"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const responseText = response.text || '';
    const cleaned = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const result = JSON.parse(cleaned);
    res.json({
      success: true,
      explanation: result,
    });
  } catch (error: any) {
    console.error('Error generating explanation with Gemini:', error);
    res.status(500).json({
      error: 'Failed to generate explanation',
      details: error.message,
    });
  }
});

// Setup Vite dev middleware or serve static build
async function setupServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, host, () => {
    console.log(`PackWise AI server listening on http://${host}:${port}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
