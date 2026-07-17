import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client/scripts/default-index.js';
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
  "Autran Nunes",
  "Barra do Ceará",
  "Barroso",
  "Bela Vista",
  "Benfica",
  "Bom Futuro",
  "Bom Jardim",
  "Bonsucesso",
  "Cais do Porto",
  "Cajazeiras",
  "Cambeba",
  "Canindezinho",
  "Carlito Pamplona",
  "Castelão",
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
  "Guarapes",
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
  "Sapiranga",
  "Manoel Sátiro",
  "Manuel Dias Branco",
  "Maraponga",
  "Meireles",
  "Messejana",
  "Mondubim",
  "Monte Castelo",
  "Montese",
  "Mucuripe",
  "Padre Andrade",
  "Panamericano",
  "Papicu",
  "Parangaba",
  "Parque Araxá",
  "Parque Dois Irmãos",
  "Parque Iracema",
  "Parque Manibura",
  "Parque Presidente Vargas",
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
  "Rodolfo Teófilo",
  "Sabiaguaba",
  "Salinas",
  "São Bento",
  "São João do Tauape",
  "Serrinha",
  "Siqueira",
  "Varjota",
  "Vicente Pinzon",
  "Vila Ellery",
  "Vila Pery",
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

  // Seed default store
  const storeCount = await prisma.store.count();
  if (storeCount === 0) {
    await prisma.store.create({
      data: {
        name: "Fortal Express",
        whatsapp: "5585999999999",
        address: "Av. Beira Mar, 1000 - Meireles, Fortaleza - CE",
        operatingHours: "Segunda a Sábado: 09:00 às 21:00",
        pickupEnabled: true,
      },
    });
    console.log("Default store created.");
  }

  // Seed neighborhoods
  let createdCount = 0;
  for (const officialName of rawNeighborhoods) {
    const normalizedName = normalizeName(officialName);

    await prisma.neighborhood.upsert({
      where: { name: normalizedName },
      update: {
        officialName,
      },
      create: {
        name: normalizedName,
        officialName,
        deliveryEnabled: false,
        fee: 0.00,
        deliveryTime: "24h",
      },
    });
    createdCount++;
  }

  console.log(`Successfully seeded ${createdCount} neighborhoods.`);
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
