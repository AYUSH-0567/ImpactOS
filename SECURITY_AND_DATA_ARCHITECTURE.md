# ImpactOS Private NGO Data Architecture & Security System

## 🔒 Confidentiality & Security Directives

ImpactOS is engineered with a strict **Private Data Firewall**:

1. **Zero LLM Leakage**: Private NGO data, beneficiary names, addresses, phone numbers, and transaction logs are **NEVER** transmitted to external AI providers or public APIs.
2. **Zero Code Hardcoding**: Real NGO data is **NEVER** hardcoded in frontend source files or committed to Git.
3. **Repository Abstraction**: All UI components consume data exclusively through the `dataService` layer. The underlying data provider switches cleanly via environment flags:
   - Development mode: `VITE_USE_MOCK_DATA=true` (Synthetic India NGO Dataset)
   - Production mode: `VITE_USE_MOCK_DATA=false` (Private PostgreSQL / REST API)
4. **Anonymized AI Engine**: AI insights operate strictly on aggregated statistical summaries (e.g. *"Healthcare reach grew +18% QoQ"*), preserving total individual privacy.

---

## 🏗️ Architecture Stack

```
Frontend (React + TS + Tailwind)
       │
       ▼
Data Service Layer (dataService.ts)
       │
       ├──► USE_MOCK_DATA=true  ──► Synthetic In-Memory Store (mockRepository.ts)
       │
       └──► USE_MOCK_DATA=false ──► Authenticated Backend API (apiRepository.ts)
                                           │
                                           ▼
                                 Private PostgreSQL Database (Prisma ORM)
```

---

## 🛠️ Environment Configuration

### 1. Development Mode (Default)
To run locally with synthetic NGO demo records:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Verify `.env` contains:
   ```ini
   VITE_USE_MOCK_DATA=true
   VITE_API_BASE_URL=http://localhost:5173/api/v1
   ```
3. Launch development server:
   ```bash
   npm run dev
   ```

### 2. Production Private Mode
To deploy on the NGO's private infrastructure with PostgreSQL:

1. Configure `.env` on your private server:
   ```ini
   VITE_USE_MOCK_DATA=false
   DATABASE_URL="postgresql://user:password@localhost:5432/impactos_private_db?schema=public"
   AUTH_SECRET="your_private_64_char_secret_key"
   VITE_API_BASE_URL="https://private-ngo-domain.org/api/v1"
   ```
2. Run Prisma database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

---

## 📥 Private Data Import Workflow

Authorized administrators can ingest private NGO CSV records securely:

1. Navigate to **System -> Data Import** in the sidebar.
2. Select target schema: `Beneficiaries`, `Donations`, `Projects`, or `Volunteers`.
3. Upload CSV file.
4. The client-side parser (`csvImporter.ts`) validates:
   - Header column names
   - Required non-null fields
   - Numeric data types
   - Duplicate key detection
5. Review the **Pre-Ingestion Audit Report** (valid records, skipped, error log).
6. Click **Confirm Admin Database Ingestion** to stream sanitized records directly to private storage (zero LLM/external API involvement).

---

## 🗄️ Database Models (Prisma Schema Summary)

| Model Name | Purpose | Privacy / PII Handling |
|---|---|---|
| `Organization` | NGO Legal Profile | FCRA ID, 80G Approval |
| `User` | Authenticated System Users | Role-Based Access Control (RBAC) |
| `Project` | Implementation Initiatives | Budget, Progress, Milestones |
| `Beneficiary` | Impact Reach | PII separated; uses `beneficiaryCode`, `gender`, `ageGroup`, `incomeTier` |
| `Donor` | CSR & Foundation Partners | Grant allocations & frequency |
| `Donation` | Financial Contributions | Tranche values & payment methods |
| `Volunteer` | Cadres | Hours logged & skill categories |
| `Expense` | Expenditure Records | Vendor & approval tracking |
| `ImpactMetric` | SROI Metrics | Cost/beneficiary & outcome rates |
| `AuditLog` | Security Audits | Ingestion & admin action logging |
