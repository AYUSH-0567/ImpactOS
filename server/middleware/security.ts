import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from './auth';

const prisma = new PrismaClient();

// 1. RATE LIMITERS
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login/register requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.'
  }
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 API requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many API requests from this IP address. Rate limit exceeded.'
  }
});

// 2. CSRF PROTECTION MIDDLEWARE
export const enforceCsrfHeader = (req: Request, res: Response, next: NextFunction) => {
  // Safe HTTP methods do not require CSRF token checks
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Require custom header for state-changing requests to prevent cross-site request forgery
  const csrfHeader = req.headers['x-requested-with'] || req.headers['x-csrf-token'];
  if (!csrfHeader) {
    console.error(JSON.stringify({
      event: 'CSRF_SECURITY_VIOLATION',
      path: req.originalUrl,
      method: req.method,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      timestamp: new Date().toISOString()
    }));

    return res.status(403).json({
      success: false,
      message: 'Unable to complete sign-in securely. Please refresh the page and try again.'
    });
  }

  next();
};

// 3. AUDIT LOGGING HELPER
export const logSecurityEvent = async (
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  ipAddress?: string
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        ipAddress: ipAddress || '127.0.0.1'
      }
    });
  } catch (err) {
    console.error('Failed to log security event:', err);
  }
};

// 4. FILE VALIDATION CONFIGURATION FOR MULTER
export const fileValidationOptions = {
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max file size
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Security File Validation Failure: Only JPG, PNG, PDF, CSV, and XLSX files are permitted.'));
    }
  }
};
