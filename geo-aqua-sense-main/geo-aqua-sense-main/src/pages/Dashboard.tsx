import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/StatCard';
import { RiskBadge } from '@/components/RiskBadge';
import { SampleDetailModal } from '@/components/SampleDetailModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Droplets,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Download,
  LogOut,
  BarChart3,
  Map as MapIcon,
  Settings,
  Search,
  Eye,
  Activity,
  Heart,
  GitCompare,
  Globe2,
} from 'lucide-react';
import { STANDARDS, computeIndices } from '@/utils/mockData';
import { loadCSVData, loadGlobalCSVData } from '@/utils/csvParser';
import { predictHealthRisks } from '@/utils/healthRiskPredictor';
import type { WaterSample, DashboardStats, GlobalSample } from '@/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { IndiaRiskMap } from '@/components/IndiaRiskMap';
import { AdvancedAnalytics } from '@/components/AdvancedAnalytics';
import { MLModelPanel } from '@/components/MLModelPanel';
import { MLScienceLab } from '@/components/MLScienceLab';
import { MethodComparison } from '@/components/MethodComparison';
import { GlobalAnalytics } from '@/components/GlobalAnalytics';
import { GlobalAdvancedAnalytics } from '@/components/GlobalAdvancedAnalytics';

export default function Dashboard() {
  const navigate = useNavigate();
  const [samples, setSamples] = useState<WaterSample[]>([]);
  const [globalSamples, setGlobalSamples] = useState<GlobalSample[]>([]);
  const [selectedStandard, setSelectedStandard] = useState('bis-2012');
  const [selectedSample, setSelectedSample] = useState<WaterSample | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSamples: 0,
    unsafeWells: 0,
    criticalWells: 0,
    mostContaminated: 'As',
    avgHPI: 0,
    avgHI: 0,
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    // Load real CSV data
    setLoading(true);
    Promise.all([
      loadCSVData(),
      loadGlobalCSVData()
    ]).then(([csvSamples, globalCsvSamples]) => {
      if (csvSamples.length > 0) {
        setSamples(csvSamples);
        calculateStats(csvSamples);
      }
      if (globalCsvSamples.length > 0) {
        setGlobalSamples(globalCsvSamples);
      }
      setLoading(false);
    });
  }, [navigate]);

  const calculateStats = (data: WaterSample[]) => {
    const unsafe = data.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length;
    const critical = data.filter(s => s.riskLevel === 'critical').length;
    const avgHPI = data.reduce((sum, s) => sum + (s.hpi || 0), 0) / data.length;
    const avgHI = data.reduce((sum, s) => sum + (s.hi || 0), 0) / data.length;

    // Find most contaminated metal
    const metalAvgs = {
      Arsenic: data.reduce((s, sample) => s + sample.as, 0) / data.length / 10,
      Lead: data.reduce((s, sample) => s + sample.pb, 0) / data.length / 10,
      Cadmium: data.reduce((s, sample) => s + sample.cd, 0) / data.length / 3,
      Chromium: data.reduce((s, sample) => s + sample.cr, 0) / data.length / 50,
    };
    const mostContaminated = Object.entries(metalAvgs).sort((a, b) => b[1] - a[1])[0][0];

    setStats({
      totalSamples: data.length,
      unsafeWells: unsafe,
      criticalWells: critical,
      mostContaminated,
      avgHPI: Math.round(avgHPI * 10) / 10,
      avgHI: Math.round(avgHI * 100) / 100,
    });
  };

  const handleStandardChange = (standardId: string) => {
    setSelectedStandard(standardId);
    const recomputed = samples.map(s => computeIndices(s, standardId));
    setSamples(recomputed);
    calculateStats(recomputed);
  };

  const handleSampleClick = (sample: WaterSample) => {
    setSelectedSample(sample);
    setDetailOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/auth');
  };

  const filteredSamples = samples.filter(s =>
    s.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.wellId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare trend data
  const trendData = samples
    .sort((a, b) => new Date(a.sampleDate).getTime() - new Date(b.sampleDate).getTime())
    .reduce((acc, sample) => {
      const month = sample.sampleDate.substring(0, 7);
      if (!acc[month]) {
        acc[month] = { month, avgHPI: 0, avgHI: 0, count: 0 };
      }
      acc[month].avgHPI += sample.hpi || 0;
      acc[month].avgHI += sample.hi || 0;
      acc[month].count += 1;
      return acc;
    }, {} as Record<string, any>);

  const chartData = Object.values(trendData)
    .map((d: any) => ({
      month: d.month,
      avgHPI: Math.round((d.avgHPI / d.count) * 10) / 10,
      avgHI: Math.round((d.avgHI / d.count) * 100) / 100,
    }))
    .slice(-12);

  // Metal distribution data
  const metalData = [
    { metal: 'Arsenic', avg: samples.reduce((s, sample) => s + sample.as, 0) / (samples.length || 1) },
    { metal: 'Lead', avg: samples.reduce((s, sample) => s + sample.pb, 0) / (samples.length || 1) },
    { metal: 'Cadmium', avg: samples.reduce((s, sample) => s + sample.cd, 0) / (samples.length || 1) },
    { metal: 'Chromium', avg: samples.reduce((s, sample) => s + sample.cr, 0) / (samples.length || 1) },
    { metal: 'Nickel', avg: samples.reduce((s, sample) => s + sample.ni, 0) / (samples.length || 1) },
  ].map(d => ({ ...d, avg: Math.round(d.avg * 100) / 100 }));

  // Risk pie data for overview
  const riskDistribution = [
    { name: 'Safe', value: samples.filter(s => s.riskLevel === 'low').length, color: 'hsl(var(--chart-2))' },
    { name: 'Caution', value: samples.filter(s => s.riskLevel === 'medium').length, color: 'hsl(var(--warning))' },
    { name: 'Unsafe', value: samples.filter(s => s.riskLevel === 'high').length, color: 'hsl(var(--chart-4))' },
    { name: 'Critical', value: samples.filter(s => s.riskLevel === 'critical').length, color: 'hsl(var(--destructive))' },
  ];

  const tooltipStyle = { 
    backgroundColor: 'hsl(var(--card))', 
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Droplets className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading groundwater data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-primary p-2">
                <Droplets className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">HMPI Platform</h1>
                <p className="text-sm text-muted-foreground">Pune Groundwater Quality Analysis • {samples.length} samples</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select value={selectedStandard} onValueChange={handleStandardChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STANDARDS.map(std => (
                    <SelectItem key={std.id} value={std.id}>
                      {std.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Samples"
            value={stats.totalSamples}
            subtitle="Real dataset loaded"
            icon={Droplets}
            variant="default"
          />
          <StatCard
            title="Unsafe Wells"
            value={stats.unsafeWells}
            subtitle={`${stats.totalSamples > 0 ? Math.round((stats.unsafeWells / stats.totalSamples) * 100) : 0}% of total`}
            icon={AlertTriangle}
            variant="warning"
            trend="up"
          />
          <StatCard
            title="Critical Sites"
            value={stats.criticalWells}
            subtitle="Immediate action required"
            icon={AlertTriangle}
            variant="destructive"
            trend="up"
          />
          <StatCard
            title="Avg HPI"
            value={stats.avgHPI}
            subtitle={`HI: ${stats.avgHI.toFixed(2)} | Top: ${stats.mostContaminated}`}
            icon={TrendingUp}
            variant={stats.avgHPI > 150 ? 'destructive' : stats.avgHPI > 75 ? 'warning' : 'success'}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="samples">
              <Droplets className="h-4 w-4 mr-1" />
              Samples
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Activity className="h-4 w-4 mr-1" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="map">
              <MapIcon className="h-4 w-4 mr-1" />
              Map View
            </TabsTrigger>
            <TabsTrigger value="ml">
              <Heart className="h-4 w-4 mr-1" />
              ML Lab
            </TabsTrigger>
            <TabsTrigger value="comparison">
              <GitCompare className="h-4 w-4 mr-1" />
              Compare Methods
            </TabsTrigger>
            <TabsTrigger value="global">
              <Globe2 className="h-4 w-4 mr-1" />
              Global View
            </TabsTrigger>
            <TabsTrigger value="global-analytics">
              <Activity className="h-4 w-4 mr-1" />
              Global Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trends Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Pollution Trends</CardTitle>
                  <CardDescription>Historical trend of HPI and Hazard Index over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                      <Area type="monotone" dataKey="avgHPI" name="Avg HPI" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="avgHI" name="Avg HI" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Risk Pie */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {riskDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {riskDistribution.map(r => (
                      <div key={r.name} className="flex items-center justify-between text-sm">
                        <span>{r.name}</span>
                        <span className="font-bold">{r.value} ({samples.length > 0 ? Math.round((r.value / samples.length) * 100) : 0}%)</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Metal Distribution + Top Sites */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Heavy Metal Distribution</CardTitle>
                  <CardDescription>Average concentration (μg/L)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={metalData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="metal" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="avg" name="Avg Concentration" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Contaminated Sites</CardTitle>
                  <CardDescription>Click to view detailed analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {samples
                      .sort((a, b) => (b.hpi || 0) - (a.hpi || 0))
                      .slice(0, 6)
                      .map(sample => {
                        const risk = predictHealthRisks(sample);
                        return (
                          <div
                            key={sample.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer border"
                            onClick={() => handleSampleClick(sample)}
                          >
                            <div className="flex items-center gap-3">
                              <MapPin className="h-4 w-4 text-destructive" />
                              <div>
                                <div className="font-medium text-sm">{sample.sampleId}</div>
                                <div className="text-xs text-muted-foreground">{sample.wellId}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-sm font-bold text-destructive">HPI: {sample.hpi?.toFixed(0)}</div>
                                <div className="text-xs text-muted-foreground">Score: {risk.safetyScore}/100</div>
                              </div>
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="samples" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle>Sample Data ({filteredSamples.length})</CardTitle>
                    <CardDescription>Click any row to view detailed health risk analysis</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search samples..."
                        className="pl-9 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button>
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sample ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>pH</TableHead>
                        <TableHead>HPI</TableHead>
                        <TableHead>HI</TableHead>
                        <TableHead>Risk</TableHead>
                        <TableHead>Safety</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSamples.slice(0, 50).map(sample => {
                        const risk = predictHealthRisks(sample);
                        return (
                          <TableRow
                            key={sample.id}
                            className="cursor-pointer hover:bg-accent/30"
                            onClick={() => handleSampleClick(sample)}
                          >
                            <TableCell className="font-medium font-mono text-xs">{sample.sampleId}</TableCell>
                            <TableCell className="text-xs">{sample.sampleDate}</TableCell>
                            <TableCell className="text-xs">{sample.wellId}</TableCell>
                            <TableCell className="text-xs">{sample.pH.toFixed(1)}</TableCell>
                            <TableCell className="text-xs font-mono">{sample.hpi?.toFixed(1)}</TableCell>
                            <TableCell className="text-xs font-mono">{sample.hi?.toFixed(3)}</TableCell>
                            <TableCell>
                              <RiskBadge level={sample.riskLevel!} size="sm" />
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  risk.overallRisk === 'Safe' ? 'border-green-500 text-green-500' :
                                  risk.overallRisk === 'Caution' ? 'border-yellow-500 text-yellow-500' :
                                  risk.overallRisk === 'Unsafe' ? 'border-orange-500 text-orange-500' :
                                  'border-red-500 text-red-500'
                                }`}
                              >
                                {risk.drinkingSafety.split(' ')[0]} {risk.safetyScore}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {filteredSamples.length > 50 && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Showing 50 of {filteredSamples.length} samples. Use search to filter.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <AdvancedAnalytics samples={samples} />
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapIcon className="h-5 w-5 text-primary" />
                  Pune Groundwater Risk Map
                </CardTitle>
                <CardDescription>
                  Search any Pune location (Swargate, Hinjewadi, Kothrud, Koregaon Park...) to fly to that area and view nearest sample.
                </CardDescription>
                <div className="flex gap-4 mt-3 text-sm flex-wrap">
                  {[
                    { color: 'bg-green-500', label: 'Low Risk' },
                    { color: 'bg-yellow-500', label: 'Medium Risk' },
                    { color: 'bg-orange-500', label: 'High Risk' },
                    { color: 'bg-red-500', label: 'Critical Risk' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <IndiaRiskMap samples={samples} onSampleClick={handleSampleClick} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ml" className="space-y-6">
            <MLScienceLab samples={samples} />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <MethodComparison />
          </TabsContent>

          <TabsContent value="global" className="space-y-6">
            <GlobalAnalytics samples={globalSamples} />
          </TabsContent>

          <TabsContent value="global-analytics" className="space-y-6">
            <GlobalAdvancedAnalytics samples={globalSamples} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Sample Detail Modal */}
      <SampleDetailModal
        sample={selectedSample}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
