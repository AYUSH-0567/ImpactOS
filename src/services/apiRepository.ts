import { IDataRepository, ImportSummary } from './repository.interface';
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

export class ApiRepository implements IDataRepository {
  public readonly isMockData = false;
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  }

  private async fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('impactos_auth_token');
    const headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      credentials: 'include',
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getProjects(region?: Region): Promise<Project[]> {
    const query = region ? `?region=${encodeURIComponent(region)}` : '';
    return this.fetchWithAuth<Project[]>(`/projects${query}`);
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.fetchWithAuth<Project>(`/projects/${id}`);
  }

  async addProject(project: Project): Promise<Project> {
    return this.fetchWithAuth<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    });
  }

  async createProject(data: Partial<Project>): Promise<Project> {
    return this.fetchWithAuth<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteProject(id: string): Promise<{ success: boolean }> {
    return this.fetchWithAuth<{ success: boolean }>(`/projects/${id}`, {
      method: 'DELETE'
    });
  }

  async getDonors(): Promise<Donor[]> {
    return this.fetchWithAuth<Donor[]>('/donors');
  }

  async addDonor(donor: Donor): Promise<Donor> {
    return this.fetchWithAuth<Donor>('/donors', {
      method: 'POST',
      body: JSON.stringify(donor)
    });
  }

  async getVolunteers(): Promise<Volunteer[]> {
    return this.fetchWithAuth<Volunteer[]>('/volunteers');
  }

  async getVolunteerEvents(): Promise<VolunteerEvent[]> {
    return this.fetchWithAuth<VolunteerEvent[]>('/volunteers/events');
  }

  async addVolunteerEvent(evt: VolunteerEvent): Promise<VolunteerEvent> {
    return this.fetchWithAuth<VolunteerEvent>('/volunteers/events', {
      method: 'POST',
      body: JSON.stringify(evt)
    });
  }

  // Beneficiary Management Methods
  async getBeneficiaries(params?: { search?: string; gender?: string; state?: string; status?: string; programId?: string }): Promise<Beneficiary[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.gender) query.append('gender', params.gender);
    if (params?.state) query.append('state', params.state);
    if (params?.status) query.append('status', params.status);
    if (params?.programId) query.append('programId', params.programId);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.fetchWithAuth<Beneficiary[]>(`/beneficiaries${queryString}`);
  }

  async getBeneficiaryById(id: string): Promise<Beneficiary | null> {
    return this.fetchWithAuth<Beneficiary>(`/beneficiaries/${id}`);
  }

  async createBeneficiary(data: Partial<Beneficiary>): Promise<Beneficiary> {
    return this.fetchWithAuth<Beneficiary>('/beneficiaries', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateBeneficiary(id: string, data: Partial<Beneficiary>): Promise<Beneficiary> {
    return this.fetchWithAuth<Beneficiary>(`/beneficiaries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteBeneficiary(id: string): Promise<{ success: boolean }> {
    return this.fetchWithAuth<{ success: boolean }>(`/beneficiaries/${id}`, {
      method: 'DELETE'
    });
  }

  async importBeneficiaries(records: any[]): Promise<{ importedCount: number }> {
    return this.fetchWithAuth<{ importedCount: number }>('/beneficiaries/import', {
      method: 'POST',
      body: JSON.stringify({ records })
    });
  }

  async uploadBeneficiaryDocument(id: string, file: File): Promise<{ document: any }> {
    const token = localStorage.getItem('impactos_auth_token');
    const formData = new FormData();
    formData.append('document', file);

    const response = await fetch(`${this.baseUrl}/beneficiaries/${id}/documents`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to upload supporting document.');
    }

    return response.json();
  }

  async getStateImpactData(): Promise<StateImpact[]> {
    return this.fetchWithAuth<StateImpact[]>('/analytics/state-impact');
  }

  async getDashboardKPIs(region?: Region): Promise<any> {
    const query = region ? `?region=${encodeURIComponent(region)}` : '';
    return this.fetchWithAuth<any>(`/analytics/dashboard-kpis${query}`);
  }

  async getAIInsights(): Promise<AiInsight[]> {
    return this.fetchWithAuth<AiInsight[]>('/analytics/ai-insights');
  }

  async importBulkData(entityType: string, records: any[]): Promise<ImportSummary> {
    const res = await this.fetchWithAuth<any>(`/admin/import/${entityType}`, {
      method: 'POST',
      body: JSON.stringify({ records })
    });
    return {
      imported: res.importedCount || 0,
      updated: 0,
      skipped: res.skippedCount || 0,
      errors: 0
    };
  }
}
