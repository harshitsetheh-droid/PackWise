import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Sprout,
  Sparkles,
  FlaskConical,
  Menu,
  X,
  Package,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { Commodity, PackagingMaterial } from '../types/packaging';
import { COMMODITIES_DATABASE } from '../data/commodities';
import { PACKAGING_MATERIALS } from '../data/materials';
import { useDebounce } from '../hooks/useDebounce';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMsmeMode: boolean;
  setIsMsmeMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  onOpenDemo: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onToggleMobileMenu?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
  onSelectCommodity?: (commodity: Commodity) => void;
  onSelectMaterial?: (material: PackagingMaterial) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isMsmeMode,
  setIsMsmeMode,
  onOpenDemo,
  searchQuery,
  setSearchQuery,
  onToggleMobileMenu,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
  onSelectCommodity,
  onSelectMaterial,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce the search query by 180ms for optimal keystroke performance
  const debouncedQuery = useDebounce<string>(searchQuery.trim().toLowerCase(), 180);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter commodity suggestions using debounced query
  const matchingCommodities = useMemo(() => {
    if (!debouncedQuery) return [];
    return COMMODITIES_DATABASE.filter(
      (c) =>
        c.name.toLowerCase().includes(debouncedQuery) ||
        c.category.toLowerCase().includes(debouncedQuery) ||
        c.primary_spoilage_factors.some((f) => f.toLowerCase().includes(debouncedQuery))
    ).slice(0, 5);
  }, [debouncedQuery]);

  // Filter packaging material suggestions using debounced query
  const matchingMaterials = useMemo(() => {
    if (!debouncedQuery) return [];
    return PACKAGING_MATERIALS.filter(
      (m) =>
        m.name.toLowerCase().includes(debouncedQuery) ||
        m.structure_layers.toLowerCase().includes(debouncedQuery) ||
        m.code.toLowerCase().includes(debouncedQuery) ||
        m.category.toLowerCase().includes(debouncedQuery) ||
        m.typical_applications.some((app) => app.toLowerCase().includes(debouncedQuery))
    ).slice(0, 4);
  }, [debouncedQuery]);

  const hasSuggestions = matchingCommodities.length > 0 || matchingMaterials.length > 0;

  const handleCommodityClick = (comm: Commodity) => {
    setIsOpen(false);
    setSearchQuery('');
    if (onSelectCommodity) {
      onSelectCommodity(comm);
    } else {
      setActiveTab('compare');
    }
  };

  const handleMaterialClick = (mat: PackagingMaterial) => {
    setIsOpen(false);
    setSearchQuery('');
    if (onSelectMaterial) {
      onSelectMaterial(mat);
    } else {
      setActiveTab('materials');
    }
  };

  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Overview & Decision Hub';
      case 'recommend':
        return 'Recommendation Engine';
      case 'whatif':
        return 'What-If Simulator (USP)';
      case 'doctor':
        return 'Packaging Doctor';
      case 'compare':
        return 'Trade-off Matrix';
      case 'materials':
        return 'Materials Explorer';
      case 'sustainability':
        return 'Food Waste vs Packaging';
      case 'history':
        return 'History & Archive';
      case 'about':
        return 'Specs & Architecture';
      default:
        return 'PackWise AI';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#e1e7dc] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left Section: Mobile Menu Button, Sidebar Toggle & Left-Shifted Search Bar */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        {isSidebarCollapsed && (
          <button
            onClick={onToggleSidebarCollapse}
            className="hidden lg:flex p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0"
            title="Expand Sidebar"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        )}

        {/* Search Bar shifted to left */}
        <div className="hidden sm:flex items-center flex-1 max-w-md relative" ref={containerRef}>
          <Search className="w-4 h-4 text-emerald-700 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => {
              if (searchQuery.trim().length > 0) setIsOpen(true);
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsOpen(false);
              }
            }}
            placeholder="Search foods, commodities, or packaging materials..."
            className="w-full bg-[#f9faf7] hover:bg-[#f3f6f0] focus:bg-white text-xs font-semibold pl-10 pr-8 py-2 rounded-xl border border-[#e1e7dc] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsOpen(false);
              }}
              className="absolute right-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 p-0.5"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

        {/* Floating Debounced Autocomplete Suggestions Menu */}
        {isOpen && debouncedQuery.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[80vh] flex flex-col animate-in fade-in duration-100 divide-y divide-slate-100">
            <div className="bg-slate-50 px-3.5 py-2 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">
                Suggestions for "{debouncedQuery}"
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Debounced Real-time Match
              </span>
            </div>

            <div className="overflow-y-auto max-h-96 divide-y divide-slate-100">
              {matchingCommodities.length > 0 && (
                <div className="py-2">
                  <div className="px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <span>🍏</span>
                    <span>Food Commodities ({matchingCommodities.length})</span>
                  </div>
                  <div className="mt-1">
                    {matchingCommodities.map((comm) => (
                      <button
                        key={comm.id}
                        onClick={() => handleCommodityClick(comm)}
                        className="w-full text-left px-3.5 py-2 hover:bg-emerald-50/70 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                            {comm.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 truncate block">
                              {comm.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {comm.category} • Moisture {comm.moisture_percent}% • pH {comm.pH}
                            </span>
                          </div>
                        </div>
                        <span className="text-emerald-700 text-xs font-bold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <span>Evaluate</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchingMaterials.length > 0 && (
                <div className="py-2">
                  <div className="px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-teal-600" />
                    <span>Packaging Materials ({matchingMaterials.length})</span>
                  </div>
                  <div className="mt-1">
                    {matchingMaterials.map((mat) => (
                      <button
                        key={mat.id}
                        onClick={() => handleMaterialClick(mat)}
                        className="w-full text-left px-3.5 py-2 hover:bg-teal-50/70 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                            <Package className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 group-hover:text-teal-950 truncate">
                                {mat.name}
                              </span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                                {mat.code}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                              <span>{mat.structure_layers}</span>
                            </div>
                          </div>
                        </div>

                        <span className="text-teal-700 text-xs font-bold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <span>Explore</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!hasSuggestions && (
                <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                  <p className="font-bold text-slate-800">
                    No matching food or packaging found for "{debouncedQuery}"
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Try typing "BOPP", "Strawberries", "Potato", "Mono-PE", "EVOH", or "Paneer"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* MSME / Small Farmer Mode Toggle */}
        <button
          onClick={() => setIsMsmeMode((prev) => !prev)}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            isMsmeMode
              ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
              : 'bg-[#f9faf7] text-slate-600 border-[#e1e7dc] hover:bg-slate-100'
          }`}
          title="Toggle plain-language explanations for farmers and MSMEs"
        >
          <Sprout className={`w-3.5 h-3.5 ${isMsmeMode ? 'text-amber-600' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">MSME Mode</span>
          <span className="sm:hidden">MSME</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
              isMsmeMode ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-500'
            }`}
          >
            {isMsmeMode ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Demo Mode Trigger */}
        <button
          onClick={onOpenDemo}
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden md:inline">Demo Walkthrough</span>
          <span className="md:hidden">Demo</span>
        </button>

        {/* Quick Launch Button */}
        <button
          onClick={() => setActiveTab('recommend')}
          className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold px-3 sm:px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
          <span className="font-bold whitespace-nowrap">New Recommendation</span>
        </button>
      </div>
    </header>
  );
};
