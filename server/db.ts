import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const NEON_PRODUCTION_DB_URL = "postgresql://neondb_owner:npg_Bk5OGMZe4sLE@ep-wild-hat-axbelksp.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";
const dbUrl = process.env.DATABASE_URL || NEON_PRODUCTION_DB_URL;

console.log("🔒 [PRISMA CLIENT INITIALIZATION] DATABASE_URL =", process.env.DATABASE_URL ? "ENV_PRESENT" : "FALLBACK_NEON_APPLIED");

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
