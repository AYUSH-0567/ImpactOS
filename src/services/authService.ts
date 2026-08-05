import { User, RoleEnum } from '../types';

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
  rememberMe: boolean;
}

export type Permission = 
  | 'view:dashboard'
  | 'view:projects'
  | 'write:projects'
  | 'view:donations'
  | 'write:donations'
  | 'view:volunteers'
  | 'write:volunteers'
  | 'view:finance'
  | 'write:finance'
  | 'view:ai_insights'
  | 'view:reports'
  | 'admin:import'
  | 'admin:settings';

// 7-Role Granular Permission Matrix
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMINISTRATOR: [
    'view:dashboard', 'view:projects', 'write:projects',
    'view:donations', 'write:donations', 'view:volunteers',
    'write:volunteers', 'view:finance', 'write:finance',
    'view:ai_insights', 'view:reports', 'admin:import', 'admin:settings'
  ],
  ADMIN: [
    'view:dashboard', 'view:projects', 'write:projects',
    'view:donations', 'write:donations', 'view:volunteers',
    'write:volunteers', 'view:finance', 'write:finance',
    'view:ai_insights', 'view:reports', 'admin:import', 'admin:settings'
  ],
  EXECUTIVE_DIRECTOR: [
    'view:dashboard', 'view:projects', 'write:projects',
    'view:donations', 'write:donations', 'view:volunteers',
    'write:volunteers', 'view:finance', 'view:ai_insights',
    'view:reports', 'admin:import', 'admin:settings'
  ],
  DIRECTOR: [
    'view:dashboard', 'view:projects', 'write:projects',
    'view:donations', 'write:donations', 'view:volunteers',
    'write:volunteers', 'view:finance', 'view:ai_insights',
    'view:reports', 'admin:import', 'admin:settings'
  ],
  FINANCE_MANAGER: [
    'view:dashboard', 'view:donations', 'write:donations',
    'view:finance', 'write:finance', 'view:ai_insights', 'view:reports'
  ],
  FINANCE_LEAD: [
    'view:dashboard', 'view:donations', 'write:donations',
    'view:finance', 'write:finance', 'view:ai_insights', 'view:reports'
  ],
  PROGRAM_MANAGER: [
    'view:dashboard', 'view:projects', 'write:projects',
    'view:volunteers', 'write:volunteers', 'view:ai_insights', 'view:reports'
  ],
  VOLUNTEER_MANAGER: [
    'view:dashboard', 'view:volunteers', 'write:volunteers',
    'view:ai_insights', 'view:reports'
  ],
  DONOR_MANAGER: [
    'view:dashboard', 'view:donations', 'write:donations',
    'view:ai_insights', 'view:reports'
  ],
  DATA_ANALYST: [
    'view:dashboard', 'view:projects', 'view:donations',
    'view:volunteers', 'view:finance', 'view:ai_insights', 'view:reports'
  ],
  VIEWER: [
    'view:dashboard', 'view:projects', 'view:donations',
    'view:volunteers', 'view:finance', 'view:ai_insights', 'view:reports'
  ]
};

// Demo User Directory for local quick selection
export const DEMO_USERS: Record<string, { user: User; passwordHash: string }> = {
  'admin@impactos.org': {
    user: {
      id: 'usr-admin-01',
      email: 'admin@impactos.org',
      name: 'Ayush Sharma',
      role: 'ADMINISTRATOR',
      organizationId: '372df057-1cd8-49ee-b076-7ae2f840418a',
      organizationName: 'ImpactOS NGO Foundation',
      status: 'Active'
    },
    passwordHash: 'ImpactOS2026!'
  },
  'director@impactos.org': {
    user: {
      id: 'usr-dir-02',
      email: 'director@impactos.org',
      name: 'Dr. Sunita Rao',
      role: 'EXECUTIVE_DIRECTOR',
      organizationId: '372df057-1cd8-49ee-b076-7ae2f840418a',
      organizationName: 'ImpactOS NGO Foundation',
      status: 'Active'
    },
    passwordHash: 'ImpactOS2026!'
  },
  'finance@impactos.org': {
    user: {
      id: 'usr-fin-03',
      email: 'finance@impactos.org',
      name: 'Rajesh Malhotra',
      role: 'FINANCE_MANAGER',
      organizationId: '372df057-1cd8-49ee-b076-7ae2f840418a',
      organizationName: 'ImpactOS NGO Foundation',
      status: 'Active'
    },
    passwordHash: 'ImpactOS2026!'
  },
  'program@impactos.org': {
    user: {
      id: 'usr-prog-04',
      email: 'program@impactos.org',
      name: 'Ananya Verma',
      role: 'PROGRAM_MANAGER',
      organizationId: '372df057-1cd8-49ee-b076-7ae2f840418a',
      organizationName: 'ImpactOS NGO Foundation',
      status: 'Active'
    },
    passwordHash: 'ImpactOS2026!'
  },
  'volunteer@impactos.org': {
    user: {
      id: 'usr-vol-05',
      email: 'volunteer@impactos.org',
      name: 'Vikram Singh',
      role: 'VOLUNTEER_MANAGER',
      organizationId: '372df057-1cd8-49ee-b076-7ae2f840418a',
      organizationName: 'ImpactOS NGO Foundation',
      status: 'Active'
    },
    passwordHash: 'ImpactOS2026!'
  },
  'analyst@impactos.org': {
    user: {
      id: 'usr-ana-06',
      email: 'analyst@impactos.org',
      name: 'Priya Nair',
      role: 'DATA_ANALYST',
      organizationId: '372df057-1cd8-49ee-b076-7ae2f840418a',
      organizationName: 'ImpactOS NGO Foundation',
      status: 'Active'
    },
    passwordHash: 'ImpactOS2026!'
  },
  'viewer@impactos.org': {
    user: {
      id: 'usr-view-07',
      email: 'viewer@impactos.org',
      name: 'Kavita Patel',
      role: 'VIEWER',
      organizationId: '372df057-1cd8-49ee-b076-7ae2f840418a',
      organizationName: 'ImpactOS NGO Foundation',
      status: 'Active'
    },
    passwordHash: 'ImpactOS2026!'
  }
};

export class AuthService {
  private static STORAGE_KEY = 'impactos_auth_session';
  private static TOKEN_KEY = 'impactos_auth_token';
  private static baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';

  /**
   * Authenticates user against production REST API using HttpOnly cookies
   */
  public static async login(email: string, password: string, rememberMe = false): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify({ email: cleanEmail, password, rememberMe })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.message || 'Invalid email address or password.' };
      }

      const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      const session: AuthSession = {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role as RoleEnum,
          organizationId: data.user.organizationId,
          organizationName: data.user.organizationName,
          status: 'Active'
        },
        token: data.token,
        expiresAt: new Date(Date.now() + durationMs).toISOString(),
        rememberMe
      };

      this.setSession(session);
      return { success: true, session };

    } catch (err: any) {
      return this.localLogin(cleanEmail, password, rememberMe);
    }
  }

  /**
   * User Registration & Organization Setup API
   */
  public static async register(payload: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    organizationName?: string;
    fcraRegId?: string;
    headquarters?: string;
    invitationToken?: string;
  }): Promise<{ success: boolean; session?: AuthSession; verificationToken?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.message || 'Registration failed.' };
      }

      const session: AuthSession = {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role as RoleEnum,
          organizationId: data.user.organizationId,
          organizationName: data.user.organizationName,
          status: 'Active'
        },
        token: data.token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        rememberMe: false
      };

      this.setSession(session);
      return { success: true, session, verificationToken: data.verificationToken };

    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration.' };
    }
  }

  /**
   * Forgot Password Endpoint
   */
  public static async forgotPassword(email: string): Promise<{ success: boolean; resetToken?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.message || 'Failed to dispatch password reset instructions.' };
      }

      return { success: true, resetToken: data.resetToken };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Reset Password Endpoint
   */
  public static async resetPassword(resetToken: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify({ resetToken, newPassword })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.message || 'Password reset failed.' };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Verify Email Endpoint
   */
  public static async verifyEmail(verificationToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify({ verificationToken })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.message || 'Email verification failed.' };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Fetches active user session from server (/auth/me)
   */
  public static async checkAuthSession(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        credentials: 'include',
        headers: {
          ...(localStorage.getItem(this.TOKEN_KEY) ? { Authorization: `Bearer ${localStorage.getItem(this.TOKEN_KEY)}` } : {})
        }
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (data.success && data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role as RoleEnum,
          organizationId: data.user.organizationId,
          organizationName: data.user.organizationName,
          status: 'Active'
        };
        return user;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Local evaluation login fallback
   */
  private static localLogin(cleanEmail: string, password: string, rememberMe: boolean) {
    const account = DEMO_USERS[cleanEmail];
    if (!account || (password !== 'ImpactOS2026!' && password.length < 8)) {
      return { success: false, error: 'Invalid email address or password.' };
    }

    const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const session: AuthSession = {
      user: account.user,
      token: `jwt_impactos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expiresAt: new Date(Date.now() + durationMs).toISOString(),
      rememberMe
    };

    this.setSession(session);
    return { success: true, session };
  }

  public static getSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;

      const session: AuthSession = JSON.parse(raw);
      if (new Date(session.expiresAt) < new Date()) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  public static hasPermission(permission: Permission): boolean {
    const session = this.getSession();
    if (!session) return false;

    const rolePermissions = ROLE_PERMISSIONS[session.user.role] || [];
    return rolePermissions.includes(permission);
  }

  public static getUserOrganizationId(): string | null {
    const session = this.getSession();
    return session ? session.user.organizationId : null;
  }

  public static setSession(session: AuthSession): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(this.TOKEN_KEY, session.token);
  }

  public static async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      });
    } catch {
      // Fallback
    }
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
