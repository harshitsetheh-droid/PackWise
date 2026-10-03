import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  SlidersHorizontal,
  Stethoscope,
  Menu,
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMobileMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {/* Dashboard */}
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
          activeTab === 'dashboard'
            ? 'text-emerald-800 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-emerald-700' : 'text-slate-400'}`} />
        <span>Home</span>
      </button>

      {/* New Rec */}
      <button
        onClick={() => setActiveTab('recommend')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
          activeTab === 'recommend'
            ? 'text-emerald-800 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Sparkles className={`w-4 h-4 ${activeTab === 'recommend' ? 'text-emerald-700' : 'text-slate-400'}`} />
        <span>Recommend</span>
      </button>

      {/* What-If Simulator (Center Hero Button) */}
      <button
        onClick={() => setActiveTab('whatif')}
        className="relative -mt-4 flex flex-col items-center group"
      >
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-transform group-active:scale-95 ${
            activeTab === 'whatif'
              ? 'bg-emerald-700 text-white ring-4 ring-emerald-100'
              : 'bg-emerald-800 text-white'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5 text-emerald-200" />
        </div>
        <span
          className={`text-[10px] mt-0.5 font-bold ${
            activeTab === 'whatif' ? 'text-emerald-900' : 'text-slate-600'
          }`}
        >
          What-If
        </span>
      </button>

      {/* Doctor */}
      <button
        onClick={() => setActiveTab('doctor')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
          activeTab === 'doctor'
            ? 'text-emerald-800 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Stethoscope className={`w-4 h-4 ${activeTab === 'doctor' ? 'text-emerald-700' : 'text-slate-400'}`} />
        <span>Doctor</span>
      </button>

      {/* More / Menu Drawer */}
      <button
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <Menu className="w-4 h-4 text-slate-400" />
        <span>More</span>
      </button>
    </nav>
  );
};
