# ImpactOS REST API Reference Manual

**Base URL**: `/api/v1`  
**Authentication**: HttpOnly session cookie `impactos_session` or `Authorization: Bearer <token>`  
**CSRF Guard Header**: Required on POST, PUT, DELETE (`X-Requested-With: XMLHttpRequest`)

---

## 🔑 Authentication Endpoints

### 1. User Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Body**: `{ "email": "admin@impactos.org", "password": "admin123" }`
- **Response**: `{ "user": { "id": "...", "name": "...", "role": "ADMIN", "organizationId": "..." } }`

---

## 👥 Organization & Tenant Endpoints

### 1. Get Session Organization
- **Endpoint**: `GET /api/v1/organization/current`
- **Response**: `{ "organization": { "id": "...", "name": "...", "fcraRegId": "..." } }`

---

## 📊 Analytics & AI Endpoints

### 1. Get Live Dashboard KPIs
- **Endpoint**: `GET /api/v1/analytics/dashboard-kpis?region=North%20Region`
- **Response**: `{ "metrics": { "totalBeneficiariesReached": 1250, "totalSpent": 1500000 }, "programAllocation": [...] }`

### 2. Interactive AI Assistant Query
- **Endpoint**: `POST /api/v1/analytics/query-assistant`
- **Body**: `{ "query": "Which program is underperforming?" }`
- **Response**: `{ "answerTitle": "...", "summary": "...", "evidence": [...], "calculations": [...] }`

---

## 📁 Beneficiary Management Endpoints

### 1. List Paginated Beneficiaries
- **Endpoint**: `GET /api/v1/beneficiaries?page=1&limit=50&search=Delhi`
- **Response**: `{ "beneficiaries": [...], "pagination": { "totalCount": 120, "totalPages": 3, "currentPage": 1 } }`

---

## 🔔 Notification Endpoints

### 1. Get Notifications
- **Endpoint**: `GET /api/v1/notifications`
- **Response**: `{ "notifications": [...], "unreadCount": 3 }`

### 2. Trigger Automated Rule Alert Scan
- **Endpoint**: `POST /api/v1/notifications/scan-alerts`
- **Response**: `{ "success": true, "triggeredCount": 2 }`
