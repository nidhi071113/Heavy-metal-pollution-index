import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GlobalSample } from '@/types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter,
  ZAxis, ComposedChart, Line, AreaChart, Area
} from 'recharts';
import {
  Globe2, AlertTriangle, Droplets, Activity, TrendingUp, MapPin,
  ShieldAlert, CheckCircle2
} from 'lucide-react';

interface GlobalAdvancedAnalyticsProps {
  samples: GlobalSample[];
}

const RISK_COLORS: Record<string, string> = {
  Low: '#22c55e',
  Moderate: '#eab308',
  High: '#f97316',
  Critical: '#ef4444',
};

const COUNTRY_PALETTE = [
  '#6366f1','#06b6d4','#f59e0b','#ef4444','#8b5cf6',
  '#10b981','#f97316','#ec4899','#14b8a6','#84cc16',
  '#3b82f6','#a855f7','#e11d48','#0ea5e9','#d97706',
];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'hsl(var(--foreground))',
};

export const GlobalAdvancedAnalytics = ({ samples }: GlobalAdvancedAnalyticsProps) => {
  if (samples.length === 0) return (
    <div className="flex items-center justify-center h-48 text-muted-foreground gap-2">
      <Globe2 className="h-5 w-5" /> Loading global dataset...
    </div>
  );

  const n = samples.length;

  // ── Quick stats ──────────────────────────────────────────────────
  const avgHPI = samples.reduce((s, x) => s + x.hpi, 0) / n;
  const avgHEI = samples.reduce((s, x) => s + x.hei, 0) / n;
  const unsafeCount = samples.filter(s => s.waterSafe === 'No').length;
  const borderlineCount = samples.filter(s => s.waterSafe === 'Borderline').length;
  const countries = [...new Set(samples.map(s => s.country))].length;

  // ── Risk distribution ────────────────────────────────────────────
  const riskCounts = useMemo(() => {
    const c: Record<string, number> = {};
    samples.forEach(s => { c[s.riskCategory] = (c[s.riskCategory] || 0) + 1; });
    return Object.entries(c).map(([name, value]) => ({
      name, value,
      pct: Math.round((value / n) * 100),
    }));
  }, [samples]);

  // ── Country avg HPI top 15 ───────────────────────────────────────
  const countryHPI = useMemo(() => {
    const m: Record<string, { sum: number; count: number }> = {};
    samples.forEach(s => {
      if (!m[s.country]) m[s.country] = { sum: 0, count: 0 };
      m[s.country].sum += s.hpi;
      m[s.country].count += 1;
    });
    return Object.entries(m)
      .map(([country, d]) => ({ country, avgHPI: Math.round((d.sum / d.count) * 10) / 10, count: d.count }))
      .sort((a, b) => b.avgHPI - a.avgHPI)
      .slice(0, 15);
  }, [samples]);

  // ── Country stacked risk ─────────────────────────────────────────
  const countryRiskStack = useMemo(() => {
    const m: Record<string, Record<string, number>> = {};
    samples.forEach(s => {
      if (!m[s.country]) m[s.country] = { Low: 0, Moderate: 0, High: 0, Critical: 0 };
      m[s.country][s.riskCategory] = (m[s.country][s.riskCategory] || 0) + 1;
    });
    return Object.entries(m)
      .map(([country, d]) => ({ country, ...d, total: Object.values(d).reduce((a, b) => a + b, 0) }))
      .sort((a, b) => b.Critical - a.Critical)
      .slice(0, 12);
  }, [samples]);

  // ── Metal averages vs WHO limits ─────────────────────────────────
  const metalComparison = [
    { metal: 'As', value: Math.round(samples.reduce((s, x) => s + x.as, 0) / n * 10) / 10, limit: 10 },
    { metal: 'Pb', value: Math.round(samples.reduce((s, x) => s + x.pb, 0) / n * 10) / 10, limit: 10 },
    { metal: 'Cd', value: Math.round(samples.reduce((s, x) => s + x.cd, 0) / n * 10) / 10, limit: 3 },
    { metal: 'Cr', value: Math.round(samples.reduce((s, x) => s + x.cr, 0) / n * 10) / 10, limit: 50 },
    { metal: 'Hg', value: Math.round(samples.reduce((s, x) => s + x.hg, 0) / n * 10) / 10, limit: 1 },
  ];

  // ── Metal exceedance radar ───────────────────────────────────────
  const radarData = metalComparison.map(m => ({
    metal: m.metal,
    exceedance: Math.round((m.value / m.limit) * 100),
  }));

  // ── Water safety distribution ────────────────────────────────────
  const safetyData = [
    { name: 'Safe (Yes)', value: samples.filter(s => s.waterSafe === 'Yes').length, color: '#22c55e' },
    { name: 'Borderline', value: samples.filter(s => s.waterSafe === 'Borderline').length, color: '#eab308' },
    { name: 'Unsafe (No)', value: samples.filter(s => s.waterSafe === 'No').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // ── HPI histogram ───────────────────────────────────────────────
  const hpiBuckets = useMemo(() => {
    const buckets = [
      { range: '0–25', count: 0 }, { range: '25–50', count: 0 },
      { range: '50–100', count: 0 }, { range: '100–150', count: 0 },
      { range: '150–200', count: 0 }, { range: '200+', count: 0 },
    ];
    samples.forEach(s => {
      if (s.hpi < 25) buckets[0].count++;
      else if (s.hpi < 50) buckets[1].count++;
      else if (s.hpi < 100) buckets[2].count++;
      else if (s.hpi < 150) buckets[3].count++;
      else if (s.hpi < 200) buckets[4].count++;
      else buckets[5].count++;
    });
    return buckets;
  }, [samples]);

  // ── HPI vs HEI scatter (sample 200) ─────────────────────────────
  const scatterData = useMemo(() =>
    samples.slice(0, 300).map(s => ({ x: s.hpi, y: s.hei, z: s.mi, cat: s.riskCategory })),
  [samples]);

  // ── Index statistics ─────────────────────────────────────────────
  const indexStats = [
    { index: 'HPI', avg: Math.round(avgHPI * 10) / 10, min: Math.round(Math.min(...samples.map(s => s.hpi)) * 10) / 10, max: Math.round(Math.max(...samples.map(s => s.hpi)) * 10) / 10 },
    { index: 'HEI', avg: Math.round(avgHEI * 10) / 10, min: Math.round(Math.min(...samples.map(s => s.hei)) * 10) / 10, max: Math.round(Math.max(...samples.map(s => s.hei)) * 10) / 10 },
    { index: 'MI', avg: Math.round(samples.reduce((s, x) => s + x.mi, 0) / n * 100) / 100, min: Math.round(Math.min(...samples.map(s => s.mi)) * 100) / 100, max: Math.round(Math.max(...samples.map(s => s.mi)) * 100) / 100 },
  ];

  // ── Top 10 worst sites ───────────────────────────────────────────
  const top10 = [...samples].sort((a, b) => b.hpi - a.hpi).slice(0, 10);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-card via-primary/5 to-card p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3 border border-primary/20">
            <Globe2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Global Groundwater Analytics</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Deep-dive insights from {n.toLocaleString()} monitoring sites across {countries} countries
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Droplets, label: 'Total Sites', value: n.toLocaleString(), color: 'text-primary', bg: 'from-primary/10 to-primary/5' },
          { icon: AlertTriangle, label: 'Unsafe Sites', value: unsafeCount.toLocaleString(), color: 'text-destructive', bg: 'from-destructive/10 to-destructive/5' },
          { icon: TrendingUp, label: 'Avg HPI', value: avgHPI.toFixed(1), color: 'text-warning', bg: 'from-yellow-500/10 to-yellow-500/5' },
          { icon: Globe2, label: 'Countries', value: countries.toString(), color: 'text-chart-2', bg: 'from-emerald-500/10 to-emerald-500/5' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label} className={`bg-gradient-to-br ${bg}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Top 15 countries by avg HPI */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Top 15 Countries by Average HPI
            </CardTitle>
            <CardDescription>Heavy Metal Pollution Index ranked by country — higher is worse</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={countryHPI} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="country" type="category" className="text-xs" width={70} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v.toFixed(1), 'Avg HPI']} />
                <Bar dataKey="avgHPI" name="Avg HPI" radius={[0, 4, 4, 0]}>
                  {countryHPI.map((_, i) => (
                    <Cell key={i} fill={COUNTRY_PALETTE[i % COUNTRY_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2. Risk Distribution Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Global Risk Distribution</CardTitle>
            <CardDescription>Breakdown of all sites by contamination risk category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={riskCounts}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, pct }) => `${name}: ${pct}%`}
                >
                  {riskCounts.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 3. Water Safety Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Water Safety Classification</CardTitle>
            <CardDescription>Drinking water safety assessment across all global sites</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={safetyData}
                  cx="50%" cy="50%"
                  outerRadius={95}
                  innerRadius={50}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {safetyData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 4. Metal Concentrations vs WHO */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Metal Concentrations vs WHO Limits</CardTitle>
            <CardDescription>Global average concentrations vs permissible WHO thresholds</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={metalComparison}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="metal" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="value" name="Avg Concentration (μg/L)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="limit" name="WHO Limit" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="6 3" dot={{ fill: 'hsl(var(--destructive))', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 5. Metal Exceedance Radar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Metal Exceedance Radar</CardTitle>
            <CardDescription>% of WHO limit exceeded globally (100% = exactly at limit)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metal" tick={{ fontSize: 13, fill: 'hsl(var(--foreground))' }} />
                <PolarRadiusAxis angle={90} domain={[0, Math.max(200, ...radarData.map(r => r.exceedance))]} tick={{ fontSize: 9 }} />
                <Radar name="Exceedance %" dataKey="exceedance" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.45} strokeWidth={2} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, 'WHO exceedance']} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 6. HPI Histogram */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">HPI Frequency Distribution</CardTitle>
            <CardDescription>Histogram of HPI values across all global monitoring sites</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hpiBuckets} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis dataKey="range" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Sites" radius={[4, 4, 0, 0]}>
                  {hpiBuckets.map((entry, i) => (
                    <Cell key={i} fill={i < 2 ? '#22c55e' : i < 3 ? '#eab308' : i < 4 ? '#f97316' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 7. Pollution Index Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pollution Index Statistics</CardTitle>
            <CardDescription>Min, average, and maximum values for HPI, HEI, and MI globally</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={indexStats} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="index" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="min" name="Min" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avg" name="Average" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="max" name="Max" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 8. HPI vs HEI Scatter */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">HPI vs HEI Correlation</CardTitle>
            <CardDescription>Relationship between pollution indices — colored by risk category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="x" name="HPI" className="text-xs" label={{ value: 'HPI', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                <YAxis dataKey="y" name="HEI" className="text-xs" label={{ value: 'HEI', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <ZAxis dataKey="z" range={[20, 60]} name="MI" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: '3 3' }} />
                {['Low', 'Moderate', 'High', 'Critical'].map(cat => (
                  <Scatter
                    key={cat}
                    name={cat}
                    data={scatterData.filter(d => d.cat === cat)}
                    fill={RISK_COLORS[cat]}
                    fillOpacity={0.65}
                  />
                ))}
                <Legend />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Country Risk Stacked Bar — full width */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Country-wise Risk Level Breakdown
          </CardTitle>
          <CardDescription>Stacked count of Low / Moderate / High / Critical sites per country</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={countryRiskStack} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis dataKey="country" className="text-[10px]" interval={0} angle={-15} textAnchor="end" height={40} />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Low" name="Low Risk" stackId="a" fill="#22c55e" />
              <Bar dataKey="Moderate" name="Moderate" stackId="a" fill="#eab308" />
              <Bar dataKey="High" name="High Risk" stackId="a" fill="#f97316" />
              <Bar dataKey="Critical" name="Critical" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top 10 Most Contaminated Sites */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" /> Top 10 Most Contaminated Global Sites
          </CardTitle>
          <CardDescription>Highest Heavy Metal Pollution Index (HPI) across the global dataset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {top10.map((site, idx) => (
              <div key={site.id} className={`p-3 rounded-xl border hover:shadow-md transition-all ${idx === 0 ? 'border-red-500 bg-red-500/5' : 'border-border bg-card'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                  <Badge variant="outline" className="text-[9px] px-1 border-primary/30">{site.country}</Badge>
                </div>
                <p className="text-xs font-mono font-semibold truncate">{site.siteId}</p>
                <p className="text-lg font-bold text-destructive mt-0.5">{site.hpi.toFixed(1)}</p>
                <p className="text-[10px] text-muted-foreground">HPI Score</p>
                <Badge
                  className="mt-1 text-[9px] px-1.5"
                  style={{ backgroundColor: RISK_COLORS[site.riskCategory] || '#6b7280', color: '#fff' }}
                >
                  {site.riskCategory}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
