import fs from 'fs';
import path from 'path';
import osmtogeojson from 'osmtogeojson';

function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .trim();
}

const MIRRORS = [
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.nchc.org.tw/api/interpreter'
];

async function fetchWithTimeout(url: string, options: any, timeoutMs = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function fetchGeoJSON() {
  // Query strictly for administrative boundaries of admin_level=10 (neighborhoods)
  // this avoids fetching SERs (regionals) which are at admin_level=9 and overlay neighborhoods
  const query = `[out:json][timeout:60];
area["name"="Fortaleza"]["boundary"="administrative"]["admin_level"="8"]->.searchArea;
(
  rel["boundary"="administrative"]["admin_level"="10"](area.searchArea);
  way["boundary"="administrative"]["admin_level"="10"](area.searchArea);
);
out geom;`;

  console.log("Starting Fortaleza neighborhood boundaries fetch from Overpass API...");

  let success = false;
  let osmJson: any = null;

  for (const mirrorUrl of MIRRORS) {
    console.log(`Trying Overpass mirror: ${mirrorUrl}...`);
    try {
      const response = await fetchWithTimeout(mirrorUrl, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'FreteFortalAgent/1.0 (contact: admin@fretefortal.com)'
        }
      }, 45000);

      if (!response.ok) {
        console.warn(`Mirror ${mirrorUrl} returned status ${response.status}: ${response.statusText}`);
        continue;
      }

      const text = await response.text();
      
      if (text.trim().startsWith('<!DOCTYPE') || text.includes('<html')) {
        console.warn(`Mirror ${mirrorUrl} returned HTML instead of JSON. Server might be busy.`);
        continue;
      }

      try {
        osmJson = JSON.parse(text);
      } catch (e) {
        console.warn(`Mirror ${mirrorUrl} returned invalid JSON:`, e);
        continue;
      }

      if (!osmJson.elements || osmJson.elements.length === 0) {
        console.warn(`Mirror ${mirrorUrl} returned 0 elements.`);
        continue;
      }

      console.log(`Successfully fetched ${osmJson.elements.length} elements from ${mirrorUrl}`);
      success = true;
      break;
    } catch (err: any) {
      console.warn(`Failed to fetch from mirror ${mirrorUrl}:`, err.message || err);
    }
  }

  if (!success || !osmJson) {
    console.error("All Overpass mirrors failed or returned no data. Please verify network or try again later.");
    process.exit(1);
  }

  try {
    console.log("Converting OSM JSON to GeoJSON...");
    const geojson = osmtogeojson(osmJson);

    // Normalize properties for database matching
    console.log("Normalizing properties...");
    const processedFeatures = geojson.features.map((feature: any) => {
      const tags = feature.properties?.tags || {};
      const officialName = tags.name || feature.properties?.name || 'Sem Nome';
      const normalized = normalizeName(officialName);

      return {
        type: feature.type,
        id: feature.id,
        geometry: feature.geometry,
        properties: {
          name: normalized,
          officialName: officialName,
        }
      };
    });

    const processedGeojson = {
      type: "FeatureCollection",
      features: processedFeatures
    };

    const outputPath = path.join(process.cwd(), 'public', 'bairros-fortaleza.geojson');
    
    // Ensure public folder exists
    const publicDir = path.dirname(outputPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(processedGeojson, null, 2));
    console.log(`Successfully generated GeoJSON and saved to ${outputPath}`);
    console.log(`Found ${processedFeatures.length} neighborhood polygons.`);
  } catch (error) {
    console.error("Error processing GeoJSON data:", error);
    process.exit(1);
  }
}

fetchGeoJSON();
