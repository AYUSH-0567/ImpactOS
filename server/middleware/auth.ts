import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'impactos_production_secret_key_2026_jwt_auth';

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16)) {
  console.error('FATAL: JWT_SECRET environment variable is absent or insecure in production environment.');
  process.exit(1);
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  organizationName?: string;
  isEmailVerified?: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// 7-Role Production RBAC Matrix
export const PERMISSION_MATRIX: Record<string, string[]> = {
  'view:dashboard': ['ADMIN', 'DIRECTOR', 'FINANCE_LEAD', 'PROGRAM_MANAGER', 'VOLUNTEER_MANAGER', 'DATA_ANALYST', 'VIEWER'],
  'view:projects': ['ADMIN', 'DIRECTOR', 'PROGRAM_MANAGER', 'DATA_ANALYST', 'VIEWER'],
  'write:projects': ['ADMIN', 'DIRECTOR', 'PROGRAM_MANAGER'],
  'view:donations': ['ADMIN', 'DIRECTOR', 'FINANCE_LEAD', 'DONOR_MANAGER', 'DATA_ANALYST', 'VIEWER'],
  'write:donations': ['ADMIN', 'DIRECTOR', 'FINANCE_LEAD', 'DONOR_MANAGER'],
  'view:volunteers': ['ADMIN', 'DIRECTOR', 'PROGRAM_MANAGER', 'VOLUNTEER_MANAGER', 'DATA_ANALYST', 'VIEWER'],
  'write:volunteers': ['ADMIN', 'DIRECTOR', 'PROGRAM_MANAGER', 'VOLUNTEER_MANAGER'],
  'view:finance': ['ADMIN', 'DIRECTOR', 'FINANCE_LEAD', 'DATA_ANALYST', 'VIEWER'],
  'write:finance': ['ADMIN', 'DIRECTOR', 'FINANCE_LEAD'],
  'view:ai_insights': ['ADMIN', 'DIRECTOR', 'FINANCE_LEAD', 'PROGRAM_MANAGER', 'VOLUNTEER_MANAGER', 'DATA_ANALYST', 'VIEWER'],
  'view:reports': ['ADMIN', 'DIRECTOR', 'FINANCE_LEAD', 'PROGRAM_MANAGER', 'VOLUNTEER_MANAGER', 'DATA_ANALYST', 'VIEWER'],
  'admin:import': ['ADMIN', 'DIRECTOR'],
  'admin:settings': ['ADMIN', 'DIRECTOR']
};

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Read token from HttpOnly Cookie first, fallback to Authorization header
  let token: string | undefined = req.cookies?.impactos_session;
  
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required. No valid session cookie or token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired session. Please log in again.' 
    });
  }
};

export const requirePermission = (permissionKey: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated user.' });
    }

    const allowedRoles = PERMISSION_MATRIX[permissionKey] || [];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden. Role '${req.user.role}' lacks '${permissionKey}' permission.` 
      });
    }

    next();
  };
};
