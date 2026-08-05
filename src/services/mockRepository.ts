import { IDataRepository, ImportSummary } from './repository.interface';
import { 
  Project, 
  Donor, 
  Volunteer, 
  VolunteerEvent, 
  AiInsight, 
  Region, 
  StateImpact 
} from '../types';
import { 
  INITIAL_PROJECTS, 
  MOCK_DONORS, 
  MOCK_VOLUNTEERS, 
  STATE_IMPACT_DATA, 
  AI_INSIGHTS 
} from '../data/mockData';
import { AuthService } from './authService';
import { AuditLogger } from './auditLogger';

export class MockRepository implements IDataRepository {
  public readonly isMockData = true;

  private projects: Project[] = [...INITIAL_PROJECTS];
  private donors: Donor[] = [...MOCK_DONORS];
  private volunteers: Volunteer[] = [...MOCK_VOLUNTEERS];
  private events: VolunteerEvent[] = [
    { id: 'EVT-01', organizationId: 'org-impactos-01', title: 'Gurugram Rural STEM Workshop', location: 'Gurugram, HR', date: '2025-12-05', program: 'Education', volunteersAssigned: 18, hoursSpent: 144, status: 'Upcoming' },
    { id: 'EVT-02', organizationId: 'org-impactos-01', title: 'Varanasi Health Screening Drive', location: 'Varanasi, UP', date: '2025-11-28', program: 'Healthcare', volunteersAssigned: 24, hoursSpent: 192, status: 'Completed' },
    { id: 'EVT-03', organizationId: 'org-impactos-01', title: 'Jaipur SHG Artisan Exhibition', location: 'Jaipur, RJ', date: '2025-11-15', program: 'Women Empowerment', volunteersAssigned: 12, hoursSpent: 96, status: 'Completed' },
    { id: 'EVT-04', organizationId: 'org-impactos-01', title: 'Patna Girls School Mentorship', location: 'Patna, BR', date: '2025-11-10', program: 'Education', volunteersAssigned: 15, hoursSpent: 120, status: 'Completed' }
  ];

  /**
   * Helper enforcing organization-level multi-tenant tenant isolation
   */
  private getTenantOrgId(): string {
    const orgId = AuthService.getUserOrganizationId();
    return orgId || 'org-impactos-01'; // Default tenant in dev
  }

  async getProjects(region?: Region): Promise<Project[]> {
    const tenantId = this.getTenantOrgId();
    let tenantProjects = this.projects.filter(p => p.organizationId === tenantId);

    if (!region || region === 'All India') return [...tenantProjects];

    return tenantProjects.filter(p => {
      if (region === 'North Region') return ['Haryana', 'Delhi', 'Uttar Pradesh'].includes(p.state);
      if (region === 'West Region') return ['Rajasthan', 'Maharashtra'].includes(p.state);
      if (region === 'East Region') return ['Bihar'].includes(p.state);
      return true;
    });
  }

  async getProjectById(id: string): Promise<Project | null> {
    const tenantId = this.getTenantOrgId();
    const proj = this.projects.find(p => p.id === id);

    // IDOR / BOLA Prevention Check: Verify resource belongs to active user's organization
    if (proj && proj.organizationId !== tenantId) {
      AuditLogger.log({
        eventType: 'ACCESS_DENIED',
        userId: AuthService.getSession()?.user.id || 'unknown',
        userRole: AuthService.getSession()?.user.role || 'NONE',
        action: 'IDOR_CROSS_TENANT_ACCESS_BLOCKED',
        resource: `/projects/${id}`,
        status: 'BLOCKED',
        details: `User attempted cross-tenant access to project ${id} belonging to org ${proj.organizationId}`
      });
      throw new Error('Access Denied: Resource belongs to another organization tenant.');
    }

    return proj || null;
  }

  async addProject(project: Project): Promise<Project> {
    const tenantId = this.getTenantOrgId();
    const scopedProject: Project = {
      ...project,
      organizationId: tenantId
    };

    this.projects = [scopedProject, ...this.projects];

    AuditLogger.log({
      eventType: 'RECORD_CREATE',
      userId: AuthService.getSession()?.user.id || 'admin',
      userRole: AuthService.getSession()?.user.role || 'ADMINISTRATOR',
      action: 'PROJECT_CREATE',
      resource: `/projects/${scopedProject.id}`,
      status: 'SUCCESS',
      details: `Project "${scopedProject.name}" created for tenant ${tenantId}`
    });

    return scopedProject;
  }

  async createProject(data: Partial<Project>): Promise<Project> {
    const tenantId = this.getTenantOrgId();
    const newProject: Project = {
      id: `prj-${Date.now()}`,
      organizationId: tenantId,
      projectCode: data.projectCode || `PRJ-2026-DEL-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name || 'New Project',
      category: data.category || 'Education',
      state: data.state || 'Delhi',
      district: data.district || 'Central Delhi',
      lead: data.lead || 'Program Manager',
      budget: data.budget || 5000000,
      spent: data.spent || 0,
      progress: data.progress || 0,
      beneficiariesTarget: data.beneficiariesTarget || 1000,
      beneficiariesReached: data.beneficiariesReached || 0,
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date().toISOString(),
      status: data.status || 'On Track',
      risk: data.risk || 'Low',
      description: data.description || 'Field initiative.'
    };

    this.projects = [newProject, ...this.projects];
    return newProject;
  }

  async deleteProject(id: string): Promise<{ success: boolean }> {
    this.projects = this.projects.filter(p => p.id !== id);
    return { success: true };
  }

  async getDonors(): Promise<Donor[]> {
    const tenantId = this.getTenantOrgId();
    return this.donors.filter(d => d.organizationId === tenantId);
  }

  async addDonor(donor: Donor): Promise<Donor> {
    const tenantId = this.getTenantOrgId();
    const scopedDonor: Donor = {
      ...donor,
      organizationId: tenantId
    };

    this.donors = [scopedDonor, ...this.donors];

    AuditLogger.log({
      eventType: 'RECORD_CREATE',
      userId: AuthService.getSession()?.user.id || 'admin',
      userRole: AuthService.getSession()?.user.role || 'ADMINISTRATOR',
      action: 'DONOR_CREATE',
      resource: `/donors/${scopedDonor.id}`,
      status: 'SUCCESS',
      details: `Grant contribution recorded from ${scopedDonor.name} for tenant ${tenantId}`
    });

    return scopedDonor;
  }

  async getVolunteers(): Promise<Volunteer[]> {
    const tenantId = this.getTenantOrgId();
    return this.volunteers.filter(v => v.organizationId === tenantId);
  }

  async getVolunteerEvents(): Promise<VolunteerEvent[]> {
    const tenantId = this.getTenantOrgId();
    return this.events.filter(e => e.organizationId === tenantId);
  }

  async addVolunteerEvent(evt: VolunteerEvent): Promise<VolunteerEvent> {
    const tenantId = this.getTenantOrgId();
    const scopedEvent: VolunteerEvent = {
      ...evt,
      organizationId: tenantId
    };

    this.events = [scopedEvent, ...this.events];
    return scopedEvent;
  }

  async getBeneficiaries(params?: { search?: string; gender?: string; state?: string; status?: string; programId?: string }): Promise<any[]> {
    return [
      {
        id: 'BEN-01',
        beneficiaryCode: 'BEN-2026-DL-001',
        name: 'Sunita Devi',
        gender: 'Female',
        ageGroup: '26-50 Yrs',
        state: 'Delhi',
        district: 'Central Delhi',
        status: 'Active',
        incomeTier: '< ₹10,000/mo',
        phone: '+91 98102 33411',
        address: 'House #42, Paharganj, New Delhi',
        registrationDate: '2025-06-15',
        documents: []
      },
      {
        id: 'BEN-02',
        beneficiaryCode: 'BEN-2026-HR-002',
        name: 'Rahul Kumar',
        gender: 'Male',
        ageGroup: '7-15 Yrs',
        state: 'Haryana',
        district: 'Gurugram',
        status: 'Active',
        incomeTier: '₹10,000 - ₹20,000/mo',
        phone: '+91 98711 44522',
        address: 'Village Badshahpur, Gurugram',
        registrationDate: '2025-07-20',
        documents: []
      }
    ];
  }

  async getBeneficiaryById(id: string): Promise<any | null> {
    const list = await this.getBeneficiaries();
    return list.find(b => b.id === id) || null;
  }

  async createBeneficiary(data: any): Promise<any> {
    return {
      id: `BEN-${Date.now()}`,
      beneficiaryCode: `BEN-2026-${Date.now().toString().slice(-4)}`,
      ...data,
      registrationDate: new Date().toISOString(),
      documents: []
    };
  }

  async updateBeneficiary(id: string, data: any): Promise<any> {
    const b = await this.getBeneficiaryById(id);
    return { ...b, ...data };
  }

  async deleteBeneficiary(id: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async importBeneficiaries(records: any[]): Promise<{ importedCount: number }> {
    return { importedCount: records.length };
  }

  async uploadBeneficiaryDocument(id: string, file: File): Promise<{ document: any }> {
    return {
      document: {
        id: `DOC-${Date.now()}`,
        beneficiaryId: id,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString()
      }
    };
  }

  async getStateImpactData(): Promise<StateImpact[]> {
    return [...STATE_IMPACT_DATA];
  }

  async getDashboardKPIs(region?: Region): Promise<any> {
    return {
      metrics: {
        totalBeneficiariesReached: 48720,
        beneficiariesTarget: 60000,
        activeProjectsCount: 14,
        totalProjectsCount: 16,
        atRiskProjectsCount: 2,
        totalBudget: 42500000,
        totalSpent: 31200000,
        totalGrantFunding: 58000000,
        activeDonorsCount: 8,
        activeVolunteersCount: 142,
        volunteerHoursLogged: 1240
      },
      programAllocation: [
        { category: 'Education', budget: 18500000, percentage: 44, color: '#0f766e' },
        { category: 'Healthcare', budget: 12000000, percentage: 28, color: '#0284c7' },
        { category: 'Women Empowerment', budget: 7500000, percentage: 18, color: '#ec4899' },
        { category: 'Skill Development', budget: 4500000, percentage: 10, color: '#8b5cf6' }
      ],
      monthlyImpactTrend: [
        { month: 'Oct', spentLakhs: 42, reach: 6800 },
        { month: 'Nov', spentLakhs: 48, reach: 7400 },
        { month: 'Dec', spentLakhs: 55, reach: 8200 },
        { month: 'Jan', spentLakhs: 52, reach: 8100 },
        { month: 'Feb', spentLakhs: 58, reach: 8900 },
        { month: 'Mar', spentLakhs: 62, reach: 9300 }
      ],
      stateImpactList: [
        { state: 'Delhi', reach: 14200, fundingLakhs: 125, projectsCount: 4 },
        { state: 'Haryana', reach: 11500, fundingLakhs: 98, projectsCount: 3 },
        { state: 'Uttar Pradesh', reach: 12800, fundingLakhs: 110, projectsCount: 4 },
        { state: 'Rajasthan', reach: 6200, fundingLakhs: 54, projectsCount: 2 },
        { state: 'Maharashtra', reach: 4020, fundingLakhs: 38, projectsCount: 1 }
      ],
      recentActivities: [],
      isEmptyState: false
    };
  }

  async getAIInsights(): Promise<AiInsight[]> {
    return [...AI_INSIGHTS];
  }

  async importBulkData(entityType: string, records: any[]): Promise<ImportSummary> {
    const tenantId = this.getTenantOrgId();
    const total = records.length;
    let imported = 0;
    let skipped = 0;

    records.forEach(rec => {
      if (rec && typeof rec === 'object') {
        rec.organizationId = tenantId;
        imported++;
      } else {
        skipped++;
      }
    });

    AuditLogger.log({
      eventType: 'DATA_IMPORT',
      userId: AuthService.getSession()?.user.id || 'admin',
      userRole: AuthService.getSession()?.user.role || 'ADMINISTRATOR',
      action: 'BULK_IMPORT',
      resource: `/admin/import/${entityType}`,
      status: 'SUCCESS',
      details: `Bulk imported ${imported} ${entityType} records for tenant ${tenantId}`
    });

    return {
      imported,
      updated: 0,
      skipped,
      errors: 0,
      details: [`Imported ${imported} synthetic ${entityType} records into tenant ${tenantId}.`]
    };
  }
}
