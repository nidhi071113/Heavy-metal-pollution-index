import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import { WaterSample } from '@/types';
import 'leaflet/dist/leaflet.css';
import { SampleAnalysisModal } from './SampleAnalysisModal';
import { loadMaharashtraCSVData } from '@/utils/csvParser';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, BarChart3, TrendingUp, Activity } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ScatterChart, Scatter, ZAxis, Legend, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Cell
} from 'recharts';

const getRiskColor = (riskLevel: string) => {
  switch ((riskLevel || '').toLowerCase()) {
    case 'low': return '#22c55e';
    case 'medium': return '#eab308';
    case 'high': return '#f97316';
    case 'critical': return '#ef4444';
    default: return '#6b7280';
  }
};

const CITY_COLORS: Record<string, string> = {
  Pune: '#6366f1',
  Mumbai: '#06b6d4',
  Nashik: '#f59e0b',
  Nagpur: '#ef4444',
  Aurangabad: '#8b5cf6',
  Kolhapur: '#10b981',
  Solapur: '#f97316',
  Sangli: '#ec4899',
  Satara: '#14b8a6',
  Ahmednagar: '#84cc16',
};

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'hsl(var(--foreground))',
};

export const DeeperAnalyticsMap = ({ samples: propSamples }: { samples: WaterSample[] }) => {
  const [maharashtraSamples, setMaharashtraSamples] = useState<WaterSample[]>([]);
  const [selectedSample, setSelectedSample] = useState<WaterSample | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMaharashtraCSVData().then(data => {
      setMaharashtraSamples(data);
      setIsLoading(false);
    });
  }, []);

  const displaySamples = maharashtraSamples.length > 0 ? maharashtraSamples : propSamples;

  // City-wise aggregated stats
  const cityStats = useMemo(() => {
    const stats: Record<string, { hpi: number, as: number, pb: number, cd: number, count: number, riskLevels: Record<string,number> }> = {};
    displaySamples.forEach(s => {
      const city = s.district || 'Unknown';
      if (!stats[city]) stats[city] = { hpi: 0, as: 0, pb: 0, cd: 0, count: 0, riskLevels: { low: 0, medium: 0, high: 0, critical: 0 } };
      stats[city].hpi += (s.hpi || 0);
      stats[city].as  += s.as;
      stats[city].pb  += s.pb;
      stats[city].cd  += s.cd;
      stats[city].count += 1;
      const lvl = s.riskLevel || 'low';
      stats[city].riskLevels[lvl] = (stats[city].riskLevels[lvl] || 0) + 1;
    });
    return Object.entries(stats).map(([city, d]) => ({
      city,
      avgHPI: Math.round((d.hpi / d.count) * 10) / 10,
      avgAs:  Math.round((d.as / d.count) * 10) / 10,
      avgPb:  Math.round((d.pb / d.count) * 10) / 10,
      avgCd:  Math.round((d.cd / d.count) * 10) / 10,
      count:  d.count,
      critical: d.riskLevels['critical'] || 0,
      high:     d.riskLevels['high'] || 0,
      medium:   d.riskLevels['medium'] || 0,
      low:      d.riskLevels['low'] || 0,
    })).sort((a, b) => b.avgHPI - a.avgHPI);
  }, [displaySamples]);

  // Scatter data: HPI vs Arsenic colored by city
  const scatterData = useMemo(() => {
    return displaySamples.slice(0, 500).map(s => ({
      x: s.as,
      y: s.hpi || 0,
      z: s.cd,
      city: s.district || 'Unknown',
      id: s.siteId,
    }));
  }, [displaySamples]);

  // Radar data for top 5 cities
  const radarData = useMemo(() => {
    return cityStats.slice(0, 5).map(c => ({
      city: c.city,
      HPI: c.avgHPI,
      Arsenic: c.avgAs,
      Lead: c.avgPb,
      Cadmium: c.avgCd,
    }));
  }, [cityStats]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-primary">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="font-semibold">Loading Maharashtra dataset...</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Map Legend */}
      <div className="flex items-center gap-4 flex-wrap text-xs font-medium">
        {[['Low Risk', '#22c55e'], ['Medium Risk', '#eab308'], ['High Risk', '#f97316'], ['Critical Risk', '#ef4444']].map(([label, color]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full inline-block" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
        <span className="ml-auto text-muted-foreground">{displaySamples.length} sites · Click any marker for analysis</span>
      </div>

      {/* Interactive Map */}
      <div className="leaflet-map-isolation rounded-xl overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/10 relative" style={{ height: '580px', width: '100%' }}>
        <MapContainer center={[19.25, 76.0]} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true} minZoom={6} maxZoom={14}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {displaySamples.map((sample) => (
            <CircleMarker
              key={sample.id}
              center={[sample.lat, sample.lon]}
              radius={5}
              fillColor={getRiskColor(sample.riskLevel || 'low')}
              color="#fff"
              weight={0.8}
              opacity={1}
              fillOpacity={0.85}
              eventHandlers={{ click: () => setSelectedSample(sample) }}
            >
              <LeafletTooltip direction="top" offset={[0, -6]} opacity={0.97}>
                <div className="text-xs font-medium">
                  <div className="font-bold">{sample.siteId} · {sample.district}</div>
                  <div>HPI: {sample.hpi?.toFixed(1)} · {sample.riskLevel?.toUpperCase()}</div>
                  <div className="text-blue-600 mt-0.5">Click for full analysis ↗</div>
                </div>
              </LeafletTooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* City-Wise Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Avg HPI by City (Stacked Bar) */}
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> City-wise HPI Comparison
            </CardTitle>
            <CardDescription className="text-xs">Average Heavy Metal Pollution Index by district</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityStats} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis dataKey="city" className="text-[10px]" interval={0} angle={-20} textAnchor="end" height={40} />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="avgHPI" name="Avg HPI" radius={[4, 4, 0, 0]}>
                    {cityStats.map((entry) => (
                      <Cell key={entry.city} fill={CITY_COLORS[entry.city] || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: HPI vs Arsenic Scatter */}
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> HPI vs Arsenic Scatter
            </CardTitle>
            <CardDescription className="text-xs">Scatter plot of HPI concentration against Arsenic levels (μg/L)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="x" name="Arsenic (μg/L)" type="number" className="text-xs" label={{ value: 'As (μg/L)', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                  <YAxis dataKey="y" name="HPI" type="number" className="text-xs" />
                  <ZAxis dataKey="z" range={[20, 80]} name="Cadmium" />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter
                    name="Sites"
                    data={scatterData.filter(d => d.city === 'Pune').slice(0, 80)}
                    fill={CITY_COLORS['Pune']}
                    fillOpacity={0.7}
                  />
                  <Scatter
                    name="Sites"
                    data={scatterData.filter(d => d.city === 'Nagpur').slice(0, 80)}
                    fill={CITY_COLORS['Nagpur']}
                    fillOpacity={0.7}
                  />
                  <Scatter
                    name="Sites"
                    data={scatterData.filter(d => d.city === 'Nashik').slice(0, 80)}
                    fill={CITY_COLORS['Nashik']}
                    fillOpacity={0.7}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart 3: Full-width - Risk distribution per city stacked bar */}
      <Card className="border-primary/20 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> City-wise Risk Level Breakdown
          </CardTitle>
          <CardDescription className="text-xs">Number of Low / Medium / High / Critical sites per Maharashtra district</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityStats} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis dataKey="city" className="text-[10px]" interval={0} angle={-15} textAnchor="end" height={40} />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="low" name="Low" stackId="a" fill="#22c55e" />
                <Bar dataKey="medium" name="Medium" stackId="a" fill="#eab308" />
                <Bar dataKey="high" name="High" stackId="a" fill="#f97316" />
                <Bar dataKey="critical" name="Critical" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <SampleAnalysisModal
        sample={selectedSample}
        isOpen={selectedSample !== null}
        onClose={() => setSelectedSample(null)}
      />
    </div>
  );
};
