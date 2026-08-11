export type UserRole = 'researcher' | 'policymaker' | 'student';

export interface WaterSample {
  id: string;
  sampleId: string;
  siteId?: string;
  district?: string;
  sampleDate: string;
  lat: number;
  lon: number;
  depthM: number;
  wellId: string;
  labId: string;
  pH: number;
  tds: number; // mg/L
  ec: number; // μS/cm
  dissolvedOxygen?: number; // mg/L
  turbidity?: number; // NTU
  // Heavy metal concentrations in μg/L (ppb)
  as: number; // Arsenic
  hg?: number; // Mercury
  pb: number; // Lead
  cd: number; // Cadmium
  cr: number; // Chromium
  ni: number; // Nickel
  cu: number; // Copper
  zn: number; // Zinc
  fe: number; // Iron
  // Computed indices
  hpi?: number; // Heavy Metal Pollution Index
  hei?: number; // Heavy Metal Evaluation Index
  igeo?: number; // Geoaccumulation Index
  cf?: number; // Contamination Factor
  ef?: number; // Enrichment Factor
  pli?: number; // Pollution Load Index
  hi?: number; // Hazard Index
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface Standard {
  id: string;
  name: string;
  regulator: 'BIS' | 'WHO' | 'EPA' | 'EU';
  effectiveDate: string;
  limits: {
    [metal: string]: number; // μg/L
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  sampleCount: number;
  location: string;
  activeStandard: string;
}

export interface RiskCard {
  sampleId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  primaryContaminant: string;
  contributingFactors: Array<{
    factor: string;
    contribution: number;
  }>;
  recommendation: string;
  explanation: string;
}

export interface DashboardStats {
  totalSamples: number;
  unsafeWells: number;
  criticalWells: number;
  mostContaminated: string;
  avgHPI: number;
  avgHI: number;
}

export interface GlobalSample {
  id: string;
  siteId: string;
  country: string;
  lat: number;
  lon: number;
  as: number;
  pb: number;
  cd: number;
  cr: number;
  hg: number;
  hpi: number;
  hei: number;
  mi: number;
  riskCategory: string;
  waterSafe: string;
}
