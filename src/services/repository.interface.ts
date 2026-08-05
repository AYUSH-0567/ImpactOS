import { 
  Project, 
  Donor, 
  Volunteer, 
  VolunteerEvent, 
  AiInsight, 
  Region,
  StateImpact,
  Beneficiary
} from '../types';

export interface ImportSummary {
  imported: number;
  updated: number;
  skipped: number;
  errors: number;
  details?: string[];
}

export interface IDataRepository {
  /** Mode indicator */
  isMockData: boolean;

  /** Projects */
  getProjects(region?: Region): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | null>;
  addProject(project: Project): Promise<Project>;
  createProject(data: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<{ success: boolean }>;

  /** Donors & Grants */
  getDonors(): Promise<Donor[]>;
  addDonor(donor: Donor): Promise<Donor>;

  /** Volunteers & Mobilization Events */
  getVolunteers(): Promise<Volunteer[]>;
  getVolunteerEvents(): Promise<VolunteerEvent[]>;
  addVolunteerEvent(evt: VolunteerEvent): Promise<VolunteerEvent>;

  /** Beneficiaries Management */
  getBeneficiaries(params?: { search?: string; gender?: string; state?: string; status?: string; programId?: string }): Promise<Beneficiary[]>;
  getBeneficiaryById(id: string): Promise<Beneficiary | null>;
  createBeneficiary(data: Partial<Beneficiary>): Promise<Beneficiary>;
  updateBeneficiary(id: string, data: Partial<Beneficiary>): Promise<Beneficiary>;
  deleteBeneficiary(id: string): Promise<{ success: boolean }>;
  importBeneficiaries(records: any[]): Promise<{ importedCount: number }>;
  uploadBeneficiaryDocument(id: string, file: File): Promise<{ document: any }>;

  /** State Impact & Map Data */
  getStateImpactData(): Promise<StateImpact[]>;

  /** Live Dashboard Calculated KPIs */
  getDashboardKPIs(region?: Region): Promise<any>;

  /** AI Intelligence (Aggregated/Anonymized stats only) */
  getAIInsights(): Promise<AiInsight[]>;

  /** Secure Data Import */
  importBulkData(entityType: 'beneficiaries' | 'donations' | 'projects' | 'volunteers', records: any[]): Promise<ImportSummary>;
}
