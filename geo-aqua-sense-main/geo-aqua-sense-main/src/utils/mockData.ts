import { WaterSample, Standard, Project } from '@/types';

// Background concentrations (crustal averages in μg/L)
export const BACKGROUND_VALUES = {
  as: 5,
  pb: 10,
  cd: 1,
  cr: 50,
  ni: 20,
  cu: 30,
  zn: 50,
  fe: 100,
};

// Standard limits (μg/L)
export const STANDARDS: Standard[] = [
  {
    id: 'bis-2012',
    name: 'BIS 10500:2012',
    regulator: 'BIS',
    effectiveDate: '2012-05-01',
    limits: {
      as: 10,
      pb: 10,
      cd: 3,
      cr: 50,
      ni: 20,
      cu: 1000,
      zn: 5000,
      fe: 300,
    },
  },
  {
    id: 'who-2017',
    name: 'WHO Guidelines 2017',
    regulator: 'WHO',
    effectiveDate: '2017-01-01',
    limits: {
      as: 10,
      pb: 10,
      cd: 3,
      cr: 50,
      ni: 70,
      cu: 2000,
      zn: 3000,
      fe: 300,
    },
  },
  {
    id: 'epa-2023',
    name: 'US EPA 2023',
    regulator: 'EPA',
    effectiveDate: '2023-01-01',
    limits: {
      as: 10,
      pb: 15,
      cd: 5,
      cr: 100,
      ni: 100,
      cu: 1300,
      zn: 5000,
      fe: 300,
    },
  },
];

// Reference doses for HI calculation (mg/kg-day)
const RFD_VALUES = {
  as: 0.0003,
  pb: 0.0035,
  cd: 0.001,
  cr: 0.003,
  ni: 0.02,
  cu: 0.04,
  zn: 0.3,
  fe: 0.7,
};

// Compute HPI (Heavy Metal Pollution Index)
function computeHPI(sample: WaterSample, standard: Standard): number {
  const metals = ['as', 'pb', 'cd', 'cr', 'ni', 'cu', 'zn'];
  let sumWiQi = 0;
  let sumWi = 0;

  metals.forEach((metal) => {
    const Mi = sample[metal as keyof WaterSample] as number;
    const Si = standard.limits[metal];
    const Wi = 1 / Si;
    const Qi = ((Mi - 0) / (Si - 0)) * 100;
    sumWiQi += Wi * Qi;
    sumWi += Wi;
  });

  return sumWiQi / sumWi;
}

// Compute HEI (Heavy Metal Evaluation Index)
function computeHEI(sample: WaterSample, standard: Standard): number {
  const metals = ['as', 'pb', 'cd', 'cr', 'ni', 'cu', 'zn'];
  return metals.reduce((sum, metal) => {
    const Ci = sample[metal as keyof WaterSample] as number;
    const Si = standard.limits[metal];
    return sum + Ci / Si;
  }, 0);
}

// Compute Igeo (Geoaccumulation Index) - average across metals
function computeIgeo(sample: WaterSample): number {
  const metals = ['as', 'pb', 'cd', 'cr', 'ni', 'cu', 'zn'];
  const igeoValues = metals.map((metal) => {
    const Ci = sample[metal as keyof WaterSample] as number;
    const Bi = BACKGROUND_VALUES[metal as keyof typeof BACKGROUND_VALUES];
    return Math.log2(Ci / (1.5 * Bi));
  });
  return igeoValues.reduce((a, b) => a + b, 0) / igeoValues.length;
}

// Compute CF (Contamination Factor) and Cd (Degree of Contamination)
function computeCF(sample: WaterSample): number {
  const metals = ['as', 'pb', 'cd', 'cr', 'ni', 'cu', 'zn'];
  return metals.reduce((sum, metal) => {
    const Ci = sample[metal as keyof WaterSample] as number;
    const Bi = BACKGROUND_VALUES[metal as keyof typeof BACKGROUND_VALUES];
    return sum + Ci / Bi;
  }, 0);
}

// Compute EF (Enrichment Factor) - using Fe as reference
function computeEF(sample: WaterSample): number {
  const metals = ['as', 'pb', 'cd', 'cr', 'ni', 'cu', 'zn'];
  const CrefSample = sample.fe;
  const BrefFe = BACKGROUND_VALUES.fe;
  
  const efValues = metals.map((metal) => {
    const Ci = sample[metal as keyof WaterSample] as number;
    const Bi = BACKGROUND_VALUES[metal as keyof typeof BACKGROUND_VALUES];
    return (Ci / CrefSample) / (Bi / BrefFe);
  });
  
  return efValues.reduce((a, b) => a + b, 0) / efValues.length;
}

// Compute PLI (Pollution Load Index)
function computePLI(sample: WaterSample): number {
  const metals = ['as', 'pb', 'cd', 'cr', 'ni', 'cu', 'zn'];
  const cfValues = metals.map((metal) => {
    const Ci = sample[metal as keyof WaterSample] as number;
    const Bi = BACKGROUND_VALUES[metal as keyof typeof BACKGROUND_VALUES];
    return Ci / Bi;
  });
  
  const product = cfValues.reduce((a, b) => a * b, 1);
  return Math.pow(product, 1 / cfValues.length);
}

// Compute HI (Hazard Index)
function computeHI(sample: WaterSample): number {
  const metals = ['as', 'pb', 'cd', 'cr', 'ni', 'cu', 'zn', 'fe'];
  const IR = 2; // Ingestion rate (L/day)
  const EF = 365; // Exposure frequency (days/year)
  const ED = 30; // Exposure duration (years)
  const BW = 70; // Body weight (kg)
  const AT = 365 * ED; // Averaging time (days)

  return metals.reduce((sum, metal) => {
    const C = (sample[metal as keyof WaterSample] as number) / 1000; // Convert μg/L to mg/L
    const RfD = RFD_VALUES[metal as keyof typeof RFD_VALUES];
    const ADD = (C * IR * EF * ED) / (BW * AT);
    const HQ = ADD / RfD;
    return sum + HQ;
  }, 0);
}

// Determine risk level based on indices
function determineRiskLevel(hpi: number, hi: number): 'low' | 'medium' | 'high' | 'critical' {
  if (hi >= 2 || hpi >= 300) return 'critical';
  if (hi >= 1 || hpi >= 150) return 'high';
  if (hi >= 0.5 || hpi >= 75) return 'medium';
  return 'low';
}

// Compute all indices for a sample
export function computeIndices(sample: WaterSample, standardId: string = 'bis-2012'): WaterSample {
  const standard = STANDARDS.find((s) => s.id === standardId) || STANDARDS[0];
  
  const hpi = computeHPI(sample, standard);
  const hei = computeHEI(sample, standard);
  const igeo = computeIgeo(sample);
  const cf = computeCF(sample);
  const ef = computeEF(sample);
  const pli = computePLI(sample);
  const hi = computeHI(sample);
  const riskLevel = determineRiskLevel(hpi, hi);

  return {
    ...sample,
    hpi,
    hei,
    igeo,
    cf,
    ef,
    pli,
    hi,
    riskLevel,
  };
}

// Generate realistic mock water samples
export function generateMockSamples(count: number = 500): WaterSample[] {
  const samples: WaterSample[] = [];
  const startDate = new Date('2020-01-01');
  
  // Define hotspot regions (lat, lon, contamination multiplier)
  const hotspots = [
    { lat: 23.0225, lon: 72.5714, factor: 3.5, name: 'Ahmedabad Industrial' },
    { lat: 22.7196, lon: 75.8577, factor: 2.8, name: 'Indore' },
    { lat: 26.9124, lon: 75.7873, factor: 2.2, name: 'Jaipur' },
    { lat: 28.7041, lon: 77.1025, factor: 3.0, name: 'Delhi NCR' },
    { lat: 19.0760, lon: 72.8777, factor: 2.5, name: 'Mumbai' },
  ];

  for (let i = 0; i < count; i++) {
    // Random date within last 5 years
    const dayOffset = Math.floor(Math.random() * 1825);
    const sampleDate = new Date(startDate);
    sampleDate.setDate(sampleDate.getDate() + dayOffset);

    // Select a hotspot or random location
    const useHotspot = Math.random() > 0.3;
    let lat, lon, contaminationFactor;
    
    if (useHotspot) {
      const hotspot = hotspots[Math.floor(Math.random() * hotspots.length)];
      // Add some variation around hotspot
      lat = hotspot.lat + (Math.random() - 0.5) * 0.3;
      lon = hotspot.lon + (Math.random() - 0.5) * 0.3;
      contaminationFactor = hotspot.factor;
    } else {
      // Random location in India (approximate bounds)
      lat = 8 + Math.random() * 28;
      lon = 68 + Math.random() * 29;
      contaminationFactor = 0.5 + Math.random() * 1.5;
    }

    // Seasonal variation (monsoon effect)
    const month = sampleDate.getMonth();
    const seasonalFactor = month >= 6 && month <= 9 ? 1.3 : 1.0; // Higher during monsoon

    // Generate concentrations with realistic distributions
    const baseMultiplier = contaminationFactor * seasonalFactor;
    
    const sample: WaterSample = {
      id: `sample-${i + 1}`,
      sampleId: `HMPI-${String(i + 1).padStart(5, '0')}`,
      sampleDate: sampleDate.toISOString().split('T')[0],
      lat: parseFloat(lat.toFixed(6)),
      lon: parseFloat(lon.toFixed(6)),
      depthM: 10 + Math.random() * 90,
      wellId: `WELL-${Math.floor(Math.random() * 1000) + 1}`,
      labId: `LAB-${Math.floor(Math.random() * 10) + 1}`,
      pH: 6.5 + Math.random() * 2,
      tds: 200 + Math.random() * 800,
      ec: 300 + Math.random() * 1200,
      // Heavy metals with log-normal distributions
      as: Math.max(0.5, BACKGROUND_VALUES.as * baseMultiplier * Math.exp(Math.random() * 2)),
      pb: Math.max(0.5, BACKGROUND_VALUES.pb * baseMultiplier * Math.exp(Math.random() * 1.8)),
      cd: Math.max(0.1, BACKGROUND_VALUES.cd * baseMultiplier * Math.exp(Math.random() * 2.2)),
      cr: Math.max(1, BACKGROUND_VALUES.cr * baseMultiplier * Math.exp(Math.random() * 1.5)),
      ni: Math.max(1, BACKGROUND_VALUES.ni * baseMultiplier * Math.exp(Math.random() * 1.6)),
      cu: Math.max(5, BACKGROUND_VALUES.cu * baseMultiplier * Math.exp(Math.random() * 1.3)),
      zn: Math.max(10, BACKGROUND_VALUES.zn * baseMultiplier * Math.exp(Math.random() * 1.4)),
      fe: Math.max(20, BACKGROUND_VALUES.fe * baseMultiplier * Math.exp(Math.random() * 1.2)),
    };

    samples.push(computeIndices(sample));
  }

  return samples;
}

// Generate mock projects
export function generateMockProjects(): Project[] {
  return [
    {
      id: 'proj-1',
      name: 'Gujarat Groundwater Survey 2023-24',
      description: 'Comprehensive heavy metal assessment of groundwater sources across Gujarat state',
      createdAt: '2023-06-15',
      createdBy: 'Dr. Amit Patel',
      sampleCount: 245,
      location: 'Gujarat',
      activeStandard: 'bis-2012',
    },
    {
      id: 'proj-2',
      name: 'Delhi NCR Industrial Zone Monitoring',
      description: 'Industrial area groundwater quality monitoring for heavy metal contamination',
      createdAt: '2023-09-01',
      createdBy: 'Dr. Priya Sharma',
      sampleCount: 180,
      location: 'Delhi NCR',
      activeStandard: 'who-2017',
    },
    {
      id: 'proj-3',
      name: 'National Aquifer Study Phase II',
      description: 'Multi-state heavy metal pollution index assessment',
      createdAt: '2024-01-10',
      createdBy: 'CGWB Research Team',
      sampleCount: 520,
      location: 'Multi-state',
      activeStandard: 'bis-2012',
    },
  ];
}
