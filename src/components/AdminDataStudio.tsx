import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Database,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Cpu,
  GitMerge,
  Info,
  Check,
  PlusCircle,
  X,
  TrendingUp,
  Activity,
  Sliders,
  Edit3,
  PackageCheck,
  Filter,
  Search,
  SlidersHorizontal,
  History,
  Clock,
  UserCheck,
  FileText,
  User,
  Bot,
  Calendar,
  RotateCcw,
  ArrowUpDown,
  CalendarRange,
  BarChart3,
  Inbox,
  UserPlus,
  CheckCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Commodity,
  FoodCategory,
  StorageType,
  RespirationRate,
  PackagingMaterial,
  MAPSuitability,
  PendingTrainingCandidate,
} from '../types/packaging';
import {
  getStoredCandidates,
  saveStoredCandidates,
} from '../services/trainingCandidatesService';
import {
  COMMODITIES_DATABASE,
  registerBatchCommodities,
  getStoredCustomCommodities,
  getCommodityIcon,
} from '../data/commodities';
import { formatCompactNumber } from './DashboardView';
import {
  getAllModels,
  getActiveModelId,
  setActiveModelId,
  getModelById,
  saveCustomModel,
  deleteCustomModel,
  RegisteredModel,
  BASE_REGISTERED_MODELS,
} from '../data/models_registry';
import {
  PACKAGING_MATERIALS,
  getStoredMaterials,
  savePackagingMaterial,
  updatePackagingMaterial,
  deletePackagingMaterial,
  resetPackagingMaterials,
} from '../data/materials';

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

interface AdminDataStudioProps {
  totalTrainingRows: number;
  setTotalTrainingRows: React.Dispatch<React.SetStateAction<number>>;
  onCommoditiesUpdated?: () => void;
  userRole: 'user' | 'admin';
  setUserRole: (role: 'user' | 'admin') => void;
}

interface ParsedRow {
  name: string;
  category: string;
  moisture_percent: number;
  pH: number;
  fat_percent: number;
  respiration_rate: string;
  respiration_mg_CO2_kg_hr: number;
  recommended_storage_temp_C: number;
  recommended_RH_percent: number;
  storage_type: string;
  typical_shelf_life_days: number;
  primary_spoilage_factors: string[];
  synthetic_samples_multiplier?: number;
  isExisting?: boolean;
}

// Sample exotic Indian food commodities pack for 1-click test
const SAMPLE_AGRI_DATASET: ParsedRow[] = [
  {
    name: 'Ragi (Finger Millet)',
    category: 'Grains',
    moisture_percent: 11.5,
    pH: 6.4,
    fat_percent: 1.5,
    respiration_rate: 'None',
    respiration_mg_CO2_kg_hr: 0,
    recommended_storage_temp_C: 22,
    recommended_RH_percent: 60,
    storage_type: 'Dry Storage',
    typical_shelf_life_days: 365,
    primary_spoilage_factors: ['Moisture ingress', 'Weevil infestation'],
    synthetic_samples_multiplier: 350,
  },
  {
    name: 'Kashmiri Saffron (Kesar)',
    category: 'Condiments',
    moisture_percent: 8.0,
    pH: 5.9,
    fat_percent: 5.8,
    respiration_rate: 'None',
    respiration_mg_CO2_kg_hr: 0,
    recommended_storage_temp_C: 18,
    recommended_RH_percent: 50,
    storage_type: 'Dry Storage',
    typical_shelf_life_days: 540,
    primary_spoilage_factors: ['Light degradation (Crocin loss)', 'Aroma dissipation'],
    synthetic_samples_multiplier: 250,
  },
  {
    name: 'Darjeeling First Flush Green Tea',
    category: 'Beverages',
    moisture_percent: 6.2,
    pH: 5.5,
    fat_percent: 2.1,
    respiration_rate: 'None',
    respiration_mg_CO2_kg_hr: 0,
    recommended_storage_temp_C: 20,
    recommended_RH_percent: 55,
    storage_type: 'Dry Storage',
    typical_shelf_life_days: 270,
    primary_spoilage_factors: ['Moisture absorption', 'Volatile terpene loss'],
    synthetic_samples_multiplier: 300,
  },
  {
    name: 'Nagpur Organic Oranges',
    category: 'Fresh fruits',
    moisture_percent: 87.2,
    pH: 3.7,
    fat_percent: 0.2,
    respiration_rate: 'Medium',
    respiration_mg_CO2_kg_hr: 28,
    recommended_storage_temp_C: 6,
    recommended_RH_percent: 88,
    storage_type: 'Cold Chain',
    typical_shelf_life_days: 28,
    primary_spoilage_factors: ['Penicillium green mold', 'Moisture shrinkage'],
    synthetic_samples_multiplier: 400,
  },
  {
    name: 'A2 Gir Cow Desi Ghee',
    category: 'Dairy',
    moisture_percent: 0.3,
    pH: 6.2,
    fat_percent: 99.5,
    respiration_rate: 'None',
    respiration_mg_CO2_kg_hr: 0,
    recommended_storage_temp_C: 24,
    recommended_RH_percent: 55,
    storage_type: 'Ambient',
    typical_shelf_life_days: 360,
    primary_spoilage_factors: ['Photo-oxidation', 'Lipid rancidity'],
    synthetic_samples_multiplier: 350,
  },
  {
    name: 'Almonds',
    category: 'Nuts',
    moisture_percent: 4.8,
    pH: 5.85,
    fat_percent: 34.0,
    respiration_rate: 'Low',
    respiration_mg_CO2_kg_hr: 10,
    recommended_storage_temp_C: 4,
    recommended_RH_percent: 65,
    storage_type: 'Chilled',
    typical_shelf_life_days: 280,
    primary_spoilage_factors: ['Lipid rancidity', 'Moisture ingress', 'Aflatoxin risk'],
    synthetic_samples_multiplier: 300,
  },
];

export const AdminDataStudio: React.FC<AdminDataStudioProps> = ({
  totalTrainingRows,
  setTotalTrainingRows,
  onCommoditiesUpdated,
  userRole,
  setUserRole,
}) => {
  // Admin Authentication State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('packwise_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [passkeyInput, setPasskeyInput] = useState<string>('');
  const [passkeyError, setPasskeyError] = useState<string>('');

  // Active Model Selection & Dynamic Evaluation List
  const [activeModel, setActiveModel] = useState<string>(getActiveModelId());
  const [modelsList, setModelsList] = useState<RegisteredModel[]>(() =>
    getAllModels(totalTrainingRows)
  );
  const [isReevaluating, setIsReevaluating] = useState<boolean>(false);

  // Custom Model Creator Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newModelName, setNewModelName] = useState<string>('');
  const [newModelCode, setNewModelCode] = useState<string>('');
  const [newModelArch, setNewModelArch] = useState<string>(
    'Physics-Informed Deep Neural Forest'
  );
  const [newModelFocus, setNewModelFocus] = useState<RegisteredModel['focus']>(
    'Custom Pipeline'
  );
  const [newModelMaterial, setNewModelMaterial] = useState<string>('evoh_multilayer');
  const [newModelDesc, setNewModelDesc] = useState<string>('');
  const [newModelBestFor, setNewModelBestFor] = useState<string>('');
  const [newModelBaseF1, setNewModelBaseF1] = useState<number>(25.0);
  const [newModelBaseAcc, setNewModelBaseAcc] = useState<number>(82.0);

  // Packaging Materials Management State
  const [materialsList, setMaterialsList] = useState<PackagingMaterial[]>(() => getStoredMaterials());
  const [materialSearchQuery, setMaterialSearchQuery] = useState<string>('');
  const [materialCategoryFilter, setMaterialCategoryFilter] = useState<string>('All');
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState<boolean>(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);

  // Material Form Fields
  const [matName, setMatName] = useState<string>('');
  const [matCode, setMatCode] = useState<string>('');
  const [matCategory, setMatCategory] = useState<PackagingMaterial['category']>('Polyolefin');
  const [matStructure, setMatStructure] = useState<string>('');
  const [matOTR, setMatOTR] = useState<number>(50);
  const [matWVTR, setMatWVTR] = useState<number>(4.0);
  const [matThickness, setMatThickness] = useState<number>(60);
  const [matSealability, setMatSealability] = useState<PackagingMaterial['sealability']>('Good');
  const [matSealTemp, setMatSealTemp] = useState<number>(125);
  const [matMAPSuitability, setMatMAPSuitability] = useState<MAPSuitability>('Recommended');
  const [matCostPer1k, setMatCostPer1k] = useState<number>(22.0);
  const [matCostIndex, setMatCostIndex] = useState<number>(3);
  const [matCarbonIndex, setMatCarbonIndex] = useState<number>(2.1);
  const [matRecyclability, setMatRecyclability] = useState<PackagingMaterial['recyclability']>('Widely Recyclable');
  const [matIsBiodegradable, setMatIsBiodegradable] = useState<boolean>(false);
  const [matAdvantages, setMatAdvantages] = useState<string>('');
  const [matLimitations, setMatLimitations] = useState<string>('');
  const [matApplications, setMatApplications] = useState<string>('');

  // Data Staging & Merge State
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [mergePolicy, setMergePolicy] = useState<'merge_and_enrich' | 'append_only'>(
    'merge_and_enrich'
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Activity Log State
  const [activityLogs, setActivityLogs] = useState<AdminActivityRecord[]>(() => {
    try {
      const raw = localStorage.getItem('packwise_admin_activity_log');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
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
  });
  const [activityFilter, setActivityFilter] = useState<'all' | 'material' | 'dataset' | 'model' | 'system'>('all');
  const [activityActionFilter, setActivityActionFilter] = useState<string>('all');
  const [activityActorFilter, setActivityActorFilter] = useState<string>('all');
  const [activityDatePreset, setActivityDatePreset] = useState<'all' | 'today' | '24h' | '7d' | '30d' | 'custom'>('all');
  const [activityStartDate, setActivityStartDate] = useState<string>('');
  const [activityEndDate, setActivityEndDate] = useState<string>('');
  const [activitySortOrder, setActivitySortOrder] = useState<'desc' | 'asc'>('desc');
  const [activitySearch, setActivitySearch] = useState<string>('');

  const handleResetActivityFilters = () => {
    setActivityFilter('all');
    setActivityActionFilter('all');
    setActivityActorFilter('all');
    setActivityDatePreset('all');
    setActivityStartDate('');
    setActivityEndDate('');
    setActivitySortOrder('desc');
    setActivitySearch('');
  };

  const isAnyActivityFilterActive =
    activityFilter !== 'all' ||
    activityActionFilter !== 'all' ||
    activityActorFilter !== 'all' ||
    activityDatePreset !== 'all' ||
    activityStartDate !== '' ||
    activityEndDate !== '' ||
    activitySortOrder !== 'desc' ||
    activitySearch.trim() !== '';

  const customCommodities = getStoredCustomCommodities();
  const currentModelMeta = getModelById(activeModel, totalTrainingRows);

  // Helper to record activity both locally and to server
  const logActivity = (record: Omit<AdminActivityRecord, 'id' | 'timestamp'>) => {
    const entry: AdminActivityRecord = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...record,
    };
    setActivityLogs((prev) => {
      const updated = [entry, ...prev.slice(0, 99)];
      try {
        localStorage.setItem('packwise_admin_activity_log', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    fetch('/api/admin/activity-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(() => {});
  };

  // Sync active model, custom materials, and activity log with backend on mount
  useEffect(() => {
    fetch('/api/admin/active-model')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.activeModelId) {
          setActiveModel(data.activeModelId);
          setActiveModelId(data.activeModelId);
        }
      })
      .catch(() => {});

    fetch('/api/admin/materials')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.materials && Array.isArray(data.materials) && data.materials.length > 0) {
          data.materials.forEach((m: PackagingMaterial) => savePackagingMaterial(m));
          setMaterialsList(getStoredMaterials());
        }
      })
      .catch(() => {});

    fetch('/api/admin/activity-log')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.logs && Array.isArray(data.logs) && data.logs.length > 0) {
          setActivityLogs(data.logs);
          try {
            localStorage.setItem('packwise_admin_activity_log', JSON.stringify(data.logs));
          } catch {}
        }
      })
      .catch(() => {});

    // Sync pending training candidates from backend
    fetch('/api/admin/pending-candidates')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
          setCandidatesList(data.candidates);
          saveStoredCandidates(data.candidates);
        }
      })
      .catch(() => {});
  }, []);

  // Pending Training Candidates (Human-in-the-Loop Review Queue) State
  const [candidatesList, setCandidatesList] = useState<PendingTrainingCandidate[]>(() =>
    getStoredCandidates()
  );
  const [candidateFilter, setCandidateFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [candidateSearch, setCandidateSearch] = useState<string>('');
  const [processingCandidateId, setProcessingCandidateId] = useState<string | null>(null);
  const [isBulkApproving, setIsBulkApproving] = useState<boolean>(false);

  // Candidate Approval Handler
  const handleApproveCandidate = async (cand: PendingTrainingCandidate) => {
    setProcessingCandidateId(cand.id);
    const rowsToAdd = cand.syntheticRowsYield || 200;

    try {
      await fetch('/api/admin/approve-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: cand.id }),
      });
    } catch (e) {
      console.warn('Backend candidate approve failed, updating local state:', e);
    }

    const updatedList = candidatesList.map((c) =>
      c.id === cand.id
        ? {
            ...c,
            status: 'approved' as const,
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'Admin',
          }
        : c
    );
    setCandidatesList(updatedList);
    saveStoredCandidates(updatedList);

    const newTotal = totalTrainingRows + rowsToAdd;
    setTotalTrainingRows(newTotal);

    logActivity({
      category: 'dataset',
      action: 'import',
      title: `Candidate Approved: ${cand.commodityName}`,
      description: `Admin approved user-generated candidate "${cand.commodityName}" (${cand.category}). Committed +${rowsToAdd.toLocaleString()} synthetic rows to master training dataset.`,
      actor: 'Admin',
      metadata: {
        candidateId: cand.id,
        commodityName: cand.commodityName,
        rowsAdded: rowsToAdd,
        totalRows: newTotal,
      },
    });

    setNotification({
      type: 'success',
      message: `🎉 Candidate "${cand.commodityName}" approved! +${rowsToAdd} training rows committed to master dataset. Total: ${newTotal.toLocaleString()} rows.`,
    });

    if (onCommoditiesUpdated) onCommoditiesUpdated();
    setProcessingCandidateId(null);
  };

  // Candidate Rejection Handler
  const handleRejectCandidate = async (cand: PendingTrainingCandidate) => {
    const reason = window.prompt(
      `Reject training candidate "${cand.commodityName}"? Provide an optional reason for the audit log:`,
      'Outside post-harvest quality envelope'
    );
    if (reason === null) return; // cancelled

    setProcessingCandidateId(cand.id);
    try {
      await fetch('/api/admin/reject-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: cand.id, reason }),
      });
    } catch (e) {
      console.warn('Backend candidate reject error:', e);
    }

    const updatedList = candidatesList.map((c) =>
      c.id === cand.id
        ? {
            ...c,
            status: 'rejected' as const,
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'Admin',
            rejectionReason: reason || 'Declined during expert review',
          }
        : c
    );
    setCandidatesList(updatedList);
    saveStoredCandidates(updatedList);

    logActivity({
      category: 'dataset',
      action: 'update',
      title: `Candidate Rejected: ${cand.commodityName}`,
      description: `Admin reviewed and rejected candidate "${cand.commodityName}". Reason: ${reason || 'Outside target quality boundary'}`,
      actor: 'Admin',
      metadata: { candidateId: cand.id, commodityName: cand.commodityName },
    });

    setNotification({
      type: 'info',
      message: `Candidate "${cand.commodityName}" rejected and archived. No training rows added.`,
    });
    setProcessingCandidateId(null);
  };

  // Batch Approve All Pending Candidates
  const handleApproveAllPendingCandidates = async () => {
    const pendingItems = candidatesList.filter((c) => c.status === 'pending');
    if (pendingItems.length === 0) return;

    if (!window.confirm(`Approve and commit all ${pendingItems.length} pending candidate rows to the master dataset?`)) {
      return;
    }

    setIsBulkApproving(true);
    let totalAdded = 0;
    pendingItems.forEach((c) => {
      totalAdded += c.syntheticRowsYield || 200;
    });

    try {
      await fetch('/api/admin/approve-all-candidates', { method: 'POST' });
    } catch (e) {
      console.warn('Backend bulk approve error:', e);
    }

    const nowStr = new Date().toISOString();
    const updatedList = candidatesList.map((c) =>
      c.status === 'pending'
        ? {
            ...c,
            status: 'approved' as const,
            reviewedAt: nowStr,
            reviewedBy: 'Admin',
          }
        : c
    );
    setCandidatesList(updatedList);
    saveStoredCandidates(updatedList);

    const newTotal = totalTrainingRows + totalAdded;
    setTotalTrainingRows(newTotal);

    logActivity({
      category: 'dataset',
      action: 'import',
      title: `Batch Approved ${pendingItems.length} Candidates`,
      description: `Admin committed all ${pendingItems.length} pending candidate rows. Expanded master dataset by +${totalAdded.toLocaleString()} training rows.`,
      actor: 'Admin',
      metadata: {
        candidatesApproved: pendingItems.length,
        rowsAdded: totalAdded,
        totalRows: newTotal,
      },
    });

    setNotification({
      type: 'success',
      message: `🎉 All ${pendingItems.length} candidates approved! Added +${totalAdded.toLocaleString()} synthetic rows to master dataset.`,
    });

    if (onCommoditiesUpdated) onCommoditiesUpdated();
    setIsBulkApproving(false);
  };

  // Simulate a New User Query Candidate for Instant Testing
  const handleSimulateUserCandidate = () => {
    const sampleFoods = [
      { name: 'Cold-Pressed Passion Fruit Pulp', category: 'Beverages' as const, moisture: 86.5, pH: 3.2, fat: 0.5, temp: 4, rh: 85, storage: 'Cold Chain' as const, material: 'evoh_multilayer', matName: 'EVOH Multilayer Barrier Film', shelf: 45, rows: 250 },
      { name: 'Spiced Jackfruit Jerky (Kathal)', category: 'Snacks' as const, moisture: 14.0, pH: 5.4, fat: 1.2, temp: 24, rh: 55, storage: 'Ambient' as const, material: 'aluminum_foil_laminate', matName: 'Aluminum Foil Multi-Layer Laminate', shelf: 180, rows: 200 },
      { name: 'Fresh Camel Milk Paneer', category: 'Dairy' as const, moisture: 58.0, pH: 6.2, fat: 19.5, temp: 3, rh: 90, storage: 'Cold Chain' as const, material: 'pa_pe_vacuum', matName: 'PA/PE Vacuum Skin Film', shelf: 21, rows: 220 },
      { name: 'Dehydrated Himalayan Morel Mushrooms', category: 'Fresh vegetables' as const, moisture: 8.5, pH: 6.0, fat: 2.1, temp: 18, rh: 50, storage: 'Dry Storage' as const, material: 'pet_pe', matName: 'PET/PE Barrier Laminate', shelf: 365, rows: 200 },
    ];

    const pick = sampleFoods[Math.floor(Math.random() * sampleFoods.length)];
    const newCand: PendingTrainingCandidate = {
      id: `cand_sim_${Date.now()}`,
      timestamp: new Date().toISOString(),
      commodityName: pick.name,
      category: pick.category,
      moisture_percent: pick.moisture,
      pH: pick.pH,
      fat_percent: pick.fat,
      respiration_rate: pick.moisture > 50 ? 'Low' : 'None',
      respiration_mg_CO2_kg_hr: pick.moisture > 50 ? 8 : 0,
      storage_temperature_C: pick.temp,
      relative_humidity_percent: pick.rh,
      storage_type: pick.storage,
      desired_shelf_life_days: pick.shelf,
      recommendedMaterialId: pick.material,
      recommendedMaterialName: pick.matName,
      predictedShelfLifeDays: pick.shelf + 15,
      confidenceScore: 91,
      status: 'pending',
      syntheticRowsYield: pick.rows,
      source: 'user_recommendation',
    };

    const updated = [newCand, ...candidatesList];
    setCandidatesList(updated);
    saveStoredCandidates(updated);

    fetch('/api/recommendations/log-candidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCand),
    }).catch(() => {});

    setNotification({
      type: 'info',
      message: `✨ Simulated user query "${newCand.commodityName}" logged as candidate. Awaiting admin review!`,
    });
  };

  // Re-benchmark models whenever totalTrainingRows increases/changes
  useEffect(() => {
    setModelsList(getAllModels(totalTrainingRows));
  }, [totalTrainingRows]);

  // Handle Admin Authorization
  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passkeyInput.trim();
    if (cleanPass === 'admin2026' || cleanPass === 'packwise_admin' || cleanPass === 'admin') {
      setIsUnlocked(true);
      setUserRole('admin');
      setPasskeyError('');
      try {
        sessionStorage.setItem('packwise_admin_authenticated', 'true');
      } catch {}
      logActivity({
        category: 'system',
        action: 'update',
        title: 'Admin Session Unlocked',
        description: 'Administrator verified passkey and opened engineering studio controls.',
        actor: 'Admin',
      });
    } else {
      setPasskeyError('Invalid Authorization Passkey. Please verify your admin credentials.');
    }
  };

  const handleLockAdmin = () => {
    setIsUnlocked(false);
    setUserRole('user');
    setPasskeyInput('');
    try {
      sessionStorage.removeItem('packwise_admin_authenticated');
    } catch {}
  };

  // Handle Model Selection / Hot-Swap
  const handleSelectModel = async (model: RegisteredModel) => {
    setActiveModel(model.id);
    setActiveModelId(model.id);

    try {
      await fetch('/api/admin/active-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: model.id }),
      });
    } catch (e) {
      console.warn('Backend model save error (using local state)', e);
    }

    logActivity({
      category: 'model',
      action: 'update',
      title: `Model Deployed: ${model.name}`,
      description: `Inference pipeline hot-swapped to "${model.code}" (${model.architecture}). F1 Score: ${model.f1Score}.`,
      actor: 'Admin',
      metadata: { modelId: model.id, modelCode: model.code },
    });

    setNotification({
      type: 'success',
      message: `🎯 Active ML Model updated to "${model.name}". All new recommendations and simulations will now run through this calibrated pipeline!`,
    });
  };

  // Trigger Live Re-evaluation of all models against augmented dataset
  const handleRebenchmarkAll = () => {
    setIsReevaluating(true);
    setTimeout(() => {
      const updated = getAllModels(totalTrainingRows);
      setModelsList(updated);
      setIsReevaluating(false);

      logActivity({
        category: 'model',
        action: 'update',
        title: 'All Models Re-benchmarked',
        description: `Executed evaluation matrix across ${totalTrainingRows.toLocaleString()} rows dataset for ${updated.length} ML models.`,
        actor: 'Admin',
        metadata: { totalRows: totalTrainingRows, modelsEvaluated: updated.length },
      });

      setNotification({
        type: 'success',
        message: `⚡ Successfully re-evaluated all ${updated.length} ML models against the current ${totalTrainingRows.toLocaleString()} rows dataset! Performance metrics recalculated.`,
      });
    }, 700);
  };

  // Register New Custom Model Methodology
  const handleCreateCustomModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName.trim()) return;

    const customId = `custom_model_${Date.now()}`;
    const customModel: RegisteredModel = {
      id: customId,
      name: newModelName.trim(),
      code: (newModelCode.trim() || 'CUSTOM-ML-V1').toUpperCase(),
      architecture: newModelArch.trim() || 'Custom Multi-Layer Neural Pipeline',
      version: '1.0.0-custom',
      baseF1Score: Number(newModelBaseF1) || 25.0,
      baseAccuracy: Number(newModelBaseAcc) || 82.0,
      baseLoss: 0.28,
      datasetTrained: `${totalTrainingRows.toLocaleString()} rows + Custom pipeline specification`,
      focus: newModelFocus,
      description:
        newModelDesc.trim() ||
        'Custom packaging methodology registered by administrator for specialized product formulations.',
      bestSuitedFor:
        newModelBestFor.trim() ||
        'Specialized packaging operations and custom industrial barrier criteria.',
      tagColor: 'bg-purple-100 text-purple-800 border-purple-300',
      isCustom: true,
      preferredMaterialId: newModelMaterial,
      createdAt: new Date().toISOString(),
    };

    saveCustomModel(customModel);

    try {
      await fetch('/api/admin/custom-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customModel),
      });
    } catch {}

    const updated = getAllModels(totalTrainingRows);
    setModelsList(updated);
    setIsAddModalOpen(false);

    await handleSelectModel(customModel);

    logActivity({
      category: 'model',
      action: 'create',
      title: `Custom Model Registered: ${customModel.name}`,
      description: `Defined new architecture (${customModel.architecture}) focused on ${customModel.focus}.`,
      actor: 'Admin',
      metadata: { modelId: customModel.id, modelCode: customModel.code },
    });

    setNotification({
      type: 'success',
      message: `✨ Custom Packaging Methodology "${customModel.name}" successfully created and activated across PackWise!`,
    });

    setNewModelName('');
    setNewModelCode('');
    setNewModelDesc('');
    setNewModelBestFor('');
  };

  // Delete Custom Model
  const handleDeleteCustomModel = async (modelId: string, modelName: string) => {
    if (!window.confirm(`Delete custom model "${modelName}" from registry?`)) return;
    deleteCustomModel(modelId);

    try {
      await fetch(`/api/admin/custom-models/${modelId}`, { method: 'DELETE' });
    } catch {}

    if (activeModel === modelId) {
      handleSelectModel(BASE_REGISTERED_MODELS[0]);
    }

    setModelsList(getAllModels(totalTrainingRows));

    logActivity({
      category: 'model',
      action: 'delete',
      title: `Custom Model Removed: ${modelName}`,
      description: `Deleted custom architecture "${modelName}" from active registry.`,
      actor: 'Admin',
      metadata: { modelId, modelName },
    });

    setNotification({
      type: 'info',
      message: `Custom model "${modelName}" removed from registry.`,
    });
  };

  // === Packaging Material Management Handlers ===
  const handleOpenAddMaterial = () => {
    setEditingMaterialId(null);
    setMatName('');
    setMatCode('');
    setMatCategory('Polyolefin');
    setMatStructure('MDO-PE / Barrier EVOH / PE Sealant');
    setMatOTR(25);
    setMatWVTR(3.5);
    setMatThickness(65);
    setMatSealability('Good');
    setMatSealTemp(125);
    setMatMAPSuitability('Recommended');
    setMatCostPer1k(22.0);
    setMatCostIndex(3);
    setMatCarbonIndex(2.0);
    setMatRecyclability('Widely Recyclable');
    setMatIsBiodegradable(false);
    setMatAdvantages('High barrier properties, balanced cost-efficiency');
    setMatLimitations('Requires specialized processing equipment');
    setMatApplications('Fresh produce, dairy, bakery, snacks');
    setIsMaterialModalOpen(true);
  };

  const handleOpenEditMaterial = (mat: PackagingMaterial) => {
    setEditingMaterialId(mat.id);
    setMatName(mat.name);
    setMatCode(mat.code);
    setMatCategory(mat.category);
    setMatStructure(mat.structure_layers);
    setMatOTR(mat.OTR_cc_m2_day);
    setMatWVTR(mat.WVTR_g_m2_day);
    setMatThickness(mat.film_thickness_micron);
    setMatSealability(mat.sealability);
    setMatSealTemp(mat.seal_temperature_C);
    setMatMAPSuitability(mat.MAP_suitability);
    setMatCostPer1k(mat.cost_estimate_per_1k_packs_usd);
    setMatCostIndex(mat.cost_index_relative);
    setMatCarbonIndex(mat.carbon_index_kgCO2_per_kg);
    setMatRecyclability(mat.recyclability);
    setMatIsBiodegradable(mat.is_biodegradable);
    setMatAdvantages(Array.isArray(mat.advantages) ? mat.advantages.join(', ') : '');
    setMatLimitations(Array.isArray(mat.limitations) ? mat.limitations.join(', ') : '');
    setMatApplications(Array.isArray(mat.typical_applications) ? mat.typical_applications.join(', ') : '');
    setIsMaterialModalOpen(true);
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matName.trim()) return;

    const id = editingMaterialId || `mat_${matName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    const material: PackagingMaterial = {
      id,
      name: matName.trim(),
      code: (matCode.trim() || id.toUpperCase()).toUpperCase(),
      category: matCategory,
      structure_layers: matStructure.trim() || 'Custom Monolayer / Laminate',
      OTR_cc_m2_day: Number(matOTR),
      OTR_range: [Math.max(0.5, matOTR * 0.7), matOTR * 1.3],
      WVTR_g_m2_day: Number(matWVTR),
      WVTR_range: [Math.max(0.1, matWVTR * 0.7), matWVTR * 1.3],
      film_thickness_micron: Number(matThickness),
      thickness_range: [Math.max(10, matThickness * 0.7), matThickness * 1.4],
      sealability: matSealability,
      seal_temperature_C: Number(matSealTemp),
      mechanical_strength_MPa: 35,
      seal_strength_N_per_15mm: 25,
      MAP_suitability: matMAPSuitability,
      cost_index_relative: Number(matCostIndex),
      cost_estimate_per_1k_packs_usd: Number(matCostPer1k),
      carbon_index_kgCO2_per_kg: Number(matCarbonIndex),
      recyclability: matRecyclability,
      is_biodegradable: matIsBiodegradable,
      advantages: matAdvantages ? matAdvantages.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean) : ['High performance barrier'],
      limitations: matLimitations ? matLimitations.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean) : ['Standard barrier boundaries'],
      typical_applications: matApplications ? matApplications.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean) : ['General packaging'],
    };

    if (editingMaterialId) {
      updatePackagingMaterial(material);
      try {
        await fetch(`/api/admin/materials/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(material),
        });
      } catch {}

      logActivity({
        category: 'material',
        action: 'update',
        title: `Material Specs Updated: ${material.name}`,
        description: `Updated barrier kinetics: OTR ${material.OTR_cc_m2_day} cc/m²/day, WVTR ${material.WVTR_g_m2_day} g/m²/day, Gauge ${material.film_thickness_micron}µm, Cost $${material.cost_estimate_per_1k_packs_usd}/1k.`,
        actor: 'Admin',
        metadata: { materialId: material.id, materialName: material.name },
      });

      setNotification({
        type: 'success',
        message: `Packaging Material "${material.name}" updated successfully!`,
      });
    } else {
      savePackagingMaterial(material);
      try {
        await fetch('/api/admin/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(material),
        });
      } catch {}

      logActivity({
        category: 'material',
        action: 'create',
        title: `Material Registered: ${material.name}`,
        description: `Added "${material.name}" (${material.category}) with OTR: ${material.OTR_cc_m2_day}, WVTR: ${material.WVTR_g_m2_day}, Gauge: ${material.film_thickness_micron}µm.`,
        actor: 'Admin',
        metadata: { materialId: material.id, materialName: material.name },
      });

      setNotification({
        type: 'success',
        message: `New Packaging Material "${material.name}" registered and added to database!`,
      });
    }

    setMaterialsList(getStoredMaterials());
    setIsMaterialModalOpen(false);
  };

  const handleDeleteMaterial = async (mat: PackagingMaterial) => {
    if (!window.confirm(`Delete packaging material "${mat.name}"? This will remove it from the recommendation catalog.`)) {
      return;
    }
    deletePackagingMaterial(mat.id);
    try {
      await fetch(`/api/admin/materials/${mat.id}`, { method: 'DELETE' });
    } catch {}

    logActivity({
      category: 'material',
      action: 'delete',
      title: `Material Removed: ${mat.name}`,
      description: `Removed packaging material "${mat.name}" (${mat.code}) from active recommendation catalogue.`,
      actor: 'Admin',
      metadata: { materialId: mat.id, materialName: mat.name },
    });

    setMaterialsList(getStoredMaterials());
    setNotification({
      type: 'info',
      message: `Packaging material "${mat.name}" removed from catalog.`,
    });
  };

  const handleResetMaterials = async () => {
    if (!window.confirm('Reset all packaging materials to the 13 factory-certified baseline materials?')) {
      return;
    }
    resetPackagingMaterials();
    try {
      await fetch('/api/admin/materials/reset', { method: 'POST' });
    } catch {}

    logActivity({
      category: 'material',
      action: 'reset',
      title: 'Materials Reset to Factory Baseline',
      description: 'Restored packaging materials database back to 13 certified standard baseline polymers.',
      actor: 'Admin',
    });

    setMaterialsList(getStoredMaterials());
    setNotification({
      type: 'info',
      message: 'Packaging materials reset to certified baseline (13 materials).',
    });
  };

  // Filter materials based on search query and category
  const filteredMaterials = materialsList.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(materialSearchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(materialSearchQuery.toLowerCase()) ||
      m.structure_layers.toLowerCase().includes(materialSearchQuery.toLowerCase());
    const matchesCategory =
      materialCategoryFilter === 'All' || m.category === materialCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const materialCategories = ['All', ...Array.from(new Set(materialsList.map((m) => m.category)))];

  // Excel / CSV File Parsing using SheetJS (XLSX)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setNotification(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!rawJson || rawJson.length === 0) {
          setNotification({
            type: 'error',
            message: 'Uploaded file is empty or has no recognizable data rows.',
          });
          setIsProcessing(false);
          return;
        }

        const mapped: ParsedRow[] = rawJson.map((row: any) => {
          const name = String(
            row['Commodity Name'] ||
              row['commodity_name'] ||
              row['Name'] ||
              row['name'] ||
              row['Commodity'] ||
              row['commodity'] ||
              'Unnamed Food'
          ).trim();

          const category = String(
            row['Category'] || row['category'] || 'Processed foods'
          ).trim();

          const moisture = Number(
            row['Moisture (%)'] ||
              row['moisture_percent'] ||
              row['Moisture'] ||
              row['moisture'] ||
              30
          );

          const ph = Number(
            row['pH'] || row['ph'] || row['PH'] || 5.8
          );

          const fat = Number(
            row['Fat (%)'] || row['fat_percent'] || row['Fat'] || row['fat'] || 5
          );

          const respirationRate = String(
            row['Respiration Rate'] ||
              row['respiration_rate'] ||
              row['Respiration'] ||
              (moisture > 70 ? 'Medium' : 'None')
          ).trim();

          const respirationMg = Number(
            row['Respiration (mg CO2/kg/hr)'] ||
              row['respiration_mg_CO2_kg_hr'] ||
              row['CO2'] ||
              0
          );

          const temp = Number(
            row['Storage Temp (°C)'] ||
              row['recommended_storage_temp_C'] ||
              row['Temp'] ||
              20
          );

          const rh = Number(
            row['RH (%)'] ||
              row['recommended_RH_percent'] ||
              row['RH'] ||
              65
          );

          const storageType = String(
            row['Storage Type'] ||
              row['storage_type'] ||
              (temp <= 4 ? 'Cold Chain' : temp <= 12 ? 'Chilled' : 'Ambient')
          ).trim();

          const shelfLife = Number(
            row['Shelf Life (Days)'] ||
              row['typical_shelf_life_days'] ||
              row['Shelf Life'] ||
              30
          );

          const spoilageRaw =
            row['Spoilage Factors'] ||
            row['primary_spoilage_factors'] ||
            'Moisture loss, Microbial growth';

          const primary_spoilage_factors = Array.isArray(spoilageRaw)
            ? spoilageRaw
            : String(spoilageRaw)
                .split(/[,;|]/)
                .map((s) => s.trim())
                .filter(Boolean);

          const isExisting = COMMODITIES_DATABASE.some(
            (c) => c.name.toLowerCase() === name.toLowerCase()
          );

          return {
            name,
            category,
            moisture_percent: moisture,
            pH: ph,
            fat_percent: fat,
            respiration_rate: respirationRate,
            respiration_mg_CO2_kg_hr: respirationMg,
            recommended_storage_temp_C: temp,
            recommended_RH_percent: rh,
            storage_type: storageType,
            typical_shelf_life_days: shelfLife,
            primary_spoilage_factors,
            synthetic_samples_multiplier: Number(row['Synthetic Samples']) || 250,
            isExisting,
          };
        });

        const newCount = mapped.filter((m) => !m.isExisting).length;
        const mergeCount = mapped.filter((m) => m.isExisting).length;

        setParsedRows(mapped);
        setNotification({
          type: 'info',
          message: `Staged ${mapped.length} rows from "${file.name}" (${newCount} new commodities to add, ${mergeCount} existing profiles to merge & enrich).`,
        });
      } catch (err: any) {
        console.error('File parsing error', err);
        setNotification({
          type: 'error',
          message: `Failed to parse file: ${err.message || 'Check Excel/CSV format'}`,
        });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Quick 1-click test load
  const handleLoadSamplePack = () => {
    setFileName('sample_indian_agri_pack.xlsx');
    const mapped = SAMPLE_AGRI_DATASET.map((r) => ({
      ...r,
      isExisting: COMMODITIES_DATABASE.some(
        (c) => c.name.toLowerCase() === r.name.toLowerCase()
      ),
    }));
    setParsedRows(mapped);
    const newCount = mapped.filter((m) => !m.isExisting).length;
    const mergeCount = mapped.filter((m) => m.isExisting).length;

    setNotification({
      type: 'info',
      message: `Loaded sample dataset (${newCount} brand new + ${mergeCount} profile to merge into existing). Ready to apply!`,
    });
  };

  // Apply parsed rows with Merge & Enrichment to database
  const handleApplyImport = async () => {
    if (parsedRows.length === 0) return;

    setIsProcessing(true);
    try {
      const commoditiesToAdd: Commodity[] = parsedRows.map((row, idx) => ({
        id: `custom_${Date.now()}_${idx}`,
        name: row.name,
        category: (row.category as FoodCategory) || 'Processed foods',
        icon: getCommodityIcon(row.name, row.category),
        moisture_percent: row.moisture_percent,
        pH: row.pH,
        fat_percent: row.fat_percent,
        respiration_rate: (row.respiration_rate as RespirationRate) || 'None',
        respiration_mg_CO2_kg_hr: row.respiration_mg_CO2_kg_hr,
        recommended_storage_temp_C: row.recommended_storage_temp_C,
        recommended_RH_percent: row.recommended_RH_percent,
        storage_type: (row.storage_type as StorageType) || 'Ambient',
        typical_shelf_life_days: row.typical_shelf_life_days,
        primary_spoilage_factors: row.primary_spoilage_factors,
        description: `Imported via Admin Studio (${fileName || 'Excel import'}). Calibrated with post-harvest kinetics.`,
      }));

      const newlyAdded = registerBatchCommodities(commoditiesToAdd);
      const mergedCount = commoditiesToAdd.length - newlyAdded;

      const additionalRows = parsedRows.reduce(
        (sum, r) => sum + (r.synthetic_samples_multiplier || 250),
        0
      );

      const newTotal = totalTrainingRows + additionalRows;
      setTotalTrainingRows(newTotal);

      try {
        await fetch('/api/admin/import-commodities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            commodities: commoditiesToAdd,
            trainingRowsCount: additionalRows,
            fileName: fileName || 'excel_import.xlsx',
          }),
        });
      } catch (apiErr) {
        console.warn('Backend API persistence skipped (running local):', apiErr);
      }

      const reCalculatedModels = getAllModels(newTotal);
      setModelsList(reCalculatedModels);

      logActivity({
        category: 'dataset',
        action: 'import',
        title: `Dataset Merged: ${fileName || 'Excel Import'}`,
        description: `Ingested ${commoditiesToAdd.length} food profiles (${newlyAdded} new, ${mergedCount} merged). Added +${additionalRows.toLocaleString()} training rows (Total: ${newTotal.toLocaleString()}).`,
        actor: 'Admin',
        metadata: {
          fileName: fileName || 'excel_import.xlsx',
          rowsAdded: additionalRows,
          totalRows: newTotal,
          newCount: newlyAdded,
          mergedCount,
        },
      });

      setNotification({
        type: 'success',
        message: `🎉 Data Merge Complete: ${newlyAdded} new commodities created, ${mergedCount} existing profiles enriched with new lab data, and dataset expanded to ${formatCompactNumber(newTotal)} rows! All ${reCalculatedModels.length} ML models have been automatically re-benchmarked across the new data points.`,
      });

      if (onCommoditiesUpdated) onCommoditiesUpdated();
      setParsedRows([]);
      setFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Import and Merge failed: ${err.message}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Commodity Name': 'Organic Alphonso Mango',
        Category: 'Fresh fruits',
        'Moisture (%)': 83.5,
        pH: 4.2,
        'Fat (%)': 0.4,
        'Respiration Rate': 'High',
        'Respiration (mg CO2/kg/hr)': 45,
        'Storage Temp (°C)': 12,
        'RH (%)': 90,
        'Storage Type': 'Chilled',
        'Shelf Life (Days)': 21,
        'Spoilage Factors': 'Anthracnose, Chilling injury, Moisture loss',
        'Synthetic Samples': 300,
      },
      {
        'Commodity Name': 'Roasted Fox Nuts (Makhana)',
        Category: 'Snacks',
        'Moisture (%)': 4.0,
        pH: 6.5,
        'Fat (%)': 0.5,
        'Respiration Rate': 'None',
        'Respiration (mg CO2/kg/hr)': 0,
        'Storage Temp (°C)': 25,
        'RH (%)': 50,
        'Storage Type': 'Dry Storage',
        'Shelf Life (Days)': 180,
        'Spoilage Factors': 'Moisture pickup, Texture loss',
        'Synthetic Samples': 250,
      },
      {
        'Commodity Name': 'Fresh Buffalo Paneer',
        Category: 'Dairy',
        'Moisture (%)': 54.0,
        pH: 5.6,
        'Fat (%)': 22.0,
        'Respiration Rate': 'None',
        'Respiration (mg CO2/kg/hr)': 0,
        'Storage Temp (°C)': 4,
        'RH (%)': 85,
        'Storage Type': 'Cold Chain',
        'Shelf Life (Days)': 12,
        'Spoilage Factors': 'Bacterial slime, Mold growth, Yeast',
        'Synthetic Samples': 350,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Commodity_Template');
    XLSX.writeFile(workbook, 'packwise_food_dataset_template.xlsx');
  };

  // Reset to 20k Baseline
  const handleResetBaseline = async () => {
    if (!window.confirm('Reset dataset to the default 20,000 synthetic rows baseline?')) {
      return;
    }
    setTotalTrainingRows(20000);
    localStorage.removeItem('packwise_custom_commodities');
    try {
      await fetch('/api/admin/reset-dataset', { method: 'POST' });
    } catch {}

    logActivity({
      category: 'dataset',
      action: 'reset',
      title: 'Dataset Reset to Factory Baseline',
      description: 'Reset ML training dataset back to default 20,000 synthetic holdout records and 89 standard commodities.',
      actor: 'Admin',
      metadata: { totalRows: 20000 },
    });

    setModelsList(getAllModels(20000));
    setNotification({
      type: 'info',
      message: 'Dataset reset to original 20,000 baseline records and 89 standard food commodities.',
    });
  };

  // Export displayed or all activity logs into a CSV file for auditing purposes
  const handleExportActivityLog = (exportAll = false) => {
    const listToExport = exportAll ? activityLogs : filteredActivities;
    if (listToExport.length === 0) return;

    const headers = [
      'Log ID',
      'Local Timestamp',
      'ISO Timestamp',
      'Category',
      'Action Type',
      'Actor',
      'Title',
      'Description',
      'Affected Material',
      'Affected Commodity',
      'Rows Added',
      'Total Training Rows',
      'Source File',
    ];

    const csvData = listToExport.map((l) => [
      `"${l.id}"`,
      `"${new Date(l.timestamp).toLocaleString()}"`,
      `"${l.timestamp}"`,
      `"${l.category}"`,
      `"${l.action}"`,
      `"${l.actor}"`,
      `"${(l.title || '').replace(/"/g, '""')}"`,
      `"${(l.description || '').replace(/"/g, '""')}"`,
      `"${(l.metadata?.materialName || l.metadata?.materialId || '').replace(/"/g, '""')}"`,
      `"${(l.metadata?.commodityName || '').replace(/"/g, '""')}"`,
      l.metadata?.rowsAdded ?? 0,
      l.metadata?.totalRows ?? '',
      `"${(l.metadata?.fileName || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...csvData.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute(
      'download',
      `packwise_audit_trail_${exportAll ? 'all' : 'displayed'}_${dateStr}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setNotification({
      type: 'success',
      message: `📥 Exported ${listToExport.length} ${exportAll ? 'total' : 'displayed'} activity audit log records to CSV.`,
    });
  };

  // Clear Activity Log
  const handleClearActivityLog = async () => {
    if (!window.confirm('Clear all chronological activity history records?')) return;
    setActivityLogs([]);
    try {
      localStorage.removeItem('packwise_admin_activity_log');
      await fetch('/api/admin/activity-log', { method: 'DELETE' });
    } catch {}
    setNotification({
      type: 'info',
      message: 'Activity history cleared.',
    });
  };

  // Filtered & Sorted Activities
  const filteredActivities = useMemo(() => {
    return activityLogs
      .filter((log) => {
        // 1. Category Filter
        if (activityFilter !== 'all' && log.category !== activityFilter) {
          return false;
        }

        // 2. Action Type Filter
        if (activityActionFilter !== 'all' && log.action !== activityActionFilter) {
          return false;
        }

        // 3. Actor Filter
        if (activityActorFilter !== 'all' && log.actor !== activityActorFilter) {
          return false;
        }

        // 4. Timestamp / Date Range Filter
        const logTime = new Date(log.timestamp).getTime();
        const now = Date.now();

        if (activityDatePreset === 'today') {
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          if (logTime < todayStart.getTime()) return false;
        } else if (activityDatePreset === '24h') {
          if (now - logTime > 24 * 3600 * 1000) return false;
        } else if (activityDatePreset === '7d') {
          if (now - logTime > 7 * 24 * 3600 * 1000) return false;
        } else if (activityDatePreset === '30d') {
          if (now - logTime > 30 * 24 * 3600 * 1000) return false;
        } else if (activityDatePreset === 'custom') {
          if (activityStartDate) {
            const start = new Date(activityStartDate + 'T00:00:00').getTime();
            if (logTime < start) return false;
          }
          if (activityEndDate) {
            const end = new Date(activityEndDate + 'T23:59:59.999').getTime();
            if (logTime > end) return false;
          }
        }

        // 5. Keyword Search (title, description, actor, action, category, and metadata)
        if (activitySearch.trim()) {
          const q = activitySearch.toLowerCase().trim();
          const metaStr = log.metadata ? JSON.stringify(log.metadata).toLowerCase() : '';
          const inTitle = log.title.toLowerCase().includes(q);
          const inDesc = log.description.toLowerCase().includes(q);
          const inActor = log.actor.toLowerCase().includes(q);
          const inAction = log.action.toLowerCase().includes(q);
          const inCat = log.category.toLowerCase().includes(q);
          const inMeta = metaStr.includes(q);

          if (!inTitle && !inDesc && !inActor && !inAction && !inCat && !inMeta) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return activitySortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      });
  }, [
    activityLogs,
    activityFilter,
    activityActionFilter,
    activityActorFilter,
    activityDatePreset,
    activityStartDate,
    activityEndDate,
    activitySearch,
    activitySortOrder,
  ]);

  const materialLogsCount = activityLogs.filter((l) => l.category === 'material').length;
  const datasetLogsCount = activityLogs.filter((l) => l.category === 'dataset').length;
  const modelLogsCount = activityLogs.filter((l) => l.category === 'model').length;
  const systemLogsCount = activityLogs.filter((l) => l.category === 'system').length;

  // Chart View State
  const [showActivityCharts, setShowActivityCharts] = useState<boolean>(true);
  const [chartViewMode, setChartViewMode] = useState<'velocity' | 'cumulative' | 'distribution'>('velocity');

  // Aggregated Time-Series Data for Recharts
  const activityTimelineData = useMemo(() => {
    if (activityLogs.length === 0) return [];

    // Sort ascending by timestamp to trace timeline progress
    const sorted = [...activityLogs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const firstTime = new Date(sorted[0].timestamp).getTime();
    const lastTime = new Date(sorted[sorted.length - 1].timestamp).getTime();
    const spanHours = Math.max(1, (lastTime - firstTime) / 3600000);

    const bucketMap = new Map<
      string,
      {
        timeLabel: string;
        timestamp: number;
        adminActions: number;
        userUpdates: number;
        systemEvents: number;
        rowsAdded: number;
        totalEvents: number;
      }
    >();

    sorted.forEach((log) => {
      const d = new Date(log.timestamp);
      const key =
        spanHours <= 48
          ? d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
            ' ' +
            d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : d.toLocaleDateString([], { month: 'short', day: 'numeric' });

      if (!bucketMap.has(key)) {
        bucketMap.set(key, {
          timeLabel: key,
          timestamp: d.getTime(),
          adminActions: 0,
          userUpdates: 0,
          systemEvents: 0,
          rowsAdded: 0,
          totalEvents: 0,
        });
      }

      const bucket = bucketMap.get(key)!;
      bucket.totalEvents += 1;

      if (log.actor.includes('User')) {
        bucket.userUpdates += 1;
      } else if (log.actor.includes('System')) {
        bucket.systemEvents += 1;
      } else {
        bucket.adminActions += 1;
      }

      if (log.metadata?.rowsAdded) {
        bucket.rowsAdded += Number(log.metadata.rowsAdded);
      }
    });

    const buckets = Array.from(bucketMap.values());

    let runningRows = 20000;
    return buckets.map((b) => {
      runningRows += b.rowsAdded;
      return {
        ...b,
        cumulativeRows: runningRows,
      };
    });
  }, [activityLogs]);

  // Breakdown Data for Pie / Donut Chart
  const activityCategoryBreakdown = useMemo(() => {
    const counts = {
      material: 0,
      dataset: 0,
      model: 0,
      userDiscovery: 0,
      system: 0,
    };

    activityLogs.forEach((l) => {
      if (l.action === 'discover') {
        counts.userDiscovery += 1;
      } else if (l.category === 'material') {
        counts.material += 1;
      } else if (l.category === 'dataset') {
        counts.dataset += 1;
      } else if (l.category === 'model') {
        counts.model += 1;
      } else {
        counts.system += 1;
      }
    });

    return [
      { name: 'Materials Specs', value: counts.material, color: '#0284c7' },
      { name: 'Dataset Merges', value: counts.dataset, color: '#059669' },
      { name: 'User Discoveries', value: counts.userDiscovery, color: '#9333ea' },
      { name: 'ML Model Swaps', value: counts.model, color: '#4f46e5' },
      { name: 'System Baseline', value: counts.system, color: '#64748b' },
    ].filter((item) => item.value > 0);
  }, [activityLogs]);

  const totalAdminCount = useMemo(
    () => activityLogs.filter((l) => l.actor === 'Admin').length,
    [activityLogs]
  );
  const totalUserCount = useMemo(
    () => activityLogs.filter((l) => l.actor.includes('User')).length,
    [activityLogs]
  );
  const totalSystemCount = useMemo(
    () => activityLogs.filter((l) => l.actor.includes('System')).length,
    [activityLogs]
  );

  // Filtered Candidates Memo
  const filteredCandidates = useMemo(() => {
    return candidatesList.filter((c) => {
      if (candidateFilter !== 'all' && c.status !== candidateFilter) {
        return false;
      }
      if (candidateSearch.trim()) {
        const q = candidateSearch.toLowerCase().trim();
        const matchesName = c.commodityName.toLowerCase().includes(q);
        const matchesCat = c.category.toLowerCase().includes(q);
        const matchesMat = (c.recommendedMaterialName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesMat) return false;
      }
      return true;
    });
  }, [candidatesList, candidateFilter, candidateSearch]);

  const pendingCandidatesCount = candidatesList.filter((c) => c.status === 'pending').length;
  const approvedCandidatesCount = candidatesList.filter((c) => c.status === 'approved').length;
  const rejectedCandidatesCount = candidatesList.filter((c) => c.status === 'rejected').length;

  // Render Access Gate if not unlocked
  if (!isUnlocked) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl border border-[#e1e7dc] p-8 shadow-md text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 mx-auto flex items-center justify-center shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Restricted: Admin & Data Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dataset ingestion, packaging material engineering, and ML model architecture selection are restricted to authorized administrators and data scientists.
            </p>
          </div>

          <form onSubmit={handleUnlockAdmin} className="space-y-4 pt-2">
            <div className="text-left space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Admin Authorization Passkey
              </label>
              <input
                type="password"
                value={passkeyInput}
                onChange={(e) => {
                  setPasskeyInput(e.target.value);
                  setPasskeyError('');
                }}
                placeholder="Enter master admin passkey..."
                className="w-full bg-[#f9faf7] px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 placeholder:text-slate-400"
                autoFocus
              />
              {passkeyError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold pt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{passkeyError}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-left text-xs text-emerald-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Authorized Passkey: </span>
                <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-950">
                  admin2026
                </code>{' '}
                (or click below to unlock with default passkey)
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPasskeyInput('admin2026');
                }}
                className="flex-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl transition-colors cursor-pointer"
              >
                Fill Key
              </button>
              <button
                type="submit"
                className="flex-2 flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Admin Portal</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render Full Admin Studio once authenticated
  const stagedNewCount = parsedRows.filter((r) => !r.isExisting).length;
  const stagedMergeCount = parsedRows.filter((r) => r.isExisting).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner & Active Model Status */}
      <div className="bg-white rounded-3xl border border-[#e1e7dc] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
                <Database className="w-5 h-5 text-emerald-300" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Model Dataset & Architecture Studio
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3 h-3" />
                Admin Unlocked
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Admin Portal: Upload spreadsheets, manage packaging materials catalog, select active ML models, track audit logs, or build custom methodologies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLockAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-[#f9faf7] hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              title="Lock Admin Session and return to Standard Mode"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Lock Session</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-[#f9faf7] rounded-2xl p-4 border border-[#e8eee4]">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Training Rows
            </div>
            <div className="text-2xl font-black text-emerald-900 mt-1">
              {formatCompactNumber(totalTrainingRows)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Baseline: 20k + {formatCompactNumber(Math.max(0, totalTrainingRows - 20000))} learned
            </div>
          </div>

          <div className="bg-[#f9faf7] rounded-2xl p-4 border border-[#e8eee4]">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Packaging Materials
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {materialsList.length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Fully customizable specs
            </div>
          </div>

          <div className="bg-[#f9faf7] rounded-2xl p-4 border border-[#e8eee4]">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active Model
            </div>
            <div
              className="text-lg font-black text-slate-900 mt-1 truncate"
              title={currentModelMeta.name}
            >
              {currentModelMeta.code}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5 truncate">
              ● {currentModelMeta.focus}
            </div>
          </div>

          <div className="bg-[#f9faf7] rounded-2xl p-4 border border-[#e8eee4]">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Dynamic Holdout F1
            </div>
            <div className="text-2xl font-black text-amber-600 mt-1 flex items-baseline gap-1.5">
              <span>{currentModelMeta.f1Score}</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1 rounded">
                {currentModelMeta.gainFromBaseline}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Accuracy: {currentModelMeta.accuracy} · Loss: {currentModelMeta.validationLoss}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : notification.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-300'
              : 'bg-blue-50 text-blue-900 border-blue-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. File Upload & Dataset Merge Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#e1e7dc] p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                Upload Spreadsheet (.xlsx, .xls, .csv)
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <GitMerge className="w-3 h-3 text-emerald-700" />
                  Auto-merge enabled
                </span>
              </div>
            </div>

            <div className="bg-[#f9faf7] p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <GitMerge className="w-3.5 h-3.5 text-emerald-700" />
                <span className="font-bold text-slate-700">Merge Policy on Existing Food:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMergePolicy('merge_and_enrich')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    mergePolicy === 'merge_and_enrich'
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  Merge & Enrich (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setMergePolicy('append_only')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    mergePolicy === 'append_only'
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  Append Only
                </button>
              </div>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 hover:border-emerald-600 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 shadow-2xs flex items-center justify-center text-emerald-700">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">
                  {fileName ? (
                    <span className="text-emerald-800">Selected: {fileName}</span>
                  ) : (
                    'Click to browse or drop Excel file here'
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Upload Excel (.xlsx, .xls) or CSV with post-harvest commodity properties
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSamplePack}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quick Test: Load 6-Agri Sample Pack</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download Excel Template</span>
              </button>
            </div>

            {parsedRows.length > 0 && (
              <button
                type="button"
                onClick={handleApplyImport}
                disabled={isProcessing}
                className="flex items-center gap-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>
                  Merge & Expand Dataset ({stagedNewCount} new + {stagedMergeCount} merge)
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#f9faf7] rounded-3xl border border-[#e1e7dc] p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <GitMerge className="w-4 h-4" />
              <span>How Data Merging Works</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              When an uploaded or user-discovered commodity matches an existing record:
            </p>
            <ul className="text-xs text-slate-600 space-y-2 pl-1">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold mt-0.5">•</span>
                <span>
                  <strong>Zero Duplication</strong>: Duplicate records and repeated rows are strictly avoided.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold mt-0.5">•</span>
                <span>
                  <strong>Factor Union</strong>: Spoilage factors are merged into a unified set.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold mt-0.5">•</span>
                <span>
                  <strong>Automatic User Discovery Ingestion</strong>: Unlisted items queried by normal users automatically expand the training rows (+250 rows/item).
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold mt-0.5">•</span>
                <span>
                  <strong>Transparent Audit Log</strong>: Every change is recorded in the Activity Log below.
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Baseline reset</span>
            <button
              type="button"
              onClick={handleResetBaseline}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset to 20k Baseline</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Live Preview Table of Staged / Merged Rows */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#e1e7dc] overflow-hidden shadow-xs">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-800" />
              <h3 className="text-sm font-black text-slate-900">
                Staged Rows Preview ({stagedNewCount} new commodities, {stagedMergeCount} to merge & enrich)
              </h3>
            </div>
            <button
              type="button"
              onClick={handleApplyImport}
              disabled={isProcessing}
              className="flex items-center gap-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <span>Commit & Merge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Commodity</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Moisture</th>
                  <th className="px-4 py-3">pH</th>
                  <th className="px-4 py-3">Fat</th>
                  <th className="px-4 py-3">Respiration</th>
                  <th className="px-4 py-3">Storage</th>
                  <th className="px-4 py-3">Shelf Life</th>
                  <th className="px-4 py-3 text-right">Synthetic Rows</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <span>{row.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      {row.isExisting ? (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <GitMerge className="w-2.5 h-2.5" />
                          Merge & Enrich
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          New Profile
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.category}</td>
                    <td className="px-4 py-3 text-slate-700 font-semibold">
                      {row.moisture_percent}%
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.pH}</td>
                    <td className="px-4 py-3 text-slate-700">{row.fat_percent}%</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {row.respiration_rate}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.recommended_storage_temp_C}°C · {row.recommended_RH_percent}% RH
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-semibold">
                      {row.typical_shelf_life_days} days
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-800 font-bold">
                      +{row.synthetic_samples_multiplier || 250} rows
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MODEL SELECTION & ARCHITECTURE REGISTRY */}
      <div className="bg-white rounded-3xl border border-[#e1e7dc] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Machine Learning & Packaging Model Architecture Registry ({modelsList.length} Models)
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Active model switcher & custom methodology builder. Models are dynamically re-evaluated across the augmented {totalTrainingRows.toLocaleString()} rows dataset.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleRebenchmarkAll}
              disabled={isReevaluating}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-[#f9faf7] hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Recalculate validation F1 score and loss for all models using current dataset"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isReevaluating ? 'animate-spin' : ''}`} />
              <span>{isReevaluating ? 'Evaluating...' : 'Re-benchmark Models'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Custom Methodology</span>
            </button>
          </div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Dynamic ML Scaling Active:</strong> Models automatically calculate performance gain on {totalTrainingRows.toLocaleString()} training records ({totalTrainingRows > 20000 ? `+${(totalTrainingRows - 20000).toLocaleString()} added records` : 'baseline'}).
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-white border border-emerald-300 px-2 py-0.5 rounded-full shrink-0">
            Active: {currentModelMeta.code}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {modelsList.map((model) => {
            const isSelected = model.id === activeModel;
            return (
              <div
                key={model.id}
                className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-3.5 relative ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-[#f9faf7] hover:border-slate-300'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-slate-900">{model.name}</span>
                        {model.isRecommended && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                            Default
                          </span>
                        )}
                        {model.isCustom && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded border border-purple-200">
                            Custom Model
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                        <span>{model.code} · {model.version}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-emerald-800 font-semibold">{model.datasetTrained}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${model.tagColor}`}
                    >
                      {model.focus}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {model.description}
                  </p>

                  <div className="text-[11px] text-slate-500 pt-0.5">
                    <strong className="text-slate-700">Best for:</strong> {model.bestSuitedFor}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">F1:</span>
                      <strong className="text-slate-900 font-black">{model.f1Score}</strong>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-1 py-0.2 rounded ml-0.5">
                        {model.gainFromBaseline}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Acc:</span>
                      <strong className="text-slate-900 font-black">{model.accuracy}</strong>
                    </div>
                    <div className="flex items-center gap-1 hidden sm:flex">
                      <span className="text-slate-400">Loss:</span>
                      <strong className="text-slate-700 font-mono text-[11px]">{model.validationLoss}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {model.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomModel(model.id, model.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete custom model"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSelectModel(model)}
                      disabled={isSelected}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-800 text-white cursor-default'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Active Model</span>
                        </>
                      ) : (
                        <span>Apply Model</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. PACKAGING MATERIALS CATALOG & ENGINEERING SPECS MANAGER (Add, Update, Remove) */}
      <div className="bg-white rounded-3xl border border-[#e1e7dc] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Packaging Materials Catalog & Engineering Specs Manager ({materialsList.length} Materials)
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Admin Portal: Add new polymer structures, update technical barrier kinetics (WVTR, OTR, thickness, sealing), or delete materials from active recommendation pipelines.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleResetMaterials}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-[#f9faf7] hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition-all cursor-pointer"
              title="Reset materials to factory certified 13 defaults"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Materials Baseline</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddMaterial}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Packaging Material</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search materials by name, code or structure..."
              value={materialSearchQuery}
              onChange={(e) => setMaterialSearchQuery(e.target.value)}
              className="w-full bg-[#f9faf7] pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Category:</span>
            {materialCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setMaterialCategoryFilter(cat)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  materialCategoryFilter === cat
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-[#f9faf7] text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="rounded-2xl border border-slate-200/90 bg-[#f9faf7] hover:border-emerald-300 transition-all p-4 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black text-slate-900">{mat.name}</h3>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {mat.code} · {mat.category}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {mat.film_thickness_micron} µm
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Layer Structure</div>
                  <div className="font-semibold text-slate-800 truncate" title={mat.structure_layers}>
                    {mat.structure_layers}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">OTR (Oxygen)</span>
                    <strong className="text-slate-900">{mat.OTR_cc_m2_day}</strong>{' '}
                    <span className="text-[10px] text-slate-500">cc/m²/day</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">WVTR (Moisture)</span>
                    <strong className="text-slate-900">{mat.WVTR_g_m2_day}</strong>{' '}
                    <span className="text-[10px] text-slate-500">g/m²/day</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                  <div>
                    Cost: <strong className="text-slate-800">${mat.cost_estimate_per_1k_packs_usd}/1k</strong>
                  </div>
                  <div>
                    Seal: <strong className="text-slate-800">{mat.seal_temperature_C}°C</strong>
                  </div>
                  <div>
                    CO2: <strong className="text-slate-800">{mat.carbon_index_kgCO2_per_kg}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200/70">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    mat.recyclability === 'Widely Recyclable' ||
                    mat.recyclability === 'Industrial Compostable' ||
                    mat.recyclability === 'Home Compostable'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {mat.recyclability}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditMaterial(mat)}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                    title="Edit material engineering parameters"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteMaterial(mat)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 bg-white rounded-xl transition-colors cursor-pointer"
                    title="Delete material from catalog"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. PENDING TRAINING ROW CANDIDATES (Human-in-the-Loop Review Queue) */}
      <div className="bg-white rounded-3xl border border-[#e1e7dc] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Pending Training Candidates Queue
                  </h2>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                    {pendingCandidatesCount} Pending Approval
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Human-in-the-loop review queue: Every unique user recommendation input is logged as a candidate row. Review and approve entries before they are committed into the master training dataset.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleSimulateUserCandidate}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-[#f9faf7] hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition-all cursor-pointer"
              title="Generate a realistic mock user recommendation to test the review queue"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
              <span>Simulate User Query</span>
            </button>

            {pendingCandidatesCount > 0 && (
              <button
                type="button"
                onClick={handleApproveAllPendingCandidates}
                disabled={isBulkApproving}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                title="Approve and commit all pending candidates into the master training rows"
              >
                <CheckCheck className="w-4 h-4" />
                <span>
                  {isBulkApproving ? 'Committing...' : `Approve All Pending (${pendingCandidatesCount})`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setCandidateFilter('pending')}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                candidateFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-[#f9faf7] text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Pending Review ({pendingCandidatesCount})
            </button>

            <button
              type="button"
              onClick={() => setCandidateFilter('approved')}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                candidateFilter === 'approved'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-[#f9faf7] text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Approved & Committed ({approvedCandidatesCount})
            </button>

            <button
              type="button"
              onClick={() => setCandidateFilter('rejected')}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                candidateFilter === 'rejected'
                  ? 'bg-rose-700 text-white shadow-2xs'
                  : 'bg-[#f9faf7] text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Rejected ({rejectedCandidatesCount})
            </button>

            <button
              type="button"
              onClick={() => setCandidateFilter('all')}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                candidateFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-[#f9faf7] text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All ({candidatesList.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate food or packaging..."
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              className="w-full bg-[#f9faf7] pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Candidates Cards Grid */}
        <div className="space-y-3.5 pt-1">
          {filteredCandidates.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-[#f9faf7] rounded-2xl border border-dashed border-slate-200 space-y-2">
              <div className="font-semibold text-slate-700">No training candidates found in this view.</div>
              <p className="text-slate-400">
                New user recommendation queries will automatically appear here for your review and approval.
              </p>
              <button
                type="button"
                onClick={handleSimulateUserCandidate}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold shadow-2xs hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Simulate a Test User Query</span>
              </button>
            </div>
          ) : (
            filteredCandidates.map((cand) => {
              const isPending = cand.status === 'pending';
              const isApproved = cand.status === 'approved';
              const isRejected = cand.status === 'rejected';
              const isProcessing = processingCandidateId === cand.id;

              return (
                <div
                  key={cand.id}
                  className={`rounded-2xl border p-4 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isPending
                      ? 'border-amber-200 bg-amber-50/20 hover:border-amber-300'
                      : isApproved
                      ? 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300'
                      : 'border-slate-200 bg-slate-50/60 opacity-75'
                  }`}
                >
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-slate-900 truncate">
                        {cand.commodityName}
                      </span>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {cand.category}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isPending
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : isApproved
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-rose-100 text-rose-900 border-rose-300'
                        }`}
                      >
                        {isPending
                          ? '⏳ Awaiting Admin Approval'
                          : isApproved
                          ? '✓ Approved & Committed'
                          : '✕ Rejected'}
                      </span>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(cand.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · {new Date(cand.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Biological & Storage Parameters */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-white p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Moisture & pH</span>
                        <strong className="text-slate-900">{cand.moisture_percent}%</strong> · pH <strong className="text-slate-900">{cand.pH}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Storage Envelope</span>
                        <strong className="text-slate-900">{cand.storage_temperature_C}°C</strong> · {cand.relative_humidity_percent}% RH
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Recommended Packaging</span>
                        <span className="font-bold text-slate-900 truncate block" title={cand.recommendedMaterialName}>
                          {cand.recommendedMaterialName}
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Predicted Shelf Life</span>
                        <strong className="text-emerald-800">{cand.predictedShelfLifeDays} days</strong>{' '}
                        <span className="text-[10px] text-slate-400">({cand.confidenceScore}% conf)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
                      <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Yields +{cand.syntheticRowsYield} Master Training Rows
                      </span>
                      <span>Storage Type: <strong className="text-slate-700">{cand.storage_type}</strong></span>
                      {cand.reviewedAt && (
                        <span className="text-slate-400">
                          Reviewed: {new Date(cand.reviewedAt).toLocaleDateString()} by {cand.reviewedBy || 'Admin'}
                        </span>
                      )}
                      {cand.rejectionReason && (
                        <span className="text-rose-600 font-medium">
                          Reason: {cand.rejectionReason}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200/60">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRejectCandidate(cand)}
                          disabled={isProcessing}
                          className="px-3 py-2 rounded-xl border border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveCandidate(cand)}
                          disabled={isProcessing}
                          className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Commit (+{cand.syntheticRowsYield})</span>
                        </button>
                      </>
                    ) : isApproved ? (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1.5 rounded-xl border border-emerald-300 inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Committed to Dataset</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                        Declined
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 7. ACTIVITY LOG & AUDIT TRAIL SECTION (Chronological Transparency) */}
      <div className="bg-white rounded-3xl border border-[#e1e7dc] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Activity Log & Audit Trail ({activityLogs.length} Events)
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Chronological history of changes made to packaging materials, dataset augmentations, model deployments, and automatic user discoveries.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowActivityCharts((prev) => !prev)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer border ${
                showActivityCharts
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                  : 'bg-[#f9faf7] hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="Toggle activity charts and timeline analytics"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{showActivityCharts ? 'Hide Visualizer' : 'Show Visualizer'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportActivityLog(false)}
              disabled={filteredActivities.length === 0}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 border border-emerald-900 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="Export currently filtered and displayed logs to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                Export Displayed ({filteredActivities.length} CSV)
              </span>
            </button>

            {isAnyActivityFilterActive && (
              <button
                type="button"
                onClick={() => handleExportActivityLog(true)}
                disabled={activityLogs.length === 0}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-[#f9faf7] hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                title="Export entire activity history across all filters to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export All ({activityLogs.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClearActivityLog}
              disabled={activityLogs.length === 0}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* 6.A RECHARTS ANALYTICS: Visualizing Admin Actions and User-Generated Updates Over Time */}
        {showActivityCharts && (
          <div className="p-5 bg-[#f9faf7] rounded-3xl border border-[#e1e7dc] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">
                    Activity & Data Evolution Analytics
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Visualizing frequency of admin actions and user-generated data updates over time.
                  </p>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setChartViewMode('velocity')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                    chartViewMode === 'velocity'
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Action Frequency
                </button>
                <button
                  type="button"
                  onClick={() => setChartViewMode('cumulative')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                    chartViewMode === 'cumulative'
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Row Growth Curve
                </button>
                <button
                  type="button"
                  onClick={() => setChartViewMode('distribution')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                    chartViewMode === 'distribution'
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Activity Breakdown
                </button>
              </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Admin Operations</div>
                <div className="text-lg font-black text-emerald-800 mt-0.5">{totalAdminCount}</div>
                <div className="text-[10px] text-slate-500">Materials, dataset, model changes</div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-purple-600">User Data Updates</div>
                <div className="text-lg font-black text-purple-700 mt-0.5">{totalUserCount}</div>
                <div className="text-[10px] text-slate-500">AI unlisted queries ingested</div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">System Engine</div>
                <div className="text-lg font-black text-slate-700 mt-0.5">{totalSystemCount}</div>
                <div className="text-[10px] text-slate-500">Calibrations & state sync</div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Added Training Rows</div>
                <div className="text-lg font-black text-emerald-700 mt-0.5">
                  +{Math.max(0, totalTrainingRows - 20000).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">From user & admin imports</div>
              </div>
            </div>

            {/* Recharts Visualizations */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              {activityTimelineData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                  No activity history points to plot yet.
                </div>
              ) : chartViewMode === 'velocity' ? (
                <div>
                  <div className="flex items-center justify-between text-xs pb-3">
                    <span className="font-bold text-slate-800">
                      Frequency: Admin Actions vs. User-Generated Updates Over Time
                    </span>
                    <span className="text-[11px] text-slate-400">Grouped Chronologically</span>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={activityTimelineData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="timeLabel"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        tickLine={false}
                        axisLine={{ stroke: '#cbd5e1' }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          fontSize: '11px',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar
                        dataKey="adminActions"
                        name="Admin Actions"
                        fill="#059669"
                        radius={[4, 4, 0, 0]}
                        stackId="activity"
                      />
                      <Bar
                        dataKey="userUpdates"
                        name="User-Generated Updates"
                        fill="#9333ea"
                        radius={[4, 4, 0, 0]}
                        stackId="activity"
                      />
                      <Bar
                        dataKey="systemEvents"
                        name="System Calibrations"
                        fill="#64748b"
                        radius={[4, 4, 0, 0]}
                        stackId="activity"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : chartViewMode === 'cumulative' ? (
                <div>
                  <div className="flex items-center justify-between text-xs pb-3">
                    <span className="font-bold text-slate-800">
                      Cumulative Dataset Growth (Starting from 20,000 Baseline Rows)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Current: {totalTrainingRows.toLocaleString()} rows
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart
                      data={activityTimelineData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="rowGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="timeLabel"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        tickLine={false}
                        axisLine={{ stroke: '#cbd5e1' }}
                      />
                      <YAxis
                        domain={['dataMin - 500', 'dataMax + 500']}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => formatCompactNumber(val)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          fontSize: '11px',
                        }}
                        formatter={(val: any) => [`${Number(val).toLocaleString()} rows`, 'Dataset Volume']}
                      />
                      <Area
                        type="monotone"
                        dataKey="cumulativeRows"
                        name="Total Training Rows"
                        stroke="#059669"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#rowGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between text-xs pb-3">
                    <span className="font-bold text-slate-800">
                      Activity Category Distribution
                    </span>
                    <span className="text-[11px] text-slate-400">Total {activityLogs.length} events</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <div className="w-full sm:w-1/2 h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={activityCategoryBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {activityCategoryBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              borderRadius: '12px',
                              border: '1px solid #e2e8f0',
                              fontSize: '11px',
                            }}
                            formatter={(val: any, name: any) => [`${val} actions`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="w-full sm:w-1/2 space-y-2">
                      {activityCategoryBreakdown.map((item) => {
                        const percent = ((item.value / Math.max(1, activityLogs.length)) * 100).toFixed(0);
                        return (
                          <div
                            key={item.name}
                            className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-100"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="font-bold text-slate-800">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <strong className="text-slate-900">{item.value}</strong>
                              <span className="text-[10px] text-slate-400">({percent}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Advanced Search & Filtering Toolbar */}
        <div className="space-y-3 pt-2">
          {/* Top Row: Search Input + Date Range Presets + Sort Order */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail by action, material, food, user or keyword..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="w-full bg-[#f9faf7] pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 placeholder:text-slate-400"
              />
              {activitySearch && (
                <button
                  type="button"
                  onClick={() => setActivitySearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="md:col-span-3 flex items-center gap-1.5 bg-[#f9faf7] px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={activityDatePreset}
                onChange={(e) => setActivityDatePreset(e.target.value as any)}
                className="w-full bg-transparent font-semibold text-slate-700 focus:outline-none text-xs cursor-pointer"
              >
                <option value="all">Time: All History</option>
                <option value="today">Time: Today</option>
                <option value="24h">Time: Last 24 Hours</option>
                <option value="7d">Time: Last 7 Days</option>
                <option value="30d">Time: Last 30 Days</option>
                <option value="custom">Time: Custom Range...</option>
              </select>
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActivitySortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-[#f9faf7] hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                title="Toggle chronological sort order"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>{activitySortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
              </button>

              {isAnyActivityFilterActive && (
                <button
                  type="button"
                  onClick={handleResetActivityFilters}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Optional Custom Date Range Inputs (shown when 'custom' is selected) */}
          {activityDatePreset === 'custom' && (
            <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CalendarRange className="w-4 h-4 text-emerald-700" />
                Custom Date Range:
              </span>
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-slate-600">From:</label>
                <input
                  type="date"
                  value={activityStartDate}
                  onChange={(e) => setActivityStartDate(e.target.value)}
                  className="bg-white px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-slate-600">To:</label>
                <input
                  type="date"
                  value={activityEndDate}
                  onChange={(e) => setActivityEndDate(e.target.value)}
                  className="bg-white px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800"
                />
              </div>
              {(activityStartDate || activityEndDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setActivityStartDate('');
                    setActivityEndDate('');
                  }}
                  className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                >
                  Clear dates
                </button>
              )}
            </div>
          )}

          {/* Secondary Row: Category Pills + Action Dropdown + Actor Dropdown */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              <button
                type="button"
                onClick={() => setActivityFilter('all')}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                  activityFilter === 'all'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-[#f9faf7] text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All Categories ({activityLogs.length})
              </button>

              <button
                type="button"
                onClick={() => setActivityFilter('material')}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                  activityFilter === 'material'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-[#f9faf7] text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Materials ({materialLogsCount})
              </button>

              <button
                type="button"
                onClick={() => setActivityFilter('dataset')}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                  activityFilter === 'dataset'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-[#f9faf7] text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Dataset & Rows ({datasetLogsCount})
              </button>

              <button
                type="button"
                onClick={() => setActivityFilter('model')}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                  activityFilter === 'model'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-[#f9faf7] text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                ML Models ({modelLogsCount})
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Action Dropdown */}
              <div className="flex items-center gap-1 bg-[#f9faf7] px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Action:</span>
                <select
                  value={activityActionFilter}
                  onChange={(e) => setActivityActionFilter(e.target.value)}
                  className="bg-transparent font-semibold text-slate-700 focus:outline-none text-xs cursor-pointer"
                >
                  <option value="all">All Actions</option>
                  <option value="create">➕ Material Added</option>
                  <option value="update">✏️ Specs Updated</option>
                  <option value="delete">🗑️ Material Removed</option>
                  <option value="import">📥 Dataset Ingestion</option>
                  <option value="discover">✨ User Discovery</option>
                  <option value="reset">🔄 Baseline Reset</option>
                </select>
              </div>

              {/* Actor Dropdown */}
              <div className="flex items-center gap-1 bg-[#f9faf7] px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Actor:</span>
                <select
                  value={activityActorFilter}
                  onChange={(e) => setActivityActorFilter(e.target.value)}
                  className="bg-transparent font-semibold text-slate-700 focus:outline-none text-xs cursor-pointer"
                >
                  <option value="all">All Actors</option>
                  <option value="Admin">🛡️ Admin Portal</option>
                  <option value="User Query (AI Engine)">👤 User Query (AI)</option>
                  <option value="System Engine">⚙️ System Engine</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Status & Active Filter Tags Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <span>
                Showing <strong className="text-slate-900 font-bold">{filteredActivities.length}</strong> of{' '}
                <strong className="text-slate-900 font-bold">{activityLogs.length}</strong> recorded events
              </span>
              {isAnyActivityFilterActive && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Filters Active
                </span>
              )}
            </div>

            {isAnyActivityFilterActive && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {activitySearch && (
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                    Search: "{activitySearch}"
                    <button onClick={() => setActivitySearch('')} className="hover:text-slate-900">×</button>
                  </span>
                )}
                {activityFilter !== 'all' && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                    Category: {activityFilter}
                    <button onClick={() => setActivityFilter('all')} className="hover:text-emerald-950">×</button>
                  </span>
                )}
                {activityActionFilter !== 'all' && (
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                    Action: {activityActionFilter}
                    <button onClick={() => setActivityActionFilter('all')} className="hover:text-blue-950">×</button>
                  </span>
                )}
                {activityActorFilter !== 'all' && (
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                    Actor: {activityActorFilter}
                    <button onClick={() => setActivityActorFilter('all')} className="hover:text-purple-950">×</button>
                  </span>
                )}
                {activityDatePreset !== 'all' && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                    Time: {activityDatePreset}
                    <button onClick={() => setActivityDatePreset('all')} className="hover:text-amber-950">×</button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chronological Timeline List */}
        <div className="space-y-3 pt-1">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-[#f9faf7] rounded-2xl border border-dashed border-slate-200 space-y-2">
              <div className="font-semibold text-slate-700">No activity logs matched your current filters.</div>
              <p className="text-slate-400">Try loosening your search keywords, action types, or date range.</p>
              {isAnyActivityFilterActive && (
                <button
                  type="button"
                  onClick={handleResetActivityFilters}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold shadow-2xs hover:bg-emerald-900 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>
          ) : (
            filteredActivities.map((log) => {
              const logDate = new Date(log.timestamp);
              const formattedTime = logDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const formattedDate = logDate.toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              const isMaterial = log.category === 'material';
              const isDataset = log.category === 'dataset';
              const isModel = log.category === 'model';
              const isDiscover = log.action === 'discover';
              const isDelete = log.action === 'delete';
              const isReset = log.action === 'reset';

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-[#f9faf7] hover:bg-emerald-50/20 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                        isDelete || isReset
                          ? 'bg-rose-100 text-rose-700'
                          : isDiscover
                          ? 'bg-purple-100 text-purple-700'
                          : isMaterial
                          ? 'bg-blue-100 text-blue-700'
                          : isModel
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isDelete || isReset ? (
                        <Trash2 className="w-4 h-4" />
                      ) : isDiscover ? (
                        <Sparkles className="w-4 h-4" />
                      ) : isMaterial ? (
                        <PackageCheck className="w-4 h-4" />
                      ) : isModel ? (
                        <Cpu className="w-4 h-4" />
                      ) : (
                        <Database className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-900">{log.title}</span>

                        {/* Interactive Category Filter Pill */}
                        <button
                          type="button"
                          onClick={() => setActivityFilter(log.category)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${
                            log.category === 'material'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : log.category === 'dataset'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : log.category === 'model'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                          title={`Filter by ${log.category}`}
                        >
                          {log.category.toUpperCase()}
                        </button>

                        {/* Interactive Actor Filter Pill */}
                        <button
                          type="button"
                          onClick={() => setActivityActorFilter(log.actor)}
                          className="text-[10px] font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1 cursor-pointer transition-colors"
                          title={`Filter by ${log.actor}`}
                        >
                          {log.actor.includes('User') ? (
                            <User className="w-3 h-3 text-purple-600" />
                          ) : log.actor.includes('System') ? (
                            <Bot className="w-3 h-3 text-slate-600" />
                          ) : (
                            <ShieldCheck className="w-3 h-3 text-emerald-700" />
                          )}
                          <span>{log.actor}</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {log.description}
                      </p>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          {log.metadata.rowsAdded && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                              +{log.metadata.rowsAdded.toLocaleString()} Training Rows
                            </span>
                          )}
                          {log.metadata.totalRows && (
                            <span className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                              Dataset: {log.metadata.totalRows.toLocaleString()} rows
                            </span>
                          )}
                          {log.metadata.fileName && (
                            <span
                              onClick={() => setActivitySearch(log.metadata?.fileName || '')}
                              className="text-[10px] font-mono text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md cursor-pointer"
                              title="Click to search this file"
                            >
                              File: {log.metadata.fileName}
                            </span>
                          )}
                          {log.metadata.materialName && (
                            <span
                              onClick={() => setActivitySearch(log.metadata?.materialName || '')}
                              className="text-[10px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                              title="Click to search this material"
                            >
                              Material: {log.metadata.materialName}
                            </span>
                          )}
                          {log.metadata.commodityName && (
                            <span
                              onClick={() => setActivitySearch(log.metadata?.commodityName || '')}
                              className="text-[10px] font-semibold bg-purple-50 hover:bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                              title="Click to search this commodity"
                            >
                              Food: {log.metadata.commodityName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right text-[11px] text-slate-400 font-medium pl-12 sm:pl-0">
                    <div className="flex items-center sm:justify-end gap-1 text-slate-600 font-semibold">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formattedTime}</span>
                    </div>
                    <div>{formattedDate}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 7. Active Custom Commodity Catalog */}
      {customCommodities.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#e1e7dc] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Active Custom Commodities ({customCommodities.length})
              </h3>
              <p className="text-xs text-slate-500">
                These commodities were learned from user queries or merged via Admin Studio and are live across the recommendation pipeline.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Live in Database
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {customCommodities.map((comm) => (
              <div
                key={comm.id}
                className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-emerald-50/50 hover:border-emerald-300 transition-colors flex items-start gap-3"
              >
                <span className="text-xl p-1.5 rounded-xl bg-white border border-slate-100 shadow-2xs">
                  {comm.icon && comm.icon !== '🌾' && comm.icon !== '🍊' && comm.icon !== '🧈'
                    ? comm.icon
                    : getCommodityIcon(comm.name, comm.category)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">{comm.name}</div>
                  <div className="text-[10px] text-slate-500">{comm.category}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Moisture {comm.moisture_percent}% · pH {comm.pH} · {comm.typical_shelf_life_days}d
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Create New Custom Model Architecture */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Register Custom Packaging Methodology
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define a new prediction pipeline or specialized barrier architecture.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomModel} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Model / Methodology Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cryovac High-Shrink Barrier Skin"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    className="w-full bg-[#f9faf7] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Code / Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. CRYO-SHRINK-V1"
                    value={newModelCode}
                    onChange={(e) => setNewModelCode(e.target.value)}
                    className="w-full bg-[#f9faf7] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 placeholder:text-slate-400 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Architecture Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Physics-Informed Neural Forest"
                    value={newModelArch}
                    onChange={(e) => setNewModelArch(e.target.value)}
                    className="w-full bg-[#f9faf7] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Optimization Focus</label>
                  <select
                    value={newModelFocus}
                    onChange={(e) => setNewModelFocus(e.target.value as RegisteredModel['focus'])}
                    className="w-full bg-[#f9faf7] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
                  >
                    <option value="Custom Pipeline">Custom Pipeline</option>
                    <option value="Sustainability / EPR">Sustainability / EPR</option>
                    <option value="Ultra Barrier">Ultra Barrier</option>
                    <option value="Active Packaging">Active Packaging</option>
                    <option value="Multi-Objective Pareto">Multi-Objective Pareto</option>
                    <option value="Physics-Informed ML">Physics-Informed ML</option>
                    <option value="Low-Cost MSME">Low-Cost MSME</option>
                    <option value="High-Cardinality">High-Cardinality</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Primary Packaging Material Prioritized</label>
                <select
                  value={newModelMaterial}
                  onChange={(e) => setNewModelMaterial(e.target.value)}
                  className="w-full bg-[#f9faf7] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
                >
                  {materialsList.map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.name} ({mat.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Target Base Macro F1 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="15"
                    max="95"
                    value={newModelBaseF1}
                    onChange={(e) => setNewModelBaseF1(Number(e.target.value))}
                    className="w-full bg-[#f9faf7] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Target Base Accuracy (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="50"
                    max="99"
                    value={newModelBaseAcc}
                    onChange={(e) => setNewModelBaseAcc(Number(e.target.value))}
                    className="w-full bg-[#f9faf7] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe the scientific or engineering principles of this packaging model..."
                  value={newModelDesc}
                  onChange={(e) => setNewModelDesc(e.target.value)}
                  className="w-full bg-[#f9faf7] px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 placeholder:text-slate-400 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Best Suited For</label>
                <input
                  type="text"
                  placeholder="e.g. Export vacuum poultry, long-haul chilled dairy, organic berries"
                  value={newModelBestFor}
                  onChange={(e) => setNewModelBestFor(e.target.value)}
                  className="w-full bg-[#f9faf7] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register & Deploy Model</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add or Edit Packaging Material & Engineering Specs */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingMaterialId ? 'Edit Packaging Material Specs' : 'Add New Packaging Material'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define barrier metrics (OTR/WVTR), layer structure, sealing temperatures, and commercial cost.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMaterialModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Material Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Recyclable High-Barrier Mono-PP Pouch"
                    value={matName}
                    onChange={(e) => setMatName(e.target.value)}
                    className="w-full bg-[#f9faf7] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Code / ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MONO-PP-HB"
                    value={matCode}
                    onChange={(e) => setMatCode(e.target.value)}
                    className="w-full bg-[#f9faf7] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Polymer Category</label>
                  <select
                    value={matCategory}
                    onChange={(e) => setMatCategory(e.target.value as any)}
                    className="w-full bg-[#f9faf7] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
                  >
                    <option value="Polyolefin">Polyolefin (PE, PP, HDPE, LDPE)</option>
                    <option value="Polyester">Polyester (PET, Met-PET)</option>
                    <option value="Barrier Multilayer">Barrier Multilayer (EVOH, PVDC)</option>
                    <option value="Biodegradable">Biodegradable (PLA, PBAT, PBS)</option>
                    <option value="Foil / Metalized">Foil / Metalized (Alu Laminate)</option>
                    <option value="Bio-based / Paper">Bio-based / Paper (Kraft / Dispersion)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Layer Specification</label>
                  <input
                    type="text"
                    placeholder="e.g. 20µm BOPP / 2µm AlOx / 50µm CPP"
                    value={matStructure}
                    onChange={(e) => setMatStructure(e.target.value)}
                    className="w-full bg-[#f9faf7] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5 bg-[#f9faf7] p-3.5 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">OTR (cc/m²/day) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.01"
                    required
                    value={matOTR}
                    onChange={(e) => setMatOTR(Number(e.target.value))}
                    className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Oxygen barrier</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">WVTR (g/m²/day) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.01"
                    required
                    value={matWVTR}
                    onChange={(e) => setMatWVTR(Number(e.target.value))}
                    className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Moisture barrier</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Thickness (µm) *</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    required
                    value={matThickness}
                    onChange={(e) => setMatThickness(Number(e.target.value))}
                    className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Film gauge</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Seal Temp (°C)</label>
                  <input
                    type="number"
                    value={matSealTemp}
                    onChange={(e) => setMatSealTemp(Number(e.target.value))}
                    className="w-full bg-[#f9faf7] px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Sealability</label>
                  <select
                    value={matSealability}
                    onChange={(e) => setMatSealability(e.target.value as any)}
                    className="w-full bg-[#f9faf7] px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Cost/1k Packs ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={matCostPer1k}
                    onChange={(e) => setMatCostPer1k(Number(e.target.value))}
                    className="w-full bg-[#f9faf7] px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">CO2 (kg/kg)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={matCarbonIndex}
                    onChange={(e) => setMatCarbonIndex(Number(e.target.value))}
                    className="w-full bg-[#f9faf7] px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Recyclability Status</label>
                  <select
                    value={matRecyclability}
                    onChange={(e) => setMatRecyclability(e.target.value as any)}
                    className="w-full bg-[#f9faf7] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
                  >
                    <option value="Widely Recyclable">Widely Recyclable (Mono-Material)</option>
                    <option value="Specialty Recycled">Specialty Recycled</option>
                    <option value="Industrial Compostable">Industrial Compostable</option>
                    <option value="Home Compostable">Home Compostable</option>
                    <option value="Non-Recyclable">Non-Recyclable (Multi-Material Foil)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">MAP Suitability</label>
                  <select
                    value={matMAPSuitability}
                    onChange={(e) => setMatMAPSuitability(e.target.value as any)}
                    className="w-full bg-[#f9faf7] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
                  >
                    <option value="Recommended">Recommended</option>
                    <option value="Optional">Optional</option>
                    <option value="Not Recommended">Not Recommended</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Key Advantages</label>
                <input
                  type="text"
                  placeholder="e.g. Exceptional aroma seal, puncture resistance, low haze"
                  value={matAdvantages}
                  onChange={(e) => setMatAdvantages(e.target.value)}
                  className="w-full bg-[#f9faf7] px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Typical Food Applications</label>
                <input
                  type="text"
                  placeholder="e.g. Roasted nuts, potato chips, spices, ground coffee"
                  value={matApplications}
                  onChange={(e) => setMatApplications(e.target.value)}
                  className="w-full bg-[#f9faf7] px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>{editingMaterialId ? 'Save Material Specs' : 'Register Packaging Material'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
