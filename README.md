# ImpactOS — Multi-Tenant Operating System for Indian NGOs & CSR Foundations

ImpactOS is an enterprise-grade SaaS platform built to empower non-governmental organizations, CSR corporate foundations, and social impact leaders in India. It delivers multi-tenant data isolation, Section 80G & FCRA compliance automation, automated AI impact analytics, flexible 8-stage data ingestion, and financial governance.

---

## 🌟 Key Features

- **Multi-Tenant SaaS Foundation**: Complete server-side database isolation where Organization A never accesses Organization B data.
- **7-Role Server RBAC**: Permissions matrix enforcing `ADMIN`, `DIRECTOR`, `FINANCE_LEAD`, `PROGRAM_MANAGER`, `DONOR_MANAGER`, `DATA_ANALYST`, and `VIEWER`.
- **Beneficiary Management**: Track profiles, verification documents, program enrollments, session attendance, and audit history timelines.
- **Flexible 8-Stage Data Importer**: Upload `.csv` or `.xlsx` files with pre-ingestion validation, column mapping, and duplicate detection.
- **Real Database KPI Engine**: Single-pass calculation in under 50ms with zero hardcoded metrics.
- **Automated AI Impact Analyst**: Zero-hallucination statistical anomaly detector for duplicates, budget burn disparities, and attendance drops.
- **Interactive AI Assistant**: Answers natural language queries (*"Which program is underperforming?"*, *"Which district has the highest beneficiaries?"*) using real DB records, evidence, and calculations.
- **Finance & Grant Management**: Line-item expense logger, budget vs actual variance, cash flow statements, and runway forecasting.
- **Automated Dual Reports**: Generate PDF & Excel audit briefs for Executive Boards, Donors, and CSR regulators.
- **Notification Center**: Automated database rule alert scanner for grant expiries, budget thresholds, and volunteer shortages.
- **Public Marketing Website**: Standalone 9-page public website with interactive demo booking.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Setup

1. **Clone & Install Dependencies**:
   ```bash
   cd impactos
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="impactos_production_jwt_secret_key_2026_xyz"
   SESSION_SECRET="impactos_production_session_cookie_secret_2026"
   NODE_ENV="production"
   ```

3. **Initialize Database Schema**:
   ```bash
   npx prisma db push
   ```

4. **Run Production Validation Audit**:
   ```bash
   npx tsx server/tests/productionValidationRunner.ts
   ```

5. **Start REST API Server & Frontend**:
   ```bash
   # Terminal 1: REST API Server
   npx tsx server/index.ts

   # Terminal 2: Vite Frontend App
   npx vite --host
   ```

6. **Access App**: Open [http://localhost:5173](http://localhost:5173). Default Admin Login: `admin@impactos.org` / `admin123`.

---

## 📚 Documentation Suite

- [PRODUCTION_VALIDATION_REPORT.md](file:///C:/Users/ayush/.gemini/antigravity/scratch/impactos/PRODUCTION_VALIDATION_REPORT.md): Comprehensive production validation audit across all 13 phases.
- [SECURITY.md](file:///C:/Users/ayush/.gemini/antigravity/scratch/impactos/SECURITY.md): Rate limiting, CSRF protection, Helmet security headers, and database isolation controls.
- [PERFORMANCE.md](file:///C:/Users/ayush/.gemini/antigravity/scratch/impactos/PERFORMANCE.md): Database indexing, TTL caching, lazy loading, pagination, and bundle chunk metrics.
- [ARCHITECTURE.md](file:///C:/Users/ayush/.gemini/antigravity/scratch/impactos/ARCHITECTURE.md): Multi-tenant database design and REST API architecture.
- [DEPLOYMENT.md](file:///C:/Users/ayush/.gemini/antigravity/scratch/impactos/DEPLOYMENT.md): Production deployment guide.
- [USER_GUIDE.md](file:///C:/Users/ayush/.gemini/antigravity/scratch/impactos/USER_GUIDE.md): End-user operational handbook for NGO leaders.
- [API_DOCUMENTATION.md](file:///C:/Users/ayush/.gemini/antigravity/scratch/impactos/API_DOCUMENTATION.md): Complete REST API specification.
