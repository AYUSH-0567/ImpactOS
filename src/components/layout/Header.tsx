import React, { useState, useEffect } from 'react';
import { Region, DateRange, User } from '../../types';
import { dataService } from '../../services/dataService';
import { 
  Search, 
  Globe2, 
  Calendar, 
  Bell, 
  Menu,
  AlertTriangle,
  ChevronDown,
  ShieldAlert,
  LogOut,
  Building2,
  ShieldCheck,
  Settings,
  CheckCircle2,
  RotateCcw,
  Mail,
  X,
  Trash2
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  selectedRegion: Region;
  setSelectedRegion: (region: Region) => void;
  selectedDateRange: DateRange;
  setSelectedDateRange: (range: DateRange) => void;
  onOpenCommand: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onLogout: () => void;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  selectedRegion,
  setSelectedRegion,
  selectedDateRange,
  setSelectedDateRange,
  onOpenCommand,
  isMobileOpen,
  setIsMobileOpen,
  onLogout,
  onSelectTab
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  const fetchNotifications = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const res = await fetch(`${baseUrl}/notifications`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  // Trigger Automated Rule Alert Scanner
  const handleScanAlerts = async () => {
    setIsScanning(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      await fetch(`${baseUrl}/notifications/scan-alerts`, {
        method: 'POST',
        credentials: 'include'
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error scanning alerts:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Mark single as read
  const handleMarkRead = async (id: string) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      await fetch(`${baseUrl}/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  // Mark all read
  const handleMarkAllRead = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      await fetch(`${baseUrl}/notifications/mark-all-read`, {
        method: 'PUT',
        credentials: 'include'
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id: string) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      await fetch(`${baseUrl}/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const filteredNotifications = filterType === 'ALL'
    ? notifications
    : notifications.filter(n => n.type === filterType);

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between font-sans">
      {/* Left: Mobile Hamburger + Brand Logo + Global Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition md:hidden cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-teal-700 flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
            I
          </div>
          <span className="font-extrabold text-xs tracking-tight text-slate-900 leading-none">
            IMPACT<span className="text-teal-700">OS</span>
          </span>
        </div>

        <button
          onClick={onOpenCommand}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 text-xs w-36 sm:w-64 transition"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate text-[11px] sm:text-xs">Search metrics...</span>
          <kbd className="ml-auto hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono bg-white text-slate-500 rounded border border-slate-200">
            Ctrl+K
          </kbd>
        </button>

        <span className="hidden xl:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <ShieldAlert className="w-3 h-3 text-emerald-600" /> MULTI-TENANT ISOLATED DB
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Organization / Region Dropdown */}
        <div className="relative flex items-center hidden sm:flex">
          <Globe2 className="w-3.5 h-3.5 text-teal-700 absolute left-2.5 pointer-events-none" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as Region)}
            className="pl-8 pr-6 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 hover:border-slate-300 focus:outline-none focus:border-teal-600 transition appearance-none cursor-pointer"
          >
            <option value="All India">All India</option>
            <option value="North Region">North (DL/HR/UP)</option>
            <option value="West Region">West (MH/RJ)</option>
            <option value="East Region">East (BR/WB)</option>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
        </div>

        {/* Date Range Selector */}
        <div className="relative flex items-center hidden lg:flex">
          <Calendar className="w-3.5 h-3.5 text-sky-600 absolute left-2.5 pointer-events-none" />
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value as DateRange)}
            className="pl-8 pr-6 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 hover:border-slate-300 focus:outline-none focus:border-teal-600 transition appearance-none cursor-pointer"
          >
            <option value="This Month">June 2026</option>
            <option value="Last Month">May 2026</option>
            <option value="This Quarter">Q2 FY25-26</option>
            <option value="FY 2025-26">FY 2025-26</option>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
        </div>

        {/* NOTIFICATIONS POPOVER WITH UNREAD BADGE & DRAWER */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) fetchNotifications();
            }}
            className="relative p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition cursor-pointer"
            title="Notification Center"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-mono font-extrabold rounded-full bg-rose-600 text-white shadow-2xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-teal-700" />
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Notification Center ({unreadCount} Unread)
                  </h4>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleScanAlerts}
                    disabled={isScanning}
                    className="p-1 rounded hover:bg-slate-100 text-teal-700 transition cursor-pointer"
                    title="Scan DB Rule Alerts"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-teal-800 font-bold hover:underline cursor-pointer"
                  >
                    Mark All Read
                  </button>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto py-2 border-b border-slate-100 text-[10px] font-mono">
                {['ALL', 'GRANT_EXPIRY', 'BUDGET_THRESHOLD', 'VOLUNTEER_SHORTAGE', 'SECURITY_ALERT'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-2 py-0.5 rounded font-bold transition whitespace-nowrap cursor-pointer ${
                      filterType === type ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Notification Roster */}
              <div className="space-y-2 max-h-72 overflow-y-auto pt-2">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No notifications in registry.
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`p-3 rounded-xl border text-xs transition cursor-pointer relative ${
                        n.isRead
                          ? 'bg-slate-50/60 border-slate-100 text-slate-600'
                          : 'bg-teal-50/40 border-teal-200 font-semibold text-slate-900 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="font-extrabold block text-slate-900 text-xs flex items-center gap-1.5">
                            <AlertTriangle className={`w-3.5 h-3.5 ${
                              n.type === 'BUDGET_THRESHOLD' ? 'text-rose-600' :
                              n.type === 'GRANT_EXPIRY' ? 'text-amber-600' : 'text-teal-700'
                            }`} />
                            {n.title}
                          </span>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-sans">{n.message}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteNotification(n.id); }}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-100">
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold uppercase">{n.type}</span>
                        <span>{new Date(n.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Menu */}
        {currentUser && (
          <div className="relative border-l border-slate-200 pl-2 sm:pl-3 ml-0.5">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-800 hover:text-teal-800 transition focus:outline-none cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <span className="font-bold text-slate-900 block leading-none">{currentUser.name}</span>
                <span className="text-[9px] text-teal-800 font-mono block mt-0.5">{currentUser.role.replace('_', ' ')}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 text-xs space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-900 block">{currentUser.name}</span>
                  <span className="text-[11px] text-slate-500 block truncate">{currentUser.email}</span>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 px-1 py-1 space-y-1 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 py-1">
                    <Building2 className="w-3.5 h-3.5 text-teal-700" />
                    <span className="truncate font-semibold">{currentUser.organizationName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 py-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tenant ID: <strong className="font-mono text-slate-700">{currentUser.organizationId}</strong></span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-1 space-y-0.5">
                  <button
                    onClick={() => {
                      onSelectTab('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2 font-semibold transition cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" /> System Settings
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-700 flex items-center gap-2 font-bold transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
