import fs from 'fs';
import path from 'path';

// Define the rawNeighborhoods from seed.ts manually or load them
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
  "Guarapes", // Typo in seed, should be Guararapes?
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
  "Vila Pery", // Typo in seed, should be Vila Peri?
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

const geojsonPath = path.join(process.cwd(), 'public', 'bairros-fortaleza.geojson');
const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

const geojsonBairros = geojson.features.map((f: any) => ({
  name: f.properties.name,
  officialName: f.properties.officialName
}));

const dbNormalized = new Set(rawNeighborhoods.map(normalizeName));
const geojsonNormalized = new Set(geojsonBairros.map((b: any) => b.name));

console.log("=== IN GEOJSON BUT NOT IN SEED.TS ===");
const missingInSeed: any[] = [];
for (const b of geojsonBairros) {
  if (!dbNormalized.has(b.name)) {
    missingInSeed.push(b);
  }
}
// Remove duplicates from missingInSeed
const uniqueMissing = Array.from(new Map(missingInSeed.map(item => [item.name, item])).values());
console.log(JSON.stringify(uniqueMissing, null, 2));

console.log("\n=== IN SEED.TS BUT NOT IN GEOJSON ===");
const missingInGeojson: string[] = [];
for (const name of rawNeighborhoods) {
  const norm = normalizeName(name);
  if (!geojsonNormalized.has(norm)) {
    missingInGeojson.push(name);
  }
}
console.log(JSON.stringify(missingInGeojson, null, 2));
