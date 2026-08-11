import { WaterSample } from '@/types';
import { computeIndices } from './mockData';

interface RawCSVRow {
  Timestamp: string;
  Location: string;
  pH: string;
  Dissolved_Oxygen_mg_L: string;
  Turbidity_NTU: string;
  Conductivity_uS_cm: string;
  Arsenic_mg_L: string;
  Lead_mg_L: string;
  Cadmium_mg_L: string;
  Chromium_mg_L: string;
  Mercury_mg_L: string;
  Latitude: string;
  Longitude: string;
}

export function parseCSVData(csvText: string): WaterSample[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  const samples: WaterSample[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });
    
    // Convert mg/L to μg/L (multiply by 1000)
    const arsenic = parseFloat(row['Arsenic_mg_L'] || '0') * 1000;
    const lead = parseFloat(row['Lead_mg_L'] || '0') * 1000;
    const cadmium = parseFloat(row['Cadmium_mg_L'] || '0') * 1000;
    const chromium = parseFloat(row['Chromium_mg_L'] || '0') * 1000;
    const mercury = parseFloat(row['Mercury_mg_L'] || '0') * 1000;
    
    // Parse date from timestamp
    const timestamp = row['Timestamp'] || '';
    const dateStr = timestamp.split(' ')[0] || new Date().toISOString().split('T')[0];
    
    const sample: WaterSample = {
      id: `sample-${i}`,
      sampleId: `GW-${String(i).padStart(4, '0')}`,
      sampleDate: formatDateString(dateStr),
      lat: parseFloat(row['Latitude'] || '18.5'),
      lon: parseFloat(row['Longitude'] || '73.8'),
      depthM: Math.round(10 + Math.random() * 90),
      wellId: row['Location'] || `WELL-${i}`,
      labId: `LAB-${Math.floor(Math.random() * 10) + 1}`,
      pH: parseFloat(row['pH'] || '7'),
      tds: parseFloat(row['Conductivity_uS_cm'] || '500') * 0.65,
      ec: parseFloat(row['Conductivity_uS_cm'] || '500'),
      dissolvedOxygen: parseFloat(row['Dissolved_Oxygen_mg_L'] || '5'),
      turbidity: parseFloat(row['Turbidity_NTU'] || '5'),
      // Heavy metals in μg/L
      as: arsenic,
      pb: lead,
      cd: cadmium,
      cr: chromium,
      hg: mercury,
      ni: Math.random() * 30, // Generate since not in dataset
      cu: Math.random() * 100,
      zn: Math.random() * 200,
      fe: Math.random() * 150,
    };
    
    // Compute all pollution indices
    const computedSample = computeIndices(sample);
    samples.push(computedSample);
  }
  
  return samples;
}

function formatDateString(dateStr: string): string {
  // Handle formats like "1/1/2024" or "2024-01-01"
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }
  return dateStr;
}

export async function loadCSVData(): Promise<WaterSample[]> {
  try {
    const response = await fetch('/data/groundwater_data.csv');
    if (!response.ok) {
      throw new Error('Failed to load CSV');
    }
    const csvText = await response.text();
    return parseCSVData(csvText);
  } catch (error) {
    console.error('Error loading CSV:', error);
    return [];
  }
}

export function parseGlobalCSVData(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  const samples: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length < 10) continue;
    
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });
    
    samples.push({
      id: `global-${i}`,
      siteId: row['site_id'],
      country: row['country'],
      lat: parseFloat(row['latitude'] || '0'),
      lon: parseFloat(row['longitude'] || '0'),
      as: parseFloat(row['As_ugL'] || '0'),
      pb: parseFloat(row['Pb_ugL'] || '0'),
      cd: parseFloat(row['Cd_ugL'] || '0'),
      cr: parseFloat(row['Cr_ugL'] || '0'),
      hg: parseFloat(row['Hg_ugL'] || '0'),
      hpi: parseFloat(row['HPI'] || '0'),
      hei: parseFloat(row['HEI'] || '0'),
      mi: parseFloat(row['MI'] || '0'),
      riskCategory: row['risk_category'] || 'Unknown',
      waterSafe: row['water_safe'] || 'Unknown'
    });
  }
  
  return samples;
}

export async function loadGlobalCSVData(): Promise<any[]> {
  try {
    const response = await fetch('/data/global_data.csv');
    if (!response.ok) {
      throw new Error('Failed to load global CSV');
    }
    const csvText = await response.text();
    return parseGlobalCSVData(csvText);
  } catch (error) {
    console.error('Error loading global CSV:', error);
    return [];
  }
}

// Parser for groundwater_data_1000_rows.csv
// Columns: SampleID, Location, Latitude, Longitude, pH, As, Pb, Cd, Cr, Hg, Fe, Mn, Zn, Cu  (values in mg/L)
export function parseMaharashtraCSVData(csvText: string): WaterSample[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const samples: WaterSample[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length < 8) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx]?.trim() || '0'; });

    // All heavy metals in mg/L -> convert to μg/L (*1000)
    const arsenic  = parseFloat(row['As']  || '0') * 1000;
    const lead     = parseFloat(row['Pb']  || '0') * 1000;
    const cadmium  = parseFloat(row['Cd']  || '0') * 1000;
    const chromium = parseFloat(row['Cr']  || '0') * 1000;
    const mercury  = parseFloat(row['Hg']  || '0') * 1000;
    const iron     = parseFloat(row['Fe']  || '0') * 1000;
    const zinc     = parseFloat(row['Zn']  || '0') * 1000;
    const copper   = parseFloat(row['Cu']  || '0') * 1000;
    const manganese= parseFloat(row['Mn']  || '0') * 1000;

    const sample: WaterSample = {
      id: `mah-${i}`,
      siteId: row['SampleID'] || `S${i}`,
      sampleId: row['SampleID'] || `GW-${String(i).padStart(4,'0')}`,
      district: row['Location'] || 'Maharashtra',
      sampleDate: new Date().toISOString().split('T')[0],
      lat: parseFloat(row['Latitude'] || '19.0'),
      lon: parseFloat(row['Longitude'] || '75.0'),
      depthM: Math.round(10 + (i % 90)),
      wellId: `${row['Location']}-W${i}`,
      labId: `LAB-${(i % 5) + 1}`,
      pH: parseFloat(row['pH'] || '7'),
      tds: manganese * 0.65,
      ec: manganese,
      as: arsenic,
      pb: lead,
      cd: cadmium,
      cr: chromium,
      hg: mercury,
      ni: manganese * 0.3,
      cu: copper,
      zn: zinc,
      fe: iron,
    };

    const computed = computeIndices(sample);
    samples.push(computed);
  }
  return samples;
}

export async function loadMaharashtraCSVData(): Promise<WaterSample[]> {
  try {
    const response = await fetch('/data/groundwater_maharashtra.csv');
    if (!response.ok) throw new Error('Failed to load Maharashtra CSV');
    const csvText = await response.text();
    return parseMaharashtraCSVData(csvText);
  } catch (error) {
    console.error('Error loading Maharashtra CSV:', error);
    return [];
  }
}
