# ImpactOS — Senior Software Architect Comprehensive Project Audit (`PROJECT_AUDIT.md`)

**Audit Date**: August 5, 2026  
**Auditor**: Senior Software Architect  
**Project**: ImpactOS — Production Multi-Tenant NGO Data Intelligence Platform  
**Location**: `C:\Users\ayush\.gemini\antigravity\scratch\impactos`  

---

## 1. Executive Summary & Production Readiness Score

ImpactOS is a React 19 + Express 5 multi-tenant SaaS application designed for Indian non-governmental organizations (NGOs). It provides operational data intelligence, beneficiary management, grant tracking, GIS spatial location analytics, CSV/Excel data ingestion, and deterministic AI risk detection.

### Production Readiness Score: **78 / 100**

| Domain | Rating | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | 9/10 | 🟢 Excellent | React 19.2, Vite 8.1, Tailwind CSS v4, Recharts 3.10, Leaflet 1.9. |
| **Backend REST API** | 8/10 | 🟢 Good | Express 5.2, modular routes, middleware chain, async handlers. |
| **Database & ORM** | 8/10 | 🟢 Good | Prisma ORM 6.19, 15 multi-tenant models, SQLite (`dev.db`) / PostgreSQL ready. |
| **Multi-Tenant Isolation** | 9/10 | 🟢 Excellent | Strict `organizationId` scoping on all queries and mutations. |
| **Authentication & RBAC** | 7.5/10 | 🟡 Pass | Bcrypt hashing, 7-role server RBAC; tokens stored in `localStorage`. |
| **Data Ingestion Engine** | 9/10 | 🟢 Excellent | Flexible column mapping for CSV & Excel `.xlsx` / `.xls`, SheetJS & PapaParse. |
| **Routing System** | 5/10 | 🔴 Technical Debt | Tab-based string state (`App.tsx`). No URL router / deep-linking. |
| **Security Architecture** | 6.5/10 | 🟡 Attention | LocalStorage tokens, static `/uploads` serving without mimetype lock. |

---

## 2. Current Architectural Baseline

```
                        ┌──────────────────────────────────────────┐
                        │        React 19.2 Frontend (Vite)        │
                        │   Tailwind v4 • Recharts • Leaflet GIS   │
                        └────────────────────┬─────────────────────┘
                                             │ HTTP REST / JSON
                                             ▼
                        ┌──────────────────────────────────────────┐
                        │    Express 5.2 REST API (Port 5000)      │
                        │       server/index.ts (Cors/JSON)        │
                        └──────┬────────────────────────────┬──────┘
                               │                            │
                     ┌─────────┴─────────┐        ┌─────────┴─────────┐
                     │ Auth & RBAC Guard │        │  KPI & AI Engine  │
                     │ bcrypt / JWT Auth │        │  kpiService.ts    │
                     └─────────┬─────────┘        └─────────┬─────────┘
                               │                            │
                               └────────────┬───────────────┘
                                            │ Prisma ORM 6.19
                                            ▼
                        ┌──────────────────────────────────────────┐
                        │   Multi-Tenant Database (dev.db / PG)    │
                        │    WHERE organizationId = req.user.org   │
                        └──────────────────────────────────────────┘
```

### Stack Breakdown
- **Frontend Core**: React `^19.2.7`, Vite `^8.1.1`, Tailwind CSS `^4.3.3`, Lucide Icons `^1.26.0`.
- **Data Visualization & GIS**: Recharts `^3.10.0`, Leaflet `^1.9.4` (CartoDB Positron neutral light tiles).
- **Data Import & Ingestion**: SheetJS `xlsx` `^0.18.5`, PapaParse `^5.5.4`.
- **Backend Core**: Express `^5.2.1`, CORS `^2.8.6`, Multer `^2.2.0`, Dotenv `^17.4.2`, TSX `^4.23.1`.
- **Authentication**: JsonWebToken `^9.0.3`, BcryptJS `^3.0.3`.
- **Database Layer**: Prisma Client `^6.19.3`, Prisma CLI `^6.19.3` targeting SQLite `dev.db` / PostgreSQL.

---

## 3. Detailed Component & Subsystem Inspection

### 3.1. Database Schema (`prisma/schema.prisma`)
- Contains 15 relational models: `Organization`, `User`, `OrganizationInvitation`, `Program`, `Project`, `ProjectMilestone`, `Beneficiary`, `BeneficiaryDocument`, `Donor`, `Donation`, `Volunteer`, `VolunteerEvent`, `Expense`, `FundingSource`, `ImpactMetric`, `AuditLog`.
- Multi-tenant tenant boundaries enforced via `organizationId` foreign key referencing `Organization(id)`.

### 3.2. Authentication & Authorization
- **Registration & Setup** (`server/routes/auth.ts`): User registration with new `Organization` creation (`fcraRegId`, `headquarters`) or invitation token acceptance. Passwords hashed using `bcrypt.hash(password, 10)`.
- **Session Tokens**: Signed JWT tokens containing `{ id, email, name, role, organizationId, organizationName }` with 24h or 30d expiry.
- **RBAC Matrix**: 7 roles (*ADMIN, DIRECTOR, FINANCE_LEAD, PROGRAM_MANAGER, DONOR_MANAGER, DATA_ANALYST, VIEWER*) mapped to server permissions (`view:projects`, `write:projects`, `view:donations`, `write:donations`, `admin:import`, `admin:settings`).

### 3.3. Beneficiary Management System (`server/routes/beneficiaries.ts` & `BeneficiaryAnalytics.tsx`)
- Full database-backed CRUD engine with search (`name`, `code`, `district`, `phone`) and multi-field filters (`gender`, `state`, `status`).
- File uploads using `multer` to `/public/uploads/documents/` linked via `BeneficiaryDocument` records.

### 3.4. Data Import Engine (`DataImportView.tsx`)
- 5-stage interactive import pipeline: `Upload` → `Validate` → `Preview` → `Map Columns` → `Store DB` → `Generate Analytics`.
- Flexible column mapping interface using fuzzy string matching to auto-suggest mappings for custom NGO column names. Supports `.csv`, `.xlsx`, and `.xls`.

### 3.5. Calculated Dashboard KPI Engine (`server/services/kpiService.ts`)
- Reusable server-side aggregation service computing live database statistics in under **50ms**.
- Professional empty state rendered if organization database has zero records.

### 3.6. Deterministic AI Impact Analyst (`server/services/aiAnalystService.ts`)
- Runs rule-based statistical anomaly detectors directly on stored database records:
  - Duplicate phone / identical Name + District match detector.
  - Capital burn rate vs progress ratio anomaly detector.
  - Underperforming program reach deficit detector.
  - Declining volunteer attendance detector.

---

## 4. Identified Problems, Security Issues & Technical Debt

### 4.1. Security Issues ⚠️

1. **LocalStorage Token Storage (XSS Vulnerability)**:
   - *Issue*: Session JWT tokens are stored in browser `localStorage` (`impactos_auth_token`). If any third-party script or XSS vulnerability exists, tokens can be read by malicious client code.
   - *Recommendation*: Migrate session tokens to `HttpOnly`, `Secure`, `SameSite=Strict` cookies.

2. **Hardcoded Secret Fallback**:
   - *Issue*: `server/middleware/auth.ts` and `server/routes/auth.ts` contain a fallback string `impactos_production_secret_key_2026_jwt_auth` if `process.env.JWT_SECRET` is missing.
   - *Recommendation*: Throw a fatal initialization error if `JWT_SECRET` is absent in production environment.

3. **Unsanitized Static File Upload Serving**:
   - *Issue*: `server/index.ts` exposes `app.use('/uploads', express.static(...))` without strict MIME-type locking or file extension validation.
   - *Recommendation*: Restrict file uploads to PDF, PNG, JPG, and DOCX, and enforce Content-Disposition headers.

4. **Missing Rate-Limiting on Auth Endpoints**:
   - *Issue*: Express backend lacks `express-rate-limit` middleware on `/api/v1/auth/login` and `/api/v1/auth/register`.
   - *Recommendation*: Add `express-rate-limit` (e.g. max 10 requests per minute per IP).

### 4.2. Technical Debt & Codebase Cleanliness 🛠️

1. **Tab-Based Routing (`App.tsx`)**:
   - *Issue*: Page navigation uses string state `activeTab` (`'dashboard'`, `'projects'`, `'beneficiaries'`, etc.). Users cannot bookmark specific views or use browser Back/Forward navigation.
   - *Recommendation*: Migrate to `react-router-dom` v6 for clean URL paths (`/dashboard`, `/projects`, `/beneficiaries`, `/import`, `/settings`).

2. **Legacy Mock Data Files Still in Codebase**:
   - *Locations*: `src/data/mockData.ts`, `src/services/mockRepository.ts`.
   - *Issue*: While the active runtime relies on `ApiRepository` (`VITE_USE_MOCK_DATA="false"`), `mockData.ts` and `mockRepository.ts` still exist in `src/` and contribute to bundle size.
   - *Recommendation*: Isolate or remove unused mock fallbacks.

3. **Vite Bundle Chunk Size**:
   - *Issue*: Main JavaScript chunk is ~1.2MB (`dist/assets/index-BrmKvPRE.js`).
   - *Recommendation*: Implement React code-splitting using `React.lazy()` and dynamic `import()` for major views (`BeneficiaryAnalytics`, `DataImportView`, `IndiaImpactMap`).

---

## 5. Mock Data & Static File Inventory

| Path | File | Purpose | Active Status |
| :--- | :--- | :--- | :--- |
| `src/data/` | `mockData.ts` | Static fallback arrays for projects, donors, volunteers | Secondary Fallback |
| `src/data/` | `indiaGeoJson.ts` | GeoJSON boundary shapes and coordinate pins | Active (GIS Map) |
| `src/services/` | `mockRepository.ts` | In-memory `IDataRepository` implementation | Secondary Fallback |
| `src/services/` | `authService.ts` | `DEMO_USERS` directory for evaluation role selection | Active (Quick Select) |
| `prisma/` | `seed.ts` | Seed script for SQLite/PostgreSQL database | Active (Seed Engine) |
| `prisma/` | `dev.db` | Local SQLite database file | Active (Database Store) |

---

## 6. Recommended SaaS Target Architecture & Migration Plan

```
[Phase 1: Security Hardening]
  ├── HttpOnly Cookie Authentication
  ├── express-rate-limit on /api/v1/auth/*
  └── Strict File Mimetype Verification for Uploads

[Phase 2: Production URL Routing]
  ├── react-router-dom v6 Migration (/dashboard, /projects, /beneficiaries)
  └── Deep-linking, Query Parameter preservation & Browser History

[Phase 3: Frontend Bundle Optimization]
  ├── Code-splitting via React.lazy() for Heavy Views & Maps
  └── Tree-shaking unused fallback assets
```

---

> **Status**: Comprehensive Technical Audit Complete (`PROJECT_AUDIT.md`). No application code or UI pages were modified during this audit phase. Awaiting your approval before proceeding!
