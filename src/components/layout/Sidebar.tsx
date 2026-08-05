import React, { useState, useEffect, useRef } from 'react';
import { AuthService, Permission } from '../../services/authService';
import { dataService } from '../../services/dataService';
import { formatNumber } from '../../utils/formatters';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  UserCheck, 
  HeartHandshake, 
  IndianRupee, 
  Sparkles, 
  BrainCircuit, 
  FileText, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  Database,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const touchStartXRef = useRef<number | null>(null);

  // Dynamic Database Badge Counts
  const [counts, setCounts] = useState<{
    projects: number;
    beneficiaries: number;
    volunteers: number;
    donors: number;
    orgName: string;
  }>({
    projects: 0,
    beneficiaries: 0,
    volunteers: 0,
    donors: 0,
    orgName: 'ImpactOS Workspace'
  });

  const fetchDynamicCounts = async () => {
    try {
      const kpiData = await dataService.getDashboardKPIs();
      const m = kpiData?.metrics;
      if (m) {
        setCounts({
          projects: m.totalProjectsCount || 0,
          beneficiaries: m.totalBeneficiariesReached || 0,
          volunteers: m.activeVolunteersCount || 0,
          donors: m.activeDonorsCount || 0,
          orgName: kpiData.organizationName || 'ImpactOS Workspace'
        });
      }
    } catch (err) {
      console.error('Error loading sidebar dynamic database counts:', err);
    }
  };

  useEffect(() => {
    fetchDynamicCounts();
  }, [activeTab]);

  // Close mobile drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, setIsMobileOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  // Touch Swipe-Left to Close Handler
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchStartXRef.current;
    if (deltaX < -60) {
      setIsMobileOpen(false);
      touchStartXRef.current = null;
    }
  };

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  const sections: { 
    title: string; 
    items: { 
      id: string; 
      label: string; 
      icon: any; 
      permission?: Permission; 
      badge?: string; 
      highlight?: boolean 
    }[] 
  }[] = [
    {
      title: 'Overview',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, permission: 'view:dashboard' }
      ]
    },
    {
      title: 'Programs',
      items: [
        { 
          id: 'projects', 
          label: 'Projects', 
          icon: Briefcase, 
          permission: 'view:projects', 
          badge: counts.projects > 0 ? formatNumber(counts.projects) : '0' 
        },
        { 
          id: 'beneficiaries', 
          label: 'Beneficiaries', 
          icon: Users, 
          permission: 'view:projects', 
          badge: counts.beneficiaries > 0 ? formatNumber(counts.beneficiaries) : '0' 
        },
        { 
          id: 'volunteers', 
          label: 'Volunteers', 
          icon: UserCheck, 
          permission: 'view:volunteers', 
          badge: counts.volunteers > 0 ? formatNumber(counts.volunteers) : '0' 
        }
      ]
    },
    {
      title: 'Finance',
      items: [
        { 
          id: 'donations', 
          label: 'Funding & Donors', 
          icon: HeartHandshake, 
          permission: 'view:donations', 
          badge: counts.donors > 0 ? formatNumber(counts.donors) : '0' 
        },
        { id: 'finance', label: 'Expenses & Budget', icon: IndianRupee, permission: 'view:finance' }
      ]
    },
    {
      title: 'Impact',
      items: [
        { id: 'impact', label: 'Impact Analytics', icon: Sparkles, permission: 'view:dashboard', highlight: true },
        { id: 'ai-insights', label: 'AI Insights', icon: BrainCircuit, permission: 'view:ai_insights', badge: 'AI' }
      ]
    },
    {
      title: 'Reporting',
      items: [
        { id: 'reports', label: 'Reports', icon: FileText, permission: 'view:reports' }
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'data-import', label: 'Data Import', icon: Database, permission: 'admin:import' },
        { id: 'settings', label: 'Settings', icon: Settings, permission: 'view:dashboard' }
      ]
    }
  ];

  const renderNavContent = (isMobile: boolean = false) => (
    <div className="flex flex-col justify-between h-full font-sans">
      <div>
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-200">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white font-extrabold text-sm shadow-xs flex-shrink-0">
              I
            </div>
            {(!collapsed || isMobile) && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-slate-900 leading-none">
                  IMPACT<span className="text-teal-700">OS</span>
                </span>
                <span className="text-[9px] text-slate-500 font-mono tracking-wider mt-0.5 uppercase">
                  Data Platform
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition hidden md:block cursor-pointer"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}

          {/* Mobile Close X Button */}
          {isMobile && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
          {sections.map((section) => {
            const visibleItems = section.items.filter(
              item => !item.permission || AuthService.hasPermission(item.permission)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                {(!collapsed || isMobile) && (
                  <h3 className="px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      title={(collapsed && !isMobile) ? item.label : undefined}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all group cursor-pointer ${
                        isActive
                          ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isActive
                              ? 'text-teal-700'
                              : item.highlight
                              ? 'text-teal-600'
                              : 'text-slate-500 group-hover:text-slate-800'
                          }`}
                        />
                        {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
                      </div>

                      {(!collapsed || isMobile) && item.badge && (
                        <span
                          className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded ${
                            item.badge === 'AI'
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Org Badge */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        {(!collapsed || isMobile) ? (
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 truncate">
              <Building className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
              <span className="truncate font-bold text-slate-800">{counts.orgName}</span>
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          </div>
        ) : (
          <div className="flex justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP SIDEBAR (Fixed left, visible on md: and above) */}
      <aside
        className={`hidden md:flex flex-col justify-between fixed top-0 left-0 z-40 h-screen bg-white border-r border-slate-200 transition-all duration-300 font-sans ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {renderNavContent(false)}
      </aside>

      {/* 2. MOBILE OFF-CANVAS BACKDROP */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 md:hidden animate-in fade-in"
        />
      )}

      {/* 3. MOBILE OFF-CANVAS DRAWER (Slides in from left, visible on < md) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderNavContent(true)}
      </div>
    </>
  );
};
