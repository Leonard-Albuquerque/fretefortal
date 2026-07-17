import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

let prisma: PrismaClient;

// Read database URL from environment variables, fallback to Neon if not set
const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_wpPiGeT05VWo@ep-patient-water-aw0gs90g-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

if (process.env.NODE_ENV === 'production') {
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.prisma) {
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    globalForPrisma.pool = pool;
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
