# ImpactOS Architecture & Multi-Tenant Design Specification

This document details the high-level system architecture, multi-tenant database design, data flow pipelines, and security boundaries of **ImpactOS**.

---

## 🏛️ System Architecture Diagram

```
+-----------------------------------------------------------------------+
|                          CLIENT PRESENTATION LAYER                    |
|  +-------------------------+  +------------------------------------+  |
|  |  Public Marketing Site  |  |  Authenticated React Vite SaaS App |  |
|  +-------------------------+  +------------------------------------+  |
+-----------------------------------||----------------------------------+
                                    || HTTPS / Cookie Auth Header
+-----------------------------------\/----------------------------------+
|                     EXPRESS REST API SERVER (PORT 5000)                |
|  +------------------+  +-------------------+  +--------------------+  |
|  | Helmet Security  |  | Rate Limiter      |  | Auth & CSRF Guard  |  |
|  +------------------+  +-------------------+  +--------------------+  |
|  +-----------------------------------------------------------------+  |
|  |                 MULTI-TENANT ROUTING CONTROLLERS                |  |
|  |  /auth  /organization  /beneficiaries  /projects  /finance      |  |
|  +-----------------------------------------------------------------+  |
|  +-----------------------------------------------------------------+  |
|  |                      SERVICES & ENGINES LAYER                   |  |
|  |  KPICalculationService    AIImpactAnalystService   CacheService |  |
|  |  QueryAssistantService    AutomationPipeline       JobQueue     |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------||----------------------------------+
                                    || Prisma ORM (Parameterized Queries)
+-----------------------------------\/----------------------------------+
|                     MULTI-TENANT DATABASE LAYER                       |
|   WHERE organizationId = req.user.organizationId (Strict Tenant Isolation)|
|   [users] [organizations] [beneficiaries] [projects] [donors] [expenses]|
+-----------------------------------------------------------------------+
```

---

## 🔒 Multi-Tenant Data Isolation Strategy

Every database table containing tenant telemetry stores a mandatory `organizationId` foreign key referencing `Organization(id)`.

- **Authentication Guard**: `authenticateToken` middleware verifies HttpOnly `impactos_session` cookies or Bearer JWT tokens and sets `req.user = { userId, organizationId, role }`.
- **Query Scoping**: Server controllers prepend `where: { organizationId: req.user.organizationId }` to every Prisma ORM query.
- **Direct Object Reference (IDOR) Protection**: Requesting an ID belonging to another organization returns an empty dataset or 403 Forbidden error.

---

## ⚡ Data Flow Pipelines

1. **8-Stage Data Ingestion Pipeline**:
   `Upload File → Validate Schema → Preview Table → Column Mapping → Confirm Import → Persist to DB → Recalculate KPIs → Notify Users`.
2. **AI Impact Telemetry Pipeline**:
   `Prisma ORM Scan → Run Anomaly Detectors → Calculate Ratios → Format Empirical Evidence → Present Insights`.
