import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import programRoutes from './routes/programs';
import donorRoutes from './routes/donors';
import volunteerRoutes from './routes/volunteers';
import analyticsRoutes from './routes/analytics';
import adminRoutes from './routes/admin';
import beneficiaryRoutes from './routes/beneficiaries';
import organizationRoutes from './routes/organization';
import financeRoutes from './routes/finance';
import notificationRoutes from './routes/notifications';
import { apiLimiter, authLimiter, enforceCsrfHeader } from './middleware/security';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable HTTP Response Compression for Production Speed
app.use(compression());

// 1. STRUCTURED LOGGING MIDDLEWARE
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    }));
  });
  next();
});

// 2. SECURITY HEADERS (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://*.tile.openstreetmap.org", "https://*.amazonaws.com"],
      connectSrc: ["'self'", "http://localhost:5000", "http://localhost:5173", "https://*.vercel.app"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 3. PRODUCTION CORS SECURITY
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:5000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Violation: Origin ${origin} not permitted.`));
    }
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// 4. GLOBAL RATE LIMITING & CSRF PROTECTION
app.use('/api/v1', apiLimiter);
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1', enforceCsrfHeader);

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'ImpactOS Multi-Tenant NGO Data API',
    security: {
      helmet: 'ACTIVE',
      rateLimiting: 'ACTIVE',
      csrfProtection: 'ACTIVE',
      multiTenantIsolation: 'ACTIVE'
    },
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organization', organizationRoutes);
app.use('/api/v1/programs', programRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/donors', donorRoutes);
app.use('/api/v1/volunteers', volunteerRoutes);
app.use('/api/v1/beneficiaries', beneficiaryRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/admin', adminRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(JSON.stringify({
    event: 'API_ERROR',
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  }));

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(Number(PORT), HOST, () => {
  console.log(`\n🚀 ImpactOS Production REST API Server listening on http://${HOST}:${PORT}/api/v1`);
  console.log(`🔒 Helmet Headers, Rate Limiting & CSRF Protection Active (RC1 Release Candidate)`);
});

// Graceful Shutdown Handler for Cloud Deployments (Railway / Render / Docker / Systemd)
const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    console.log('✅ Closed active HTTP server connections cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
