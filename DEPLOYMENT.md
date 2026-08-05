# ImpactOS Cloud Production Deployment Guide

This document provides step-by-step instructions for deploying **ImpactOS RC1** to cloud production infrastructure.

---

## 🏛️ Architecture Overview

- **Frontend**: Vercel (Vite React Single Page Application)
- **Backend API**: Railway or Render (Express Node.js Container Service)
- **Database**: Neon PostgreSQL 15 (Serverless Postgres with Connection Pooling)
- **Object Storage**: Cloudflare R2 or AWS S3 (Private Bucket)

---

## 1. Database Provisioning (Neon PostgreSQL)

1. Create a PostgreSQL 15 database instance on [Neon](https://neon.tech) or AWS RDS.
2. Copy the Connection String with PgBouncer enabled:
   `DATABASE_URL="postgresql://user:pass@ep-cool-db.ap-south-1.aws.neon.tech/impactos_prod?sslmode=require"`
3. Execute database schema migrations:
   ```bash
   npx prisma db push
   # OR
   npx prisma migrate deploy
   ```

---

## 2. Object Storage Setup (Cloudflare R2 / AWS S3)

1. Create a private bucket named `impactos-private-media-prod` in Cloudflare R2 or AWS S3.
2. Generate S3 API Credentials (`Access Key ID` & `Secret Access Key`).
3. Set environment variables:
   ```env
   S3_BUCKET="impactos-private-media-prod"
   S3_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"
   S3_REGION="ap-south-1"
   S3_ACCESS_KEY="<your_access_key>"
   S3_SECRET_KEY="<your_secret_key>"
   ```

---

## 3. Backend API Deployment (Railway / Render)

1. Connect repository to [Railway](https://railway.app) or [Render](https://render.com).
2. Configure Build & Start Commands:
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npx tsx server/index.ts`
3. Add Environment Variables from `.env.example`:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `DATABASE_URL=<Neon PostgreSQL URL>`
   - `JWT_SECRET=<Random 64-char String>`
   - `SESSION_SECRET=<Random 64-char String>`
   - `CORS_ORIGIN=https://app.impactos.org`
4. Set Health Check Path: `/api/v1/health`.

---

## 4. Frontend Deployment (Vercel)

1. Connect repository to [Vercel](https://vercel.com).
2. Configure Project Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variables:
   - `VITE_API_BASE_URL=https://api.impactos.org/api/v1`
4. Deploy and map custom domain (`app.impactos.org`).

---

## 5. Verification & Health Audit

After deployment, perform verification:
```bash
curl -I https://api.impactos.org/api/v1/health
```
Expected Output: `HTTP/2 200` with JSON `{ "status": "HEALTHY", "environment": "production" }`.
