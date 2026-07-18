import { prisma } from './src/lib/prisma';

async function main() {
  const stores = await prisma.store.findMany({
    select: { slug: true, name: true }
  });
  console.log('Stores:', JSON.stringify(stores));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
