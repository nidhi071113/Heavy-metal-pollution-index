import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { WaterSample } from '@/types';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, AreaChart, Area, ScatterChart, Scatter, ZAxis,
  ComposedChart
} from 'recharts';
import { TrendingUp, AlertTriangle, Droplets, Activity, MapPin, Thermometer } from 'lucide-react';

interface AdvancedAnalyticsProps {
  samples: WaterSample[];
}

const RISK_COLORS = {
  low: 'hsl(var(--chart-2))',
  medium: 'hsl(var(--warning))',
  high: 'hsl(var(--chart-4))',
  critical: 'hsl(var(--destructive))',
};

export const AdvancedAnalytics = ({ samples }: AdvancedAnalyticsProps) => {
  if (samples.length === 0) return null;

  // Metal concentration averages with BIS limits
  const metalComparisonData = [
    { metal: 'Arsenic (As)', value: samples.reduce((sum, s) => sum + s.as, 0) / samples.length, limit: 10, unit: 'μg/L' },
    { metal: 'Lead (Pb)', value: samples.reduce((sum, s) => sum + s.pb, 0) / samples.length, limit: 10, unit: 'μg/L' },
    { metal: 'Cadmium (Cd)', value: samples.reduce((sum, s) => sum + s.cd, 0) / samples.length, limit: 3, unit: 'μg/L' },
    { metal: 'Chromium (Cr)', value: samples.reduce((sum, s) => sum + s.cr, 0) / samples.length, limit: 50, unit: 'μg/L' },
    { metal: 'Nickel (Ni)', value: samples.reduce((sum, s) => sum + s.ni, 0) / samples.length, limit: 20, unit: 'μg/L' },
  ].map(d => ({ ...d, value: Math.round(d.value * 100) / 100 }));

  // Index distribution statistics
  const indexStatsData = [
    { 
      index: 'HPI', 
      avg: samples.reduce((sum, s) => sum + (s.hpi || 0), 0) / samples.length,
      max: Math.max(...samples.map(s => s.hpi || 0)),
      min: Math.min(...samples.filter(s => s.hpi).map(s => s.hpi || 0))
    },
    { 
      index: 'HEI', 
      avg: samples.reduce((sum, s) => sum + (s.hei || 0), 0) / samples.length,
      max: Math.max(...samples.map(s => s.hei || 0)),
      min: Math.min(...samples.filter(s => s.hei).map(s => s.hei || 0))
    },
    { 
      index: 'HI', 
      avg: samples.reduce((sum, s) => sum + (s.hi || 0), 0) / samples.length,
      max: Math.max(...samples.map(s => s.hi || 0)),
      min: Math.min(...samples.filter(s => s.hi).map(s => s.hi || 0))
    },
    { 
      index: 'PLI', 
      avg: samples.reduce((sum, s) => sum + (s.pli || 0), 0) / samples.length,
      max: Math.max(...samples.map(s => s.pli || 0)),
      min: Math.min(...samples.filter(s => s.pli).map(s => s.pli || 0))
    },
  ].map(d => ({
    ...d,
    avg: Math.round(d.avg * 100) / 100,
    max: Math.round(d.max * 100) / 100,
    min: Math.round(d.min * 100) / 100,
  }));

  // Risk distribution pie
  const riskCounts = samples.reduce((acc, s) => {
    acc[s.riskLevel || 'low'] = (acc[s.riskLevel || 'low'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskPieData = Object.entries(riskCounts).map(([name, value]) => ({ 
    name: name.charAt(0).toUpperCase() + name.slice(1), 
    value,
    percentage: Math.round((value / samples.length) * 100)
  }));

  // Monthly trend analysis
  const monthlyTrends = samples
    .reduce((acc, sample) => {
      const month = sample.sampleDate.substring(0, 7);
      if (!acc[month]) {
        acc[month] = { month, hpi: 0, hi: 0, count: 0, unsafe: 0 };
      }
      acc[month].hpi += sample.hpi || 0;
      acc[month].hi += sample.hi || 0;
      acc[month].count += 1;
      if (sample.riskLevel === 'high' || sample.riskLevel === 'critical') {
        acc[month].unsafe += 1;
      }
      return acc;
    }, {} as Record<string, any>);

  const trendData = Object.values(monthlyTrends)
    .map((d: any) => ({
      month: d.month,
      avgHPI: Math.round((d.hpi / d.count) * 10) / 10,
      avgHI: Math.round((d.hi / d.count) * 100) / 100,
      unsafePercentage: Math.round((d.unsafe / d.count) * 100),
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);

  // Depth vs contamination scatter
  const depthContaminationData = samples.slice(0, 200).map(s => ({
    depth: s.depthM,
    hpi: s.hpi || 0,
    hi: s.hi || 0,
    risk: s.riskLevel,
  }));

  // pH distribution
  const phRanges = [
    { range: '< 6.5 (Acidic)', count: samples.filter(s => s.pH < 6.5).length },
    { range: '6.5-7.5 (Neutral)', count: samples.filter(s => s.pH >= 6.5 && s.pH <= 7.5).length },
    { range: '7.5-8.5 (Slightly Alkaline)', count: samples.filter(s => s.pH > 7.5 && s.pH <= 8.5).length },
    { range: '> 8.5 (Alkaline)', count: samples.filter(s => s.pH > 8.5).length },
  ];

  // Metal exceedance radar
  const radarData = metalComparisonData.map(m => ({
    metal: m.metal.split(' ')[0],
    exceedance: Math.round((m.value / m.limit) * 100),
  }));

  // Conductivity distribution
  const conductivityRanges = [
    { range: '< 500', count: samples.filter(s => s.ec < 500).length, label: 'Low' },
    { range: '500-1000', count: samples.filter(s => s.ec >= 500 && s.ec < 1000).length, label: 'Medium' },
    { range: '1000-1500', count: samples.filter(s => s.ec >= 1000 && s.ec < 1500).length, label: 'High' },
    { range: '> 1500', count: samples.filter(s => s.ec >= 1500).length, label: 'Very High' },
  ];

  // Top contaminated locations
  const topContaminated = [...samples]
    .sort((a, b) => (b.hpi || 0) - (a.hpi || 0))
    .slice(0, 10)
    .map(s => ({
      id: s.sampleId,
      hpi: Math.round((s.hpi || 0) * 10) / 10,
      hi: Math.round((s.hi || 0) * 100) / 100,
      location: s.wellId,
    }));

  // Correlation: HPI vs HI
  const correlationData = samples.slice(0, 150).map(s => ({
    hpi: s.hpi || 0,
    hi: (s.hi || 0) * 100, // Scale for visibility
    risk: s.riskLevel,
  }));

  const tooltipStyle = { 
    backgroundColor: 'hsl(var(--card))', 
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '12px',
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Samples</span>
            </div>
            <p className="text-2xl font-bold mt-1">{samples.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-sm text-muted-foreground">Unsafe Samples</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-destructive">
              {samples.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-warning" />
              <span className="text-sm text-muted-foreground">Avg HPI</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {Math.round(samples.reduce((s, sample) => s + (sample.hpi || 0), 0) / samples.length)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-chart-2" />
              <span className="text-sm text-muted-foreground">Avg HI</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {(samples.reduce((s, sample) => s + (sample.hi || 0), 0) / samples.length).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metal Concentrations vs BIS Limits */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Heavy Metal Concentrations vs BIS Limits</CardTitle>
            <CardDescription>Average concentrations compared to permissible limits</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={metalComparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="metal" className="text-xs" tick={{ fontSize: 10 }} />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="value" name="Avg Concentration" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="limit" name="BIS Limit" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: 'hsl(var(--destructive))' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Risk Level Distribution</CardTitle>
            <CardDescription>Sample categorization by contamination risk</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={90}
                  innerRadius={40}
                  dataKey="value"
                >
                  {riskPieData.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name.toLowerCase() as keyof typeof RISK_COLORS] || 'hsl(var(--muted))'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pollution Trends Over Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pollution Trends Over Time</CardTitle>
            <CardDescription>Monthly average HPI and HI trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Area type="monotone" dataKey="avgHPI" name="Avg HPI" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                <Area type="monotone" dataKey="avgHI" name="Avg HI" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pollution Index Range */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pollution Index Statistics</CardTitle>
            <CardDescription>Min, Average, and Max values per index</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={indexStatsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="index" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="min" name="Min" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avg" name="Average" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="max" name="Max" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* pH Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">pH Level Distribution</CardTitle>
            <CardDescription>Water acidity/alkalinity classification</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={phRanges} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="range" type="category" className="text-xs" width={120} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Samples" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conductivity Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Conductivity Distribution (μS/cm)</CardTitle>
            <CardDescription>Electrical conductivity ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={conductivityRanges}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="count"
                  label={({ range, count }) => `${range}: ${count}`}
                >
                  <Cell fill="hsl(var(--chart-1))" />
                  <Cell fill="hsl(var(--chart-2))" />
                  <Cell fill="hsl(var(--chart-3))" />
                  <Cell fill="hsl(var(--chart-4))" />
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Metal Exceedance Radar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Metal Exceedance Radar</CardTitle>
            <CardDescription>% of BIS limit exceeded (100% = at limit)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metal" className="text-xs" />
                <PolarRadiusAxis angle={90} domain={[0, Math.max(150, ...radarData.map(r => r.exceedance))]} />
                <Radar name="Exceedance %" dataKey="exceedance" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* HPI vs HI Correlation Scatter */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">HPI vs HI Correlation</CardTitle>
            <CardDescription>Relationship between pollution indices</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="hpi" name="HPI" className="text-xs" label={{ value: 'HPI', position: 'bottom', offset: -5 }} />
                <YAxis dataKey="hi" name="HI×100" className="text-xs" label={{ value: 'HI×100', angle: -90, position: 'insideLeft' }} />
                <ZAxis range={[30, 80]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Scatter name="Samples" data={correlationData} fill="hsl(var(--primary))" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Contaminated Sites Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-5 w-5 text-destructive" />
            Top 10 Most Contaminated Sites
          </CardTitle>
          <CardDescription>Sites with highest Heavy Metal Pollution Index</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {topContaminated.map((site, idx) => (
              <div key={site.id} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">#{idx + 1}</span>
                  <span className="text-xs text-destructive font-bold">HPI: {site.hpi}</span>
                </div>
                <p className="text-xs font-mono truncate">{site.id}</p>
                <p className="text-xs text-muted-foreground truncate">{site.location}</p>
                <p className="text-xs mt-1">HI: {site.hi}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Unsafe Trend Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Unsafe Samples Percentage Over Time</CardTitle>
          <CardDescription>Monthly percentage of high/critical risk samples</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line 
                type="monotone" 
                dataKey="unsafePercentage" 
                name="% Unsafe" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--destructive))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
