/**
 * PackWise AI - Intelligent Food Packaging Decision Support System
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { RecommendationWizard } from './components/RecommendationWizard';
import { RecommendationResultView } from './components/RecommendationResultView';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { PackagingDoctor } from './components/PackagingDoctor';
import { ComparisonView } from './components/ComparisonView';
import { MaterialExplorer } from './components/MaterialExplorer';
import { SustainabilityView } from './components/SustainabilityView';
import { HistoryView } from './components/HistoryView';
import { DemoWalkthroughModal } from './components/DemoWalkthroughModal';
import { AboutModal } from './components/AboutModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AdminDataStudio } from './components/AdminDataStudio';
import {
  MLRecommendation,
  UserInputConditions,
  PackagingAlternative,
  Commodity,
  PackagingMaterial,
  RecommendationFeedback,
} from './types/packaging';
import { runPackagingRecommendationPipeline } from './ml/engine';
import { logUserGeneratedCandidate } from './services/trainingCandidatesService';
import { RotateCcw } from 'lucide-react';

// Pre-seeded initial recommendations so users immediately see rich, realistic historical data
const INITIAL_HISTORY: MLRecommendation[] = [
  runPackagingRecommendationPipeline({
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
  }),
  runPackagingRecommendationPipeline({
    commodityName: 'Fried Crispy Potato Chips',
    category: 'Snacks',
    moisture_percent: 1.8,
    pH: 5.8,
    fat_percent: 35.0,
    respiration_rate: 'None',
    respiration_mg_CO2_kg_hr: 0,
    storage_temperature_C: 24,
    relative_humidity_percent: 55,
    storage_type: 'Dry Storage',
    desired_shelf_life_days: 180,
    transportation_duration_days: 4,
  }),
  runPackagingRecommendationPipeline({
    commodityName: 'Fresh Dairy Paneer (Cottage Cheese)',
    category: 'Dairy',
    moisture_percent: 52,
    pH: 5.7,
    fat_percent: 24.0,
    respiration_rate: 'None',
    respiration_mg_CO2_kg_hr: 0,
    storage_temperature_C: 4,
    relative_humidity_percent: 85,
    storage_type: 'Chilled',
    desired_shelf_life_days: 14,
    transportation_duration_days: 2,
  }),
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMsmeMode, setIsMsmeMode] = useState<boolean>(false);
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // User Role: 'user' or 'admin'
  const [userRole, setUserRole] = useState<'user' | 'admin'>(() => {
    try {
      const saved = localStorage.getItem('packwise_user_role');
      if (saved === 'admin' || saved === 'user') return saved;
    } catch {}
    return 'admin'; // default to admin for instant access to newly requested features
  });

  // Total Training Rows: dynamically expands from 20k as Admin imports Excel/CSV data
  const [totalTrainingRows, setTotalTrainingRows] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('packwise_training_rows_count');
      if (saved) return Number(saved) || 20000;
    } catch {}
    return 20000;
  });

  // Save role to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('packwise_user_role', userRole);
    } catch {}
  }, [userRole]);

  // Save total training rows to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('packwise_training_rows_count', String(totalTrainingRows));
    } catch {}
  }, [totalTrainingRows]);

  // Sync total training rows with backend dataset stats on mount
  useEffect(() => {
    fetch('/api/admin/dataset-stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.totalTrainingRows && typeof data.totalTrainingRows === 'number') {
          setTotalTrainingRows((prev) => Math.max(prev, data.totalTrainingRows));
        }
      })
      .catch(() => {});
  }, []);

  // History of recommendations
  const [recommendationsHistory, setRecommendationsHistory] = useState<MLRecommendation[]>(() => {
    try {
      const saved = localStorage.getItem('packwise_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse history from localStorage', e);
    }
    return INITIAL_HISTORY;
  });

  // Current active recommendation
  const [currentRecommendation, setCurrentRecommendation] = useState<MLRecommendation | null>(
    recommendationsHistory[0] || null
  );

  // Toggle between wizard and result view in "recommend" tab
  const [isViewingResult, setIsViewingResult] = useState<boolean>(false);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('packwise_history', JSON.stringify(recommendationsHistory));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [recommendationsHistory]);

  // Handler when user executes ML prediction in wizard
  const handleGenerateRecommendation = (conditions: UserInputConditions) => {
    const newRec = runPackagingRecommendationPipeline(conditions);
    setCurrentRecommendation(newRec);
    setIsViewingResult(true);

    // Auto-save to history
    setRecommendationsHistory((prev) => [newRec, ...prev.filter((r) => r.id !== newRec.id)]);

    // Automated Logger in the recommendation pipeline: record unique user input as training row candidate
    logUserGeneratedCandidate(conditions, newRec).catch((err) =>
      console.warn('Auto-logging candidate error:', err)
    );
  };

  const handleSaveToHistory = (rec: MLRecommendation) => {
    setRecommendationsHistory((prev) => {
      if (prev.some((r) => r.id === rec.id)) return prev;
      return [rec, ...prev];
    });
  };

  const handleClearHistory = () => {
    setRecommendationsHistory([]);
    try {
      localStorage.removeItem('packwise_history');
    } catch (e) {}
  };

  const handleSelectFromHistory = (rec: MLRecommendation) => {
    setCurrentRecommendation(rec);
    setIsViewingResult(true);
    setActiveTab('recommend');
  };

  const handleUpdateRecommendationFeedback = (
    recId: string,
    feedback: RecommendationFeedback | undefined
  ) => {
    if (currentRecommendation && currentRecommendation.id === recId) {
      setCurrentRecommendation({
        ...currentRecommendation,
        userFeedback: feedback,
      });
    }

    setRecommendationsHistory((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, userFeedback: feedback } : r))
    );
  };

  const handleLaunchWhatIf = (rec?: MLRecommendation) => {
    if (rec) {
      setCurrentRecommendation(rec);
    }
    setActiveTab('whatif');
  };

  const handleApplySimulatedRec = (simRec: MLRecommendation) => {
    setCurrentRecommendation(simRec);
    handleSaveToHistory(simRec);
    setIsViewingResult(true);
    setActiveTab('recommend');
  };

  const handleSelectAlternative = (alt: PackagingAlternative) => {
    if (!currentRecommendation) return;
    const modifiedRec: MLRecommendation = {
      ...currentRecommendation,
      recommended_material: alt.material,
      packaging_structure: alt.structure,
      OTR_cc_m2_day: alt.OTR_cc_m2_day,
      WVTR_g_m2_day: alt.WVTR_g_m2_day,
      film_thickness_micron: alt.film_thickness_micron,
      sealability: alt.sealability,
      mechanical_strength_MPa: alt.mechanical_strength_MPa,
      predicted_shelf_life_days: alt.predicted_shelf_life_days,
      food_waste_risk_percent: alt.food_waste_risk_percent,
      packaging_environmental_score: alt.sustainability_score,
    };
    setCurrentRecommendation(modifiedRec);
    setIsViewingResult(true);
    setActiveTab('recommend');
  };

  const handleHeaderSelectCommodity = (comm: Commodity) => {
    const conditions: UserInputConditions = {
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
    handleGenerateRecommendation(conditions);
  };

  const handleHeaderSelectMaterial = () => {
    setActiveTab('materials');
  };

  return (
    <div className="flex h-screen bg-[#f5f7f3] text-slate-900 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Left Sidebar (Desktop fixed/collapsible + Mobile off-canvas drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'recommend' && !currentRecommendation) {
            setIsViewingResult(false);
          }
        }}
        historyCount={recommendationsHistory.length}
        onOpenDemo={() => setIsDemoOpen(true)}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        userRole={userRole}
        setUserRole={setUserRole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Sticky Header with Breadcrumbs, Tabs, Search, and MSME Mode */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMsmeMode={isMsmeMode}
          setIsMsmeMode={setIsMsmeMode}
          onOpenDemo={() => setIsDemoOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          onSelectCommodity={handleHeaderSelectCommodity}
          onSelectMaterial={handleHeaderSelectMaterial}
          userRole={userRole}
          setUserRole={setUserRole}
        />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-24 lg:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              recommendationsHistory={recommendationsHistory}
              onSelectRecommendation={handleSelectFromHistory}
              onOpenDemo={() => setIsDemoOpen(true)}
              isMsmeMode={isMsmeMode}
              totalTrainingRows={totalTrainingRows}
            />
          )}

          {activeTab === 'recommend' && (
            <>
              {isViewingResult && currentRecommendation ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsViewingResult(false)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Start New Commodity Evaluation</span>
                    </button>
                  </div>
                  <RecommendationResultView
                    recommendation={currentRecommendation}
                    setActiveTab={setActiveTab}
                    onLaunchWhatIf={() => handleLaunchWhatIf(currentRecommendation)}
                    onSaveToHistory={handleSaveToHistory}
                    isMsmeMode={isMsmeMode}
                    isSaved={recommendationsHistory.some((r) => r.id === currentRecommendation.id)}
                    onUpdateFeedback={handleUpdateRecommendationFeedback}
                  />
                </div>
              ) : (
                <RecommendationWizard
                  onGenerateRecommendation={handleGenerateRecommendation}
                  isMsmeMode={isMsmeMode}
                  totalTrainingRows={totalTrainingRows}
                  setTotalTrainingRows={setTotalTrainingRows}
                />
              )}
            </>
          )}

          {activeTab === 'whatif' && (
            <WhatIfSimulator
              initialRecommendation={currentRecommendation}
              onApplyNewRecommendation={handleApplySimulatedRec}
              isMsmeMode={isMsmeMode}
            />
          )}

          {activeTab === 'doctor' && <PackagingDoctor isMsmeMode={isMsmeMode} />}

          {activeTab === 'compare' && (
            <ComparisonView
              currentRecommendation={currentRecommendation}
              onSelectAlternative={handleSelectAlternative}
              onNavigateToWhatIf={() => setActiveTab('whatif')}
              isMsmeMode={isMsmeMode}
            />
          )}

          {activeTab === 'materials' && (
            <MaterialExplorer
              onNavigateToCompare={() => setActiveTab('compare')}
              onNavigateToWhatIf={() => setActiveTab('whatif')}
              onSelectCommodityForCompare={() => setActiveTab('compare')}
            />
          )}

          {activeTab === 'sustainability' && (
            <SustainabilityView recommendationsHistory={recommendationsHistory} />
          )}

          {activeTab === 'history' && (
            <HistoryView
              history={recommendationsHistory}
              onSelectRecommendation={handleSelectFromHistory}
              onClearHistory={handleClearHistory}
              setActiveTab={setActiveTab}
              onLaunchWhatIf={handleLaunchWhatIf}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDataStudio
              totalTrainingRows={totalTrainingRows}
              setTotalTrainingRows={setTotalTrainingRows}
              userRole={userRole}
              setUserRole={setUserRole}
            />
          )}

          {activeTab === 'about' && <AboutModal />}
        </main>

        {/* Mobile Thumb Bottom Navigation Bar */}
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'recommend' && !currentRecommendation) {
              setIsViewingResult(false);
            }
          }}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      </div>

      {/* 13-Step Platform Walkthrough Demo Modal */}
      <DemoWalkthroughModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'recommend') {
            setIsViewingResult(true);
          }
        }}
      />
    </div>
  );
}
