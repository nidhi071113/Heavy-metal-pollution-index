import { WaterSample } from '@/types';

export interface HealthRiskPrediction {
  overallRisk: 'Safe' | 'Caution' | 'Unsafe' | 'Dangerous';
  drinkingSafety: string;
  potentialDiseases: Array<{
    disease: string;
    probability: 'Low' | 'Medium' | 'High';
    causedBy: string;
  }>;
  recommendations: string[];
  contaminantAlerts: Array<{
    metal: string;
    level: number;
    limit: number;
    exceedance: number;
    healthEffect: string;
  }>;
  exposureRisk: {
    shortTerm: string;
    longTerm: string;
  };
  vulnerableGroups: string[];
  safetyScore: number; // 0-100
}

// WHO/BIS limits in μg/L
const LIMITS = {
  as: { limit: 10, name: 'Arsenic' },
  pb: { limit: 10, name: 'Lead' },
  cd: { limit: 3, name: 'Cadmium' },
  cr: { limit: 50, name: 'Chromium' },
  hg: { limit: 1, name: 'Mercury' },
  ni: { limit: 20, name: 'Nickel' },
  cu: { limit: 2000, name: 'Copper' },
  zn: { limit: 5000, name: 'Zinc' },
  fe: { limit: 300, name: 'Iron' },
};

// Disease associations by metal
const DISEASE_ASSOCIATIONS: Record<string, Array<{ disease: string; effect: string }>> = {
  as: [
    { disease: 'Arsenicosis (skin lesions)', effect: 'Skin darkening, keratosis, skin cancer' },
    { disease: 'Bladder Cancer', effect: 'Long-term exposure increases bladder cancer risk' },
    { disease: 'Cardiovascular Disease', effect: 'Increased risk of heart disease and stroke' },
    { disease: 'Diabetes Type 2', effect: 'Impairs insulin sensitivity' },
    { disease: 'Peripheral Neuropathy', effect: 'Nerve damage in hands and feet' },
  ],
  pb: [
    { disease: 'Neurological Disorders', effect: 'Cognitive impairment, memory loss' },
    { disease: 'Developmental Delays (Children)', effect: 'Reduced IQ, learning disabilities' },
    { disease: 'Anemia', effect: 'Interferes with hemoglobin production' },
    { disease: 'Kidney Damage', effect: 'Chronic nephropathy' },
    { disease: 'Hypertension', effect: 'Increased blood pressure' },
  ],
  cd: [
    { disease: 'Itai-Itai Disease', effect: 'Bone softening, kidney failure' },
    { disease: 'Kidney Disease', effect: 'Renal tubular dysfunction' },
    { disease: 'Lung Cancer', effect: 'Carcinogenic when inhaled' },
    { disease: 'Osteoporosis', effect: 'Calcium metabolism disruption' },
  ],
  cr: [
    { disease: 'Lung Cancer', effect: 'Hexavalent chromium is carcinogenic' },
    { disease: 'Skin Ulcers', effect: 'Direct contact causes ulceration' },
    { disease: 'Allergic Dermatitis', effect: 'Skin sensitization' },
    { disease: 'Gastrointestinal Issues', effect: 'Stomach ulcers, GI irritation' },
  ],
  hg: [
    { disease: 'Minamata Disease', effect: 'Neurological disorder, vision/hearing loss' },
    { disease: 'Fetal Developmental Disorders', effect: 'Brain damage in developing fetus' },
    { disease: 'Kidney Failure', effect: 'Nephrotoxicity' },
    { disease: 'Tremors & Motor Dysfunction', effect: 'Mercury poisoning symptoms' },
  ],
  ni: [
    { disease: 'Allergic Reactions', effect: 'Skin rashes, contact dermatitis' },
    { disease: 'Respiratory Issues', effect: 'Asthma, bronchitis' },
    { disease: 'Nasal Cancer', effect: 'Occupational exposure risk' },
  ],
};

export function predictHealthRisks(sample: WaterSample): HealthRiskPrediction {
  const contaminantAlerts: HealthRiskPrediction['contaminantAlerts'] = [];
  const potentialDiseases: HealthRiskPrediction['potentialDiseases'] = [];
  const recommendations: string[] = [];
  const vulnerableGroups: string[] = [];
  
  // Check each metal
  const metals: Array<keyof typeof LIMITS> = ['as', 'pb', 'cd', 'cr', 'ni', 'cu', 'zn', 'fe'];
  
  // Add hg if present
  if ('hg' in sample && sample.hg !== undefined) {
    metals.push('hg' as any);
  }
  
  let totalExceedance = 0;
  let criticalCount = 0;
  
  metals.forEach(metal => {
    const value = (sample as any)[metal] as number;
    const { limit, name } = LIMITS[metal] || { limit: 100, name: metal.toUpperCase() };
    
    if (value > limit) {
      const exceedance = ((value - limit) / limit) * 100;
      totalExceedance += exceedance;
      
      if (exceedance > 100) criticalCount++;
      
      contaminantAlerts.push({
        metal: name,
        level: Math.round(value * 100) / 100,
        limit,
        exceedance: Math.round(exceedance),
        healthEffect: getHealthEffect(metal),
      });
      
      // Add diseases for this metal
      const diseases = DISEASE_ASSOCIATIONS[metal] || [];
      diseases.forEach(d => {
        const probability = exceedance > 200 ? 'High' : exceedance > 100 ? 'Medium' : 'Low';
        if (!potentialDiseases.find(pd => pd.disease === d.disease)) {
          potentialDiseases.push({
            disease: d.disease,
            probability,
            causedBy: name,
          });
        }
      });
    }
  });
  
  // Calculate safety score (0-100, higher is safer)
  let safetyScore = 100;
  safetyScore -= Math.min(totalExceedance / 10, 50);
  safetyScore -= criticalCount * 15;
  safetyScore -= ((sample.hi || 0) > 1 ? 20 : (sample.hi || 0) > 0.5 ? 10 : 0);
  safetyScore = Math.max(0, Math.round(safetyScore));
  
  // Determine overall risk
  let overallRisk: HealthRiskPrediction['overallRisk'];
  let drinkingSafety: string;
  
  if (safetyScore >= 80) {
    overallRisk = 'Safe';
    drinkingSafety = '✅ SAFE TO DRINK - Water quality meets safety standards';
  } else if (safetyScore >= 60) {
    overallRisk = 'Caution';
    drinkingSafety = '⚠️ CAUTION - Some contaminants detected, consider filtration';
  } else if (safetyScore >= 30) {
    overallRisk = 'Unsafe';
    drinkingSafety = '🚫 NOT SAFE - Do not drink without proper treatment';
  } else {
    overallRisk = 'Dangerous';
    drinkingSafety = '☠️ DANGEROUS - Immediate health risk, do not use';
  }
  
  // Generate recommendations
  if (contaminantAlerts.length > 0) {
    recommendations.push('Install reverse osmosis (RO) water purification system');
  }
  
  if (contaminantAlerts.some(c => c.metal === 'Arsenic')) {
    recommendations.push('Use arsenic-specific adsorbent filters');
    recommendations.push('Regular medical checkups for arsenicosis symptoms');
    vulnerableGroups.push('Pregnant women', 'Infants', 'Children under 5');
  }
  
  if (contaminantAlerts.some(c => c.metal === 'Lead')) {
    recommendations.push('Replace old lead pipes if present');
    recommendations.push('Blood lead level testing for children');
    vulnerableGroups.push('Children', 'Pregnant women');
  }
  
  if (contaminantAlerts.some(c => c.metal === 'Mercury')) {
    recommendations.push('Immediate evacuation from water source');
    recommendations.push('Neurological examination recommended');
    vulnerableGroups.push('Pregnant women', 'Infants', 'Elderly');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Continue regular water quality monitoring');
    recommendations.push('Annual health checkup recommended');
  }
  
  // Sort diseases by probability
  potentialDiseases.sort((a, b) => {
    const order = { High: 0, Medium: 1, Low: 2 };
    return order[a.probability] - order[b.probability];
  });
  
  return {
    overallRisk,
    drinkingSafety,
    potentialDiseases: potentialDiseases.slice(0, 5),
    recommendations,
    contaminantAlerts: contaminantAlerts.sort((a, b) => b.exceedance - a.exceedance),
    exposureRisk: {
      shortTerm: getShortTermRisk(sample),
      longTerm: getLongTermRisk(sample),
    },
    vulnerableGroups: [...new Set(vulnerableGroups)],
    safetyScore,
  };
}

function getHealthEffect(metal: string): string {
  const effects: Record<string, string> = {
    as: 'Carcinogenic, affects skin and internal organs',
    pb: 'Neurotoxic, affects brain development',
    cd: 'Nephrotoxic, causes bone diseases',
    cr: 'Carcinogenic, causes respiratory issues',
    hg: 'Neurotoxic, affects nervous system',
    ni: 'Allergenic, respiratory irritant',
    cu: 'Gastrointestinal irritation',
    zn: 'Nausea, stomach cramps',
    fe: 'Hemochromatosis risk',
  };
  return effects[metal] || 'May cause health issues';
}

function getShortTermRisk(sample: WaterSample): string {
  const hi = sample.hi || 0;
  if (hi > 2) return 'Severe - Immediate symptoms likely (nausea, vomiting, diarrhea)';
  if (hi > 1) return 'High - May experience gastrointestinal discomfort';
  if (hi > 0.5) return 'Moderate - Minor symptoms possible with regular consumption';
  return 'Low - No immediate health effects expected';
}

function getLongTermRisk(sample: WaterSample): string {
  const hpi = sample.hpi || 0;
  if (hpi > 300) return 'Critical - High cancer risk, organ damage likely with continued exposure';
  if (hpi > 150) return 'High - Increased risk of chronic diseases over 5-10 years';
  if (hpi > 75) return 'Moderate - Some health impacts possible over 10-20 years';
  return 'Low - Minimal long-term health concerns';
}
