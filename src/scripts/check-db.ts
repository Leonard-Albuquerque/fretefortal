import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const count = await prisma.baseNeighborhood.count();
  console.log(`Total base neighborhoods in DB: ${count}`);

  const testNames = [
    "parque santa rosa",
    "vila peri",
    "vila pery",
    "novo mondubim",
    "aracape",
    "guararapes",
    "guarapes",
    "olavo oliveira",
    "raquel de queiros",
    "rachel de queiroz"
  ];

  for (const name of testNames) {
    const record = await prisma.baseNeighborhood.findUnique({
      where: { name }
    });
    console.log(`Lookup '${name}': ${record ? `FOUND (officialName: "${record.officialName}")` : 'NOT FOUND'}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
