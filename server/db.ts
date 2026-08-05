import { PrismaClient } from '@prisma/client';

console.log("🔒 [PRISMA CLIENT INITIALIZATION] DATABASE_URL =", process.env.DATABASE_URL ? "PRESENT" : "MISSING");

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
