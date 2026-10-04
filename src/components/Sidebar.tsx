import React, { useState } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  SlidersHorizontal,
  Scale,
  PackageSearch,
  Leaf,
  Stethoscope,
  History,
  HelpCircle,
  ChevronDown,
  Building2,
  X,
  Database,
  ShieldCheck,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'recommend'
  | 'whatif'
  | 'compare'
  | 'materials'
  | 'sustainability'
  | 'doctor'
  | 'history'
  | 'about'
  | 'admin';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  historyCount: number;
  onOpenDemo: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  userRole?: 'user' | 'admin';
  setUserRole?: (role: 'user' | 'admin') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  historyCount,
  onOpenDemo,
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  userRole = 'user',
  setUserRole,
}) => {
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'recommend' as ActiveTab,
      label: 'New recommendation',
      icon: Sparkles,
    },
    {
      id: 'whatif' as ActiveTab,
      label: 'What-If simulator',
      icon: SlidersHorizontal,
    },
    {
      id: 'compare' as ActiveTab,
      label: 'Compare options',
      icon: Scale,
    },
    {
      id: 'materials' as ActiveTab,
      label: 'Explore materials',
      icon: PackageSearch,
    },
    {
      id: 'sustainability' as ActiveTab,
      label: 'Sustainability',
      icon: Leaf,
    },
    {
      id: 'doctor' as ActiveTab,
      label: 'Packaging Doctor',
      icon: Stethoscope,
    },
    {
      id: 'admin' as ActiveTab,
      label: 'Admin Studio',
      icon: Database,
      badge: userRole === 'admin' ? 'Admin' : 'Import',
    },
    {
      id: 'history' as ActiveTab,
      label: 'My history',
      icon: History,
      badge: historyCount > 0 ? historyCount : undefined,
    },
  ];

  const handleNavClick = (id: ActiveTab) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#f4f7f2] border-r border-[#e1e7dc] flex flex-col justify-between h-screen shrink-0 select-none transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'w-72 lg:w-64'}`}
      >
        <div>
          {/* Brand Logo & Collapse Toggle Button matching image.png */}
          <div className="h-16 px-4 sm:px-5 flex items-center justify-between border-b border-[#e1e7dc]">
            <div
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer min-w-0"
            >
              <div className="w-8 h-8 rounded-xl bg-[#143d2b] flex items-center justify-center text-white shrink-0 shadow-xs">
                <Leaf className="w-4 h-4 text-emerald-300" />
              </div>
              {!isCollapsed && (
                <span className="font-black text-xl tracking-tight text-[#143d2b]">
                  packwise
                </span>
              )}
            </div>

            {/* Mobile Close Button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#e5ece2] cursor-pointer"
                aria-label="Close Sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Decision Workspace Selector Card matching image.png */}
          {!isCollapsed ? (
            <div className="p-3">
              <div
                onClick={() => setIsWorkspaceMenuOpen((prev) => !prev)}
                className="p-2.5 rounded-xl border border-[#e1e7dc] hover:border-emerald-400 bg-white shadow-2xs transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-xs font-bold text-slate-900 truncate">Decision workspace</div>
                    <div className="text-[10px] text-slate-400 truncate">Prototype · local history</div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
              </div>

              {isWorkspaceMenuOpen && (
                <div className="mt-1 p-2 bg-white rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5 animate-in fade-in duration-100">
                  <div className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Role:</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (setUserRole) setUserRole(userRole === 'admin' ? 'user' : 'admin');
                      }}
                      className="font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {userRole === 'admin' ? (
                        <>
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Admin Active</span>
                        </>
                      ) : (
                        <span>Switch to Admin</span>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setIsWorkspaceMenuOpen(false);
                      handleNavClick('admin');
                    }}
                    className="w-full text-left p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-900 font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Admin Dataset Studio</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsWorkspaceMenuOpen(false);
                      onOpenDemo();
                    }}
                    className="w-full text-left p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-900 font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🚀 Launch Demo Walkthrough</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsWorkspaceMenuOpen(false);
                      handleNavClick('history');
                    }}
                    className="w-full text-left p-1.5 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>📂 Browse Saved History</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 flex justify-center">
              <div
                onClick={() => onToggleCollapse && onToggleCollapse()}
                className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center cursor-pointer shadow-2xs"
                title="Decision workspace"
              >
                <Building2 className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Section Heading: WORKSPACE */}
          {!isCollapsed && (
            <div className="px-5 pt-2 pb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Workspace
              </span>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="px-2.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={item.label}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center py-2.5 px-0' : 'justify-between px-3 py-2.5'
                  } rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#e2ece0] text-[#143d2b] font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-[#eaf0e7] hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#143d2b]' : 'text-slate-500'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge !== undefined && (
                    <span className="text-[10px] font-extrabold bg-[#143d2b] text-white px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer matching image.png */}
        <div className="p-3 sm:p-4 border-t border-[#e1e7dc] space-y-2">
          {!isCollapsed ? (
            <>
              <div className="p-2.5 rounded-xl bg-white border border-[#e1e7dc] shadow-2xs space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Model online</span>
                </div>
                <div className="text-[10px] text-slate-400 pl-3.5 truncate">
                  Version packaging-recommendation-v1
                </div>
              </div>

              <button
                onClick={() => handleNavClick('about')}
                className="w-full flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-1.5 rounded-lg hover:bg-[#eaf0e7] transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span>About this prototype</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Model online"></span>
              <button
                onClick={() => handleNavClick('about')}
                className="p-2 text-slate-400 hover:text-slate-700"
                title="About this prototype"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
