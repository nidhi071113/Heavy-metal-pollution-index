import { useMemo } from 'react';
import { GlobalSample } from '@/types';
import { GlobalRiskMap } from './GlobalRiskMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Globe2, AlertTriangle, ShieldAlert, Activity, Droplets } from 'lucide-react';

export const GlobalAnalytics = ({ samples }: { samples: GlobalSample[] }) => {
  // Aggregate Data
  const riskDistribution = useMemo(() => {
    const counts = { Low: 0, Moderate: 0, High: 0, Critical: 0 };
    samples.forEach(s => {
      const cat = s.riskCategory;
      if (counts[cat as keyof typeof counts] !== undefined) {
        counts[cat as keyof typeof counts]++;
      } else {
        counts['Critical']++; // Default fallback for Unknown or extreme
      }
    });
    return [
      { name: 'Low Risk', value: counts.Low, color: '#22c55e' },
      { name: 'Moderate Risk', value: counts.Moderate, color: '#eab308' },
      { name: 'High Risk', value: counts.High, color: '#f97316' },
      { name: 'Critical Risk', value: counts.Critical, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [samples]);

  const topCountries = useMemo(() => {
    const countryStats: Record<string, { sumHpi: number, count: number }> = {};
    samples.forEach(s => {
      if (!countryStats[s.country]) countryStats[s.country] = { sumHpi: 0, count: 0 };
      countryStats[s.country].sumHpi += s.hpi;
      countryStats[s.country].count += 1;
    });
    return Object.entries(countryStats)
      .map(([country, stats]) => ({
        country,
        avgHpi: Math.round((stats.sumHpi / stats.count) * 10) / 10
      }))
      .sort((a, b) => b.avgHpi - a.avgHpi)
      .slice(0, 10);
  }, [samples]);

  const worstSites = useMemo(() => {
    return [...samples].sort((a, b) => b.hpi - a.hpi).slice(0, 20);
  }, [samples]);

  if (samples.length === 0) return (
    <div className="flex items-center justify-center p-12 text-muted-foreground">
      Loading global dataset...
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Map Section */}
      <Card className="border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-primary" />
            Global Groundwater Risk Map
          </CardTitle>
          <CardDescription>
            Interactive map displaying {samples.length.toLocaleString()} predictive HMPI locations across the globe.
          </CardDescription>
          <div className="flex gap-4 mt-2 text-sm flex-wrap">
            <Badge variant="outline" className="border-green-500 text-green-600">Low Risk</Badge>
            <Badge variant="outline" className="border-yellow-500 text-yellow-600">Moderate Risk</Badge>
            <Badge variant="outline" className="border-orange-500 text-orange-500">High Risk</Badge>
            <Badge variant="outline" className="border-red-500 text-red-500">Critical Risk</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <GlobalRiskMap samples={samples} />
        </CardContent>
      </Card>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Global Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    dataKey="value"
                    paddingAngle={5}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Top 10 High-Risk Countries (Avg HPI)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCountries} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-muted" />
                  <XAxis type="number" />
                  <YAxis dataKey="country" type="category" width={80} className="text-xs" />
                  <RechartsTooltip cursor={{fill: 'hsl(var(--muted)/0.5)'}} />
                  <Bar dataKey="avgHpi" name="Average HPI" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-warning" />
            Top 20 Most Contaminated Global Sites
          </CardTitle>
          <CardDescription>Immediate attention required based on Hybrid AI predictions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Site ID</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead>HPI Score</TableHead>
                  <TableHead>Risk Category</TableHead>
                  <TableHead>Water Safe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {worstSites.map(site => (
                  <TableRow key={site.id} className="hover:bg-accent/30">
                    <TableCell className="font-medium font-mono text-xs">{site.siteId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/5">{site.country}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {site.lat.toFixed(4)}°, {site.lon.toFixed(4)}°
                    </TableCell>
                    <TableCell className="font-mono font-bold text-destructive">
                      {site.hpi.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        style={{
                          borderColor: site.riskCategory === 'Critical' ? '#ef4444' : site.riskCategory === 'High' ? '#f97316' : '#eab308',
                          color: site.riskCategory === 'Critical' ? '#ef4444' : site.riskCategory === 'High' ? '#f97316' : '#eab308'
                        }}
                      >
                        {site.riskCategory}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {site.waterSafe === 'Yes' ? (
                         <span className="text-green-500 font-medium">Yes</span>
                      ) : site.waterSafe === 'Borderline' ? (
                         <span className="text-yellow-500 font-medium">Borderline</span>
                      ) : (
                         <span className="text-red-500 font-medium">No</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
