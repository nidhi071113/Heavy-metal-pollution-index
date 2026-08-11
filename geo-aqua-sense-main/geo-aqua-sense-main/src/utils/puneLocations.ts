// Famous Pune locations with coordinates for search/navigation
export interface PuneLocation {
  name: string;
  aliases: string[];
  lat: number;
  lon: number;
  area: string;
}

export const PUNE_LOCATIONS: PuneLocation[] = [
  { name: 'Swargate', aliases: ['swargate', 'swar gate'], lat: 18.5018, lon: 73.8636, area: 'Central Pune' },
  { name: 'Shivajinagar', aliases: ['shivaji nagar', 'shivajinagar'], lat: 18.5308, lon: 73.8475, area: 'Central Pune' },
  { name: 'Kothrud', aliases: ['kothrud'], lat: 18.5074, lon: 73.8077, area: 'West Pune' },
  { name: 'Hinjewadi', aliases: ['hinjewadi', 'hinjawadi', 'rajiv gandhi infotech park'], lat: 18.5912, lon: 73.7389, area: 'IT Hub' },
  { name: 'Kharadi', aliases: ['kharadi'], lat: 18.5515, lon: 73.9472, area: 'East Pune' },
  { name: 'Wakad', aliases: ['wakad'], lat: 18.5984, lon: 73.7626, area: 'PCMC' },
  { name: 'Aundh', aliases: ['aundh'], lat: 18.5593, lon: 73.8077, area: 'West Pune' },
  { name: 'Baner', aliases: ['baner'], lat: 18.5590, lon: 73.7868, area: 'West Pune' },
  { name: 'Viman Nagar', aliases: ['viman nagar', 'vimannagar'], lat: 18.5679, lon: 73.9143, area: 'East Pune' },
  { name: 'Hadapsar', aliases: ['hadapsar'], lat: 18.5089, lon: 73.9260, area: 'East Pune' },
  { name: 'Magarpatta', aliases: ['magarpatta', 'magarpatta city'], lat: 18.5158, lon: 73.9301, area: 'East Pune' },
  { name: 'Camp', aliases: ['camp', 'pune camp', 'mg road'], lat: 18.5158, lon: 73.8800, area: 'Central Pune' },
  { name: 'Koregaon Park', aliases: ['koregaon park', 'kp'], lat: 18.5362, lon: 73.8939, area: 'Central Pune' },
  { name: 'Deccan', aliases: ['deccan', 'deccan gymkhana'], lat: 18.5158, lon: 73.8410, area: 'Central Pune' },
  { name: 'Karve Nagar', aliases: ['karve nagar', 'karvenagar'], lat: 18.4914, lon: 73.8141, area: 'West Pune' },
  { name: 'Pimpri', aliases: ['pimpri'], lat: 18.6298, lon: 73.8131, area: 'PCMC' },
  { name: 'Chinchwad', aliases: ['chinchwad'], lat: 18.6450, lon: 73.7997, area: 'PCMC' },
  { name: 'Katraj', aliases: ['katraj'], lat: 18.4575, lon: 73.8651, area: 'South Pune' },
  { name: 'Warje', aliases: ['warje'], lat: 18.4830, lon: 73.7940, area: 'South-West Pune' },
  { name: 'Bibwewadi', aliases: ['bibwewadi'], lat: 18.4762, lon: 73.8649, area: 'South Pune' },
  { name: 'Yerwada', aliases: ['yerwada', 'yerawada'], lat: 18.5536, lon: 73.8851, area: 'Central Pune' },
  { name: 'Pashan', aliases: ['pashan'], lat: 18.5394, lon: 73.7898, area: 'West Pune' },
  { name: 'Sinhagad Road', aliases: ['sinhagad road', 'sinhgad road'], lat: 18.4690, lon: 73.8230, area: 'South-West Pune' },
  { name: 'FC Road', aliases: ['fc road', 'fergusson college road'], lat: 18.5236, lon: 73.8420, area: 'Central Pune' },
];

export function searchPuneLocation(query: string): PuneLocation | null {
  if (!query || query.trim().length < 2) return null;
  const q = query.toLowerCase().trim();
  // exact alias match
  for (const loc of PUNE_LOCATIONS) {
    if (loc.aliases.some(a => a === q)) return loc;
  }
  // partial match
  for (const loc of PUNE_LOCATIONS) {
    if (loc.aliases.some(a => a.includes(q) || q.includes(a))) return loc;
    if (loc.name.toLowerCase().includes(q)) return loc;
  }
  return null;
}

export function findNearestSample<T extends { lat: number; lon: number }>(
  loc: { lat: number; lon: number },
  samples: T[]
): T | null {
  if (samples.length === 0) return null;
  let nearest = samples[0];
  let minDist = Infinity;
  for (const s of samples) {
    const d = Math.hypot(s.lat - loc.lat, s.lon - loc.lon);
    if (d < minDist) {
      minDist = d;
      nearest = s;
    }
  }
  return nearest;
}
