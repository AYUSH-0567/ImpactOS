import React, { useState, useEffect } from 'react';
import { Region, DateRange, Project, Donor, ProgramCategory, User } from './types';
import { dataService } from './services/dataService';
import { AuthService } from './services/authService';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { ProjectDetailDrawer } from './components/details/ProjectDetailDrawer';
import { CreateProjectModal } from './components/ui/CreateProjectModal';
import { CreateDonationModal } from './components/ui/CreateDonationModal';
import { CreateEventModal } from './components/ui/CreateEventModal';
import { ToastContainer, ToastMessage } from './components/ui/Toast';
import { LoginPage } from './components/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Views
// Lazy Loaded Views
const ExecutiveOverview = React.lazy(() => import('./components/views/ExecutiveOverview').then(m => ({ default: m.ExecutiveOverview })));
const ProjectAnalytics = React.lazy(() => import('./components/views/ProjectAnalytics').then(m => ({ default: m.ProjectAnalytics })));
const BeneficiaryAnalytics = React.lazy(() => import('./components/views/BeneficiaryAnalytics').then(m => ({ default: m.BeneficiaryAnalytics })));
const DonationAnalytics = React.lazy(() => import('./components/views/DonationAnalytics').then(m => ({ default: m.DonationAnalytics })));
const VolunteerAnalytics = React.lazy(() => import('./components/views/VolunteerAnalytics').then(m => ({ default: m.VolunteerAnalytics })));
const FinanceAnalytics = React.lazy(() => import('./components/views/FinanceAnalytics').then(m => ({ default: m.FinanceAnalytics })));
const ImpactAnalytics = React.lazy(() => import('./components/views/ImpactAnalytics').then(m => ({ default: m.ImpactAnalytics })));
const AiInsightsView = React.lazy(() => import('./components/views/AiInsightsView').then(m => ({ default: m.AiInsightsView })));
const ReportsView = React.lazy(() => import('./components/views/ReportsView').then(m => ({ default: m.ReportsView })));
const SettingsView = React.lazy(() => import('./components/views/SettingsView').then(m => ({ default: m.SettingsView })));
const DataImportView = React.lazy(() => import('./components/views/DataImportView').then(m => ({ default: m.DataImportView })));
const PublicWebsite = React.lazy(() => import('./components/public/PublicWebsite').then(m => ({ default: m.PublicWebsite })));

export function App() {
  const [viewPublicWebsite, setViewPublicWebsite] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const session = AuthService.getSession();
    return session ? session.user : null;
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Global state sourced through multi-tenant dataService layer
  const [projects, setProjects] = useState<Project[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Global filters
  const [selectedRegion, setSelectedRegion] = useState<Region>('All India');
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('This Month');

  // Command palette, modals, & drawer state
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState<boolean>(false);
  const [isCreateDonationOpen, setIsCreateDonationOpen] = useState<boolean>(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState<boolean>(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Check active HttpOnly session cookie on mount
  useEffect(() => {
    async function initSession() {
      const activeUser = await AuthService.checkAuthSession();
      if (activeUser) {
        setCurrentUser(activeUser);
      } else {
        const session = AuthService.getSession();
        if (session) setCurrentUser(session.user);
      }
    }
    initSession();
  }, []);

  // Load data via dataService interface whenever active user / session changes
  useEffect(() => {
    if (!currentUser) return;

    async function loadInitialData() {
      try {
        const p = await dataService.getProjects();
        const d = await dataService.getDonors();
        const ev = await dataService.getVolunteerEvents();
        setProjects(p);
        setDonors(d);
        setEvents(ev);
      } catch (err: any) {
        addToast('error', 'Data Load Warning', err.message || 'Error fetching records');
      }
    }
    loadInitialData();
  }, [currentUser]);

  const activeProject = projects.find(p => p.id === selectedProjectId) || null;

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab('overview');
    addToast('success', 'Authenticated Workspace Loaded', `Welcome back, ${user.name} (${user.role.replace('_', ' ')})`);
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setCurrentUser(null);
    addToast('info', 'Logged Out', 'Your session has ended.');
  };

  const handleAddProject = async (newProject: Project) => {
    try {
      const added = await dataService.addProject(newProject);
      setProjects(prev => [added, ...prev]);
      addToast('success', 'Project Initialized', `"${added.name}" registered in ${added.state}.`);
    } catch (err: any) {
      addToast('error', 'Failed to Add Project', err.message);
    }
  };

  const handleAddDonor = async (newDonor: Donor) => {
    try {
      const added = await dataService.addDonor(newDonor);
      setDonors(prev => [added, ...prev]);
      addToast('success', 'Grant Recorded', `₹${(added.totalDonated / 100000).toFixed(1)} Lakhs contribution recorded from ${added.name}.`);
    } catch (err: any) {
      addToast('error', 'Failed to Record Grant', err.message);
    }
  };

  const handleAddEvent = async (evtData: { title: string; date: string; location: string; volunteers: number; program: ProgramCategory }) => {
    try {
      const newEvt = {
        id: `EVT-${Date.now()}`,
        organizationId: currentUser?.organizationId || 'org-impactos-01',
        title: evtData.title,
        location: evtData.location,
        date: evtData.date,
        program: evtData.program,
        volunteersAssigned: evtData.volunteers,
        hoursSpent: evtData.volunteers * 8,
        status: 'Upcoming' as const
      };
      const added = await dataService.addVolunteerEvent(newEvt);
      setEvents(prev => [added, ...prev]);
      addToast('success', 'Mobilization Scheduled', `"${added.title}" planned for ${added.date} in ${added.location}.`);
    } catch (err: any) {
      addToast('error', 'Failed to Schedule Drive', err.message);
    }
  };

  if (viewPublicWebsite) {
    return <PublicWebsite onLaunchApp={() => setViewPublicWebsite(false)} />;
  }

  // Render Login Page if unauthenticated
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onOpenMarketing={() => setViewPublicWebsite(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#f6f5ff] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col antialiased">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 pl-0 ${
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-60'
        }`}
      >
        {/* Header */}
        <Header
          currentUser={currentUser}
          selectedRegion={selectedRegion}
          setSelectedRegion={(region) => {
            setSelectedRegion(region);
            addToast('info', 'Region Filter Updated', `Viewing metrics for ${region}`);
          }}
          selectedDateRange={selectedDateRange}
          setSelectedDateRange={(range) => {
            setSelectedDateRange(range);
            addToast('info', 'Date Window Updated', `Filtering for ${range}`);
          }}
          onOpenCommand={() => setIsCommandOpen(true)}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          onLogout={handleLogout}
          onSelectTab={setActiveTab}
        />

        {/* Content Body with Protected Route Boundary */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">
          <React.Suspense fallback={<div className="p-12 text-center text-xs font-mono text-slate-400">Loading requested module...</div>}>
          {activeTab === 'overview' && (
            <ProtectedRoute requiredPermission="view:dashboard" onRedirectToLogin={handleLogout}>
              <ExecutiveOverview
                projects={projects}
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
                selectedDateRange={selectedDateRange}
                onSelectProject={(id) => setSelectedProjectId(id)}
              />
            </ProtectedRoute>
          )}

          {activeTab === 'projects' && (
            <ProtectedRoute requiredPermission="view:projects" onRedirectToLogin={handleLogout}>
              <ProjectAnalytics />
            </ProtectedRoute>
          )}

          {activeTab === 'beneficiaries' && (
            <ProtectedRoute requiredPermission="view:projects" onRedirectToLogin={handleLogout}>
              <BeneficiaryAnalytics />
            </ProtectedRoute>
          )}
          
          {activeTab === 'donations' && (
            <ProtectedRoute requiredPermission="view:donations" onRedirectToLogin={handleLogout}>
              <DonationAnalytics />
            </ProtectedRoute>
          )}

          {activeTab === 'volunteers' && (
            <ProtectedRoute requiredPermission="view:volunteers" onRedirectToLogin={handleLogout}>
              <VolunteerAnalytics />
            </ProtectedRoute>
          )}

          {activeTab === 'finance' && (
            <ProtectedRoute requiredPermission="view:finance" onRedirectToLogin={handleLogout}>
              <FinanceAnalytics />
            </ProtectedRoute>
          )}

          {activeTab === 'impact' && (
            <ProtectedRoute requiredPermission="view:dashboard" onRedirectToLogin={handleLogout}>
              <ImpactAnalytics />
            </ProtectedRoute>
          )}

          {activeTab === 'ai-insights' && (
            <ProtectedRoute requiredPermission="view:ai_insights" onRedirectToLogin={handleLogout}>
              <AiInsightsView />
            </ProtectedRoute>
          )}

          {activeTab === 'reports' && (
            <ProtectedRoute requiredPermission="view:reports" onRedirectToLogin={handleLogout}>
              <ReportsView />
            </ProtectedRoute>
          )}

          {activeTab === 'data-import' && (
            <ProtectedRoute requiredPermission="admin:import" onRedirectToLogin={handleLogout}>
              <DataImportView onNotify={addToast} onNavigateToTab={setActiveTab} />
            </ProtectedRoute>
          )}

          {activeTab === 'settings' && (
            <ProtectedRoute requiredPermission="view:dashboard" onRedirectToLogin={handleLogout}>
              <SettingsView />
            </ProtectedRoute>
          )}
          </React.Suspense>
        </main>
      </div>

      {/* Slide-over Project Detail Drawer */}
      <ProjectDetailDrawer
        project={activeProject}
        onClose={() => setSelectedProjectId(null)}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onAddProject={handleAddProject}
      />

      {/* Record Donation Modal */}
      <CreateDonationModal
        isOpen={isCreateDonationOpen}
        onClose={() => setIsCreateDonationOpen(false)}
        onAddDonor={handleAddDonor}
      />

      {/* Mobilization Drive Modal */}
      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onAddEvent={handleAddEvent}
      />

      {/* Ctrl+K Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onSelectProject={(id) => setSelectedProjectId(id)}
      />

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}

export default App;
