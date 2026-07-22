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

const defaultLinesOfBusiness = [
  // Alimentos e Alimentação
  { code: 'restaurant', name: 'Restaurante' },
  { code: 'pizzeria', name: 'Pizzaria' },
  { code: 'burger_shop', name: 'Hamburgueria / Sanduíches' },
  { code: 'snack_bar', name: 'Lanchonete e Salgados' },
  { code: 'bakery', name: 'Padaria e Confeitaria' },
  { code: 'butcher_shop', name: 'Açougue e Peixaria' },
  { code: 'beverage_distributor', name: 'Distribuidora de Bebidas e Adega' },
  { code: 'coffee_shop', name: 'Cafeteria e Doceria' },
  { code: 'ice_cream_acai', name: 'Sorveteria e Açaí' },
  { code: 'supermarket', name: 'Supermercado e Minimercado' },
  { code: 'fruit_grocery', name: 'Hortifrúti e Mercearia' },
  { code: 'meal_prep', name: 'Marmitaria e Comida Caseira' },
  { code: 'japanese_food', name: 'Comida Japonesa e Oriental' },
  { code: 'healthy_fitness_food', name: 'Comida Saudável e Fitness' },
  { code: 'bar_pub', name: 'Bar, Pub e Choperia' },
  { code: 'chocolate_candy', name: 'Chocolataria e Bomboniere' },
  { code: 'pastelaria', name: 'Pastelaria' },
  { code: 'tapiocaria', name: 'Tapiocaria e Comidas Típicas' },
  { code: 'creperia', name: 'Creperia' },
  { code: 'espetaria', name: 'Espetaria e Churrasquinho' },

  // Moda, Vestuário e Acessórios
  { code: 'clothing_store', name: 'Loja de Roupas' },
  { code: 'mens_fashion', name: 'Moda Masculina' },
  { code: 'womens_fashion', name: 'Moda Feminina' },
  { code: 'kids_fashion', name: 'Moda Infantil e Bebê' },
  { code: 'footwear_bags', name: 'Calçados, Bolsas e Acessórios' },
  { code: 'beach_fitness_wear', name: 'Moda Praia e Fitness' },
  { code: 'fitness_wear', name: 'Moda Fitness' },
  { code: 'beach_wear', name: 'Moda Praia' },
  { code: 'lingerie_sleepwear', name: 'Lingerie e Moda Íntima' },
  { code: 'thrifting_vintage', name: 'Brechó e Roupas Usadas' },
  { code: 'uniforms_workwear', name: 'Uniformes e Jalecos' },
  { code: 'jewelry_bijoux', name: 'Joalheria, Semijoias e Bijuterias' },
  { code: 'eyewear_optics', name: 'Ótica e Óculos de Sol' },

  // Saúde, Beleza e Bem-Estar
  { code: 'beauty_salon', name: 'Salão de Beleza e Cabeleireiro' },
  { code: 'barbershop', name: 'Barbearia' },
  { code: 'aesthetics_clinic', name: 'Estética, Manicure e Sobrancelhas' },
  { code: 'pharmacy', name: 'Farmácia e Drogaria' },
  { code: 'cosmetics_perfumery', name: 'Cosméticos, Maquiagem e Perfumaria' },
  { code: 'gym', name: 'Academia, Crossfit e Studio de Lutas' },
  { code: 'pilates_yoga', name: 'Studio de Pilates e Yoga' },
  { code: 'dental_clinic', name: 'Clínica Odontológica' },
  { code: 'physiotherapy_massage', name: 'Fisioterapia e Massoterapia' },
  { code: 'supplements', name: 'Suplementos Alimentares e Nutrição' },
  { code: 'compounding_pharmacy', name: 'Farmácia de Manipulação' },

  // Pet Shop e Veterinária
  { code: 'pet_shop', name: 'Pet Shop e Rações' },
  { code: 'vet_clinic', name: 'Clínica Veterinária' },
  { code: 'grooming_salon', name: 'Banho e Tosa' },

  // Casa, Decoração e Construção
  { code: 'furniture_decor', name: 'Móveis e Decoração' },
  { code: 'home_goods', name: 'Utilidades Domésticas' },
  { code: 'bed_bath_table', name: 'Cama, Mesa e Banho' },
  { code: 'construction_materials', name: 'Material de Construção' },
  { code: 'lighting_electrical', name: 'Iluminação e Material Elétrico' },
  { code: 'paints_hardware', name: 'Tintas, Ferragens e Ferramentas' },
  { code: 'gardening_plants', name: 'Jardinagem, Paisagismo e Plantas' },
  { code: 'plumbing_gas', name: 'Hidráulica e Gás' },
  { code: 'keychain_locks', name: 'Chaveiro e Segurança' },

  // Tecnologia e Eletrônicos
  { code: 'cellphone_repair_accessories', name: 'Assistência Técnica e Acessórios para Celular' },
  { code: 'electronics_store', name: 'Eletrônicos e Eletrodomésticos' },
  { code: 'computer_store', name: 'Informática e Computadores' },
  { code: 'gaming_store', name: 'Games, Consoles e Geek' },
  { code: 'audio_video', name: 'Áudio, Vídeo e Som' },

  // Automotivo e Transportes
  { code: 'auto_parts', name: 'Autopeças e Acessórios Automotivos' },
  { code: 'auto_repair', name: 'Oficina Mecânica e Auto Center' },
  { code: 'car_wash', name: 'Lava Jato e Estética Automotiva' },
  { code: 'motorcycle_parts', name: 'Motopeças e Oficina de Motos' },
  { code: 'tires_alignment', name: 'Pneus e Alinhamento' },
  { code: 'bicycle_shop', name: 'Bicicletaria e Oficina de Bikes' },

  // Serviços, Presentes e Papelaria
  { code: 'stationery_printing', name: 'Gráfica, Papelaria e Copiadora' },
  { code: 'haberdashery_crafts', name: 'Armarinho, Aviamentos e Artesanato' },
  { code: 'florist_gifts', name: 'Floricultura e Presentes' },
  { code: 'toy_store', name: 'Loja de Brinquedos' },
  { code: 'tobacconist_headshop', name: 'Tabacaria e Headshop' },
  { code: 'party_supplies', name: 'Artigos de Festa e Confeitaria' },
  { code: 'bookstore', name: 'Livraria e Sebo' },
  { code: 'variety_store', name: 'Loja de Variedades' },
  { code: 'cleaners_laundry', name: 'Lavanderia e Passadoria' },
  { code: 'tailor_sewing', name: 'Costura e Ajustes' },
  { code: 'dry_cleaning', name: 'Produtos de Limgiene' },
  { code: 'event_planning', name: 'Buffet e Decoração de Festas' },
  { code: 'photo_video_studio', name: 'Estúdio Fotográfico e Revelação' },

  // Outros Serviços
  { code: 'educational_courses', name: 'Escola, Cursos e Idiomas' },
  { code: 'coworking_office', name: 'Escritório e Coworking' },
  { code: 'accounting_legal', name: 'Contabilidade e Consultoria' },
  { code: 'real_estate', name: 'Imobiliária e Corretagem' }
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

  // 1. Seed Lines of Business
  console.log("Seeding lines of business...");
  let lobSortOrder = 1;
  for (const lob of defaultLinesOfBusiness) {
    await prisma.lineOfBusiness.upsert({
      where: { code: lob.code },
      update: { name: lob.name, sortOrder: lobSortOrder, isActive: true },
      create: {
        code: lob.code,
        name: lob.name,
        sortOrder: lobSortOrder,
        isActive: true,
      },
    });
    lobSortOrder++;
  }
  console.log(`Successfully seeded ${defaultLinesOfBusiness.length} lines of business.`);

  // 2. Seed base neighborhoods
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

  // 3. Seed Stores
  const storesToSeed = [
    {
      slug: "fortal-express",
      name: "Fortal Express",
      whatsapp: "5585999999999",
      address: "Av. Beira Mar, 1000 - Meireles, Fortaleza - CE",
      operatingHours: "Segunda a Sábado: 09:00 às 21:00",
      pickupEnabled: true,
      lineOfBusiness: "clothing_store",
    },
    {
      slug: "pizzaria-bella",
      name: "Pizzaria Bella Fortaleza",
      whatsapp: "5585988888888",
      address: "Av. Dom Luís, 500 - Aldeota, Fortaleza - CE",
      operatingHours: "Todos os dias: 18:00 às 23:30",
      pickupEnabled: true,
      lineOfBusiness: "pizzeria",
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
        lineOfBusiness: storeData.lineOfBusiness,
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
