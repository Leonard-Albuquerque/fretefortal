import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const rawNeighborhoods = [
  "Aerolândia",
  "Aeroporto",
  "Alagadiço",
  "Aldeota",
  "Alto da Balança",
  "Álvaro Weyne",
  "Amadeu Furtado",
  "Ancuri",
  "Antônio Bezerra",
  "Aracapé",
  "Autran Nunes",
  "Barra do Ceará",
  "Barroso",
  "Bela Vista",
  "Benfica",
  "Boa Vista/Castelão",
  "Bom Futuro",
  "Bom Jardim",
  "Bonsucesso",
  "Cais do Porto",
  "Cajazeiras",
  "Cambeba",
  "Canindezinho",
  "Carlito Pamplona",
  "Centro",
  "Cidade 2000",
  "Cidade dos Funcionários",
  "Coaçu",
  "Coco",
  "Conjunto Ceará I",
  "Conjunto Ceará II",
  "Conjunto Esperança",
  "Conjunto Palmeiras",
  "Couto Fernandes",
  "Cristo Redentor",
  "Curió",
  "Damas",
  "De Lourdes",
  "Demócrito Rocha",
  "Dendê",
  "Dias Macedo",
  "Dom Lustosa",
  "Edson Queiroz",
  "Ellery",
  "Engenheiro Luciano Cavalcante",
  "Dionísio Torres",
  "Farias Brito",
  "Fátima",
  "Floresta",
  "Genibaú",
  "Gentilândia",
  "Granja Lisboa",
  "Granja Portugal",
  "Guajeru",
  "Guararapes",
  "Henrique Jorge",
  "Itaóca",
  "Itaperi",
  "Jacarecanga",
  "Jangurussu",
  "Jardim América",
  "Jardim Cearense",
  "Jardim das Oliveiras",
  "Jardim Guanabara",
  "Jardim Iracema",
  "João XXIII",
  "Joaquim Távora",
  "Jóquei Clube",
  "José Bonifácio",
  "José de Alencar",
  "Lagoa Redonda",
  "Manoel Sátiro",
  "Manuel Dias Branco",
  "Maraponga",
  "Meireles",
  "Messejana",
  "Mondubim",
  "Monte Castelo",
  "Montese",
  "Moura Brasil",
  "Mucuripe",
  "Novo Mondubim",
  "Olavo Oliveira",
  "Padre Andrade",
  "Panamericano",
  "Papicu",
  "Parangaba",
  "Parque Araxá",
  "Parque Dois Irmãos",
  "Parque Iracema",
  "Parque Manibura",
  "Parque Presidente Vargas",
  "Parque Santa Maria",
  "Parque Santa Rosa",
  "Parque São José",
  "Parquelândia",
  "Parreão",
  "Passaré",
  "Paupina",
  "Pedras",
  "Pici",
  "Pirambu",
  "Planalto Ayrton Senna",
  "Praia de Iracema",
  "Praia do Futuro I",
  "Praia do Futuro II",
  "Prefeito José Walter",
  "Presidente Kennedy",
  "Quintino Cunha",
  "Rachel de Queiroz",
  "Rodolfo Teófilo",
  "Sabiaguaba",
  "Salinas",
  "São Bento",
  "São Gerardo",
  "São João do Tauape",
  "Sapiranga / Coité",
  "Serrinha",
  "Siqueira",
  "Varjota",
  "Vicente Pinzon",
  "Vila Peri",
  "Vila União",
  "Vila Velha"
];

function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .trim();
}

async function main() {
  console.log("Seeding database...");

  // 1. Seed base neighborhoods
  console.log("Seeding base neighborhoods...");
  const baseNeighborhoods = [];
  for (const officialName of rawNeighborhoods) {
    const normalizedName = normalizeName(officialName);
    const bn = await prisma.baseNeighborhood.upsert({
      where: { name: normalizedName },
      update: { officialName },
      create: {
        name: normalizedName,
        officialName,
      },
    });
    baseNeighborhoods.push(bn);
  }
  console.log(`Successfully seeded ${baseNeighborhoods.length} base neighborhoods.`);

  // 2. Seed Stores
  const storesToSeed = [
    {
      slug: "fortal-express",
      name: "Fortal Express",
      whatsapp: "5585999999999",
      address: "Av. Beira Mar, 1000 - Meireles, Fortaleza - CE",
      operatingHours: "Segunda a Sábado: 09:00 às 21:00",
      pickupEnabled: true,
    },
    {
      slug: "pizzaria-bella",
      name: "Pizzaria Bella Fortaleza",
      whatsapp: "5585988888888",
      address: "Av. Dom Luís, 500 - Aldeota, Fortaleza - CE",
      operatingHours: "Todos os dias: 18:00 às 23:30",
      pickupEnabled: true,
    }
  ];

  for (const storeData of storesToSeed) {
    console.log(`Seeding store: ${storeData.name}...`);
    const store = await prisma.store.upsert({
      where: { slug: storeData.slug },
      update: {
        name: storeData.name,
        whatsapp: storeData.whatsapp,
        address: storeData.address,
        operatingHours: storeData.operatingHours,
        pickupEnabled: storeData.pickupEnabled,
      },
      create: storeData,
    });

    // Seed default pickup points for testing
    console.log(`Seeding pickup points for ${storeData.name}...`);
    await prisma.pickupPoint.deleteMany({
      where: { storeId: store.id }
    });

    if (storeData.slug === 'fortal-express') {
      await prisma.pickupPoint.createMany({
        data: [
          {
            storeId: store.id,
            name: "Loja Aldeota",
            address: "Av. Dom Luís, 500 - Aldeota, Fortaleza - CE",
            latitude: -3.7350,
            longitude: -38.4990,
            instructions: "Ao lado do Shopping Del Paseo"
          },
          {
            storeId: store.id,
            name: "Retirada Meireles",
            address: "Av. Beira Mar, 1000 - Meireles, Fortaleza - CE",
            latitude: -3.7250,
            longitude: -38.4890,
            instructions: "Quiosque frente à praia"
          }
        ]
      });
    } else if (storeData.slug === 'pizzaria-bella') {
      await prisma.pickupPoint.createMany({
        data: [
          {
            storeId: store.id,
            name: "Loja Central Aldeota",
            address: "Av. Dom Luís, 800 - Aldeota, Fortaleza - CE",
            latitude: -3.7360,
            longitude: -38.4950,
            instructions: "Dentro da galeria Aldeota Mall"
          }
        ]
      });
    }

    // 3. Seed neighborhood configs for this store
    console.log(`Seeding configs for ${storeData.name}...`);
    let configCount = 0;
    for (const bn of baseNeighborhoods) {
      // Check if config already exists
      const existing = await prisma.neighborhood.findUnique({
        where: {
          storeId_baseNeighborhoodId: {
            storeId: store.id,
            baseNeighborhoodId: bn.id,
          },
        },
      });

      if (!existing) {
        // Set deliveryEnabled = true with a default fee for a couple of neighborhoods to make testing interesting!
        const isDefaultActive = ["aldeota", "meireles", "centro", "coco"].includes(bn.name);
        const defaultFee = bn.name === "aldeota" ? 5.00 : (bn.name === "meireles" ? 7.00 : 10.00);

        await prisma.neighborhood.create({
          data: {
            storeId: store.id,
            baseNeighborhoodId: bn.id,
            deliveryEnabled: isDefaultActive,
            fee: isDefaultActive ? defaultFee : 0.00,
            deliveryTime: "30-50 min",
            notes: isDefaultActive ? "Taxa promocional" : null,
          },
        });
        configCount++;
      }
    }
    console.log(`Created ${configCount} new configs for ${storeData.name}.`);
  }

  console.log("Database seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
