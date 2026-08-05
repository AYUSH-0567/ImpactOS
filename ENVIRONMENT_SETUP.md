# ImpactOS Environment Setup Specification

This document details all required and optional environment variables for local development, staging, and cloud production environments.

---

## 🔑 Environment Variable Specification

### 1. Server Runtime & Binding
| Variable | Description | Default | Production Setting |
| :--- | :--- | :--- | :--- |
| `PORT` | HTTP server port | `5000` | `5000` or Cloud `$PORT` |
| `HOST` | IP interface binding | `0.0.0.0` | `0.0.0.0` |
| `NODE_ENV` | Application runtime environment | `development` | `production` |

### 2. Security & Sessions
| Variable | Description | Security Requirement |
| :--- | :--- | :--- |
| `JWT_SECRET` | Cryptographic secret for signing JWT tokens | High entropy string (>= 64 chars) |
| `SESSION_SECRET` | Cryptographic secret for signing HttpOnly cookies | High entropy string (>= 64 chars) |
| `CORS_ORIGIN` | Allowed cross-origin domains | Comma-separated HTTPS origins |

### 3. Database Connection
| Variable | Description | Example Target |
| :--- | :--- | :--- |
| `DATABASE_URL` | Prisma ORM connection string | `postgresql://user:pass@host:5432/impactos_db?sslmode=require` |

### 4. Object Storage (Cloudflare R2 / S3)
| Variable | Description | Cloud Setting |
| :--- | :--- | :--- |
| `S3_BUCKET` | Private bucket name | `impactos-private-media-prod` |
| `S3_ENDPOINT` | Custom S3 endpoint URL | `https://<account_id>.r2.cloudflarestorage.com` |
| `S3_REGION` | Storage geographic region | `ap-south-1` |
| `S3_ACCESS_KEY` | Storage Access Key ID | Secret key |
| `S3_SECRET_KEY` | Storage Secret Access Key | Secret key |

---

## 🔒 Secret Management Policy

1. **Zero Hardcoded Secrets**: Secrets must NEVER be committed to Git repositories.
2. **Platform Secret Managers**: Use Vercel Environment Variables, Railway Variables, or AWS Secrets Manager.
3. **Local Testing**: Copy `.env.example` to `.env` (which is excluded via `.gitignore`).
