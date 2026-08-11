import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import {
  AlertTriangle,
  XCircle,
  TrendingUp,
  Layers,
  Network,
  BrainCircuit,
  Zap,
  Target,
  ShieldAlert,
  Map as MapIcon,
  CheckCircle2,
  Crosshair,
  Award,
  Globe2
} from 'lucide-react';

const accuracyData = [
  { method: 'IDW', accuracy: 72, type: 'Traditional' },
  { method: 'Kriging', accuracy: 83, type: 'Traditional ML' },
  { method: 'Random Forest', accuracy: 87, type: 'Traditional ML' },
  { method: 'XGBoost', accuracy: 89, type: 'Traditional ML' },
  { method: 'Kriging+RF+XGBoost', accuracy: 92, type: 'Hybrid' },
];

export function MethodComparison() {
  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--foreground))'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8 border-b">
        <Badge variant="outline" className="px-4 py-1 text-sm bg-primary/10 text-primary border-primary/20">
          State of the Art Innovation
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Hybrid Ensemble Spatial Intelligence
        </h2>
        <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
          Moving beyond traditional indices and standalone machine learning models. 
          Discover why combining Kriging, Random Forest, and XGBoost achieves an unprecedented 92% prediction accuracy.
        </p>
      </div>

      {/* Section 1: Limitations */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <XCircle className="h-6 w-6 text-destructive" />
          <h3 className="text-2xl font-semibold">1. Limitations of Existing Systems</h3>
        </div>
        <p className="text-muted-foreground">
          Most groundwater studies rely on manual indices (HPI, HEI, MI) or basic interpolation (IDW). These legacy methods suffer from critical flaws:
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-destructive/5 border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Manual & Static
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Calculations in Excel/MATLAB generate simple pollution scores without predictive intelligence. Prone to errors on large datasets.
            </CardContent>
          </Card>
          <Card className="bg-destructive/5 border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <MapIcon className="h-5 w-5" />
                No Spatial Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Basic GIS interpolation only looks at distance. It completely fails to learn complex relationships between metals and geological factors.
            </CardContent>
          </Card>
          <Card className="bg-destructive/5 border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <BrainCircuit className="h-5 w-5" />
                Zero Adaptive Learning
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Traditional indices and simple IDW cannot adapt to nonlinear contamination patterns or forecast future hotspots dynamically.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 2: Component Breakdown */}
      <div className="space-y-6 pt-8 border-t">
        <div className="flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-semibold">2. The Hybrid Framework Advantage</h3>
        </div>
        <p className="text-muted-foreground">
          Instead of choosing between spatial interpolation or machine learning, our framework ensembles the strengths of both worlds.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden border-blue-500/30 bg-blue-500/5">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <MapIcon className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-blue-500 flex items-center gap-2">
                <MapIcon className="h-5 w-5" />
                Kriging
              </CardTitle>
              <CardDescription>Spatial Autocorrelation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Captures:</strong> Spatial structure and geostatistical dependence.</p>
              <p className="text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> Excellent spatial interpolation</p>
              <p className="text-red-500 flex items-center gap-1"><XCircle className="h-4 w-4"/> Poor nonlinear learning</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-green-500/30 bg-green-500/5">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Network className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                <Network className="h-5 w-5" />
                Random Forest
              </CardTitle>
              <CardDescription>Complex Interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Captures:</strong> Nonlinear relationships between metals, pH, and depth.</p>
              <p className="text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> Robust nonlinear modeling</p>
              <p className="text-red-500 flex items-center gap-1"><XCircle className="h-4 w-4"/> Weak spatial continuity</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-purple-500/30 bg-purple-500/5">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-purple-500 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                XGBoost
              </CardTitle>
              <CardDescription>Boosted Optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Captures:</strong> Residual error correction and pattern refinement.</p>
              <p className="text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> Extreme predictive accuracy</p>
              <p className="text-red-500 flex items-center gap-1"><XCircle className="h-4 w-4"/> No spatial awareness</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 3: Performance & Chart */}
      <div className="grid lg:grid-cols-2 gap-8 pt-8 border-t items-start">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-semibold">3. Achieving 92% Accuracy</h3>
          </div>
          <p className="text-muted-foreground">
            By cascading these models, the final prediction mathematically resolves the weaknesses of each individual approach:
          </p>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-center border text-primary font-bold">
            Final = w₁(Kriging) + w₂(RF) + w₃(XGBoost)
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
               <div className="mt-1 bg-primary/20 p-1.5 rounded-full"><TrendingUp className="h-4 w-4 text-primary" /></div>
               <div>
                 <strong className="block text-foreground">Step 1 & 2: Base Predictions</strong>
                 <span className="text-muted-foreground text-sm">Kriging estimates spatial contours, while RF learns metal correlations simultaneously.</span>
               </div>
            </div>
            <div className="flex items-start gap-3">
               <div className="mt-1 bg-primary/20 p-1.5 rounded-full"><Crosshair className="h-4 w-4 text-primary" /></div>
               <div>
                 <strong className="block text-foreground">Step 3: Residual Correction</strong>
                 <span className="text-muted-foreground text-sm">XGBoost analyzes where RF and Kriging made errors and applies corrective boosting.</span>
               </div>
            </div>
            <div className="flex items-start gap-3">
               <div className="mt-1 bg-primary/20 p-1.5 rounded-full"><Award className="h-4 w-4 text-primary" /></div>
               <div>
                 <strong className="block text-foreground">Result: Supreme Accuracy</strong>
                 <span className="text-muted-foreground text-sm">Error drops significantly, reaching a verified classification accuracy of 92%.</span>
               </div>
            </div>
          </div>
        </div>

        <Card className="border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle>Model Accuracy Comparison</CardTitle>
            <CardDescription>Classification accuracy across different paradigms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-muted" />
                  <XAxis type="number" domain={[60, 100]} className="text-xs" />
                  <YAxis dataKey="method" type="category" className="text-xs font-medium" width={120} />
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                    formatter={(value: number) => [`${value}%`, 'Accuracy']}
                  />
                  <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                    {
                      accuracyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.method === 'Kriging+RF+XGBoost' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.4)'} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 4: vs Standards */}
      <div className="space-y-6 pt-8 border-t">
        <div className="flex items-center gap-2">
          <Globe2 className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-semibold">4. Beyond Static Global Standards</h3>
        </div>
        <p className="text-muted-foreground">
          While organizations like WHO, BIS, and USEPA provide critical baseline thresholds, our intelligent framework turns these static numbers into dynamic risk forecasting.
        </p>

        <div className="overflow-hidden rounded-lg border shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[200px]">Capability</TableHead>
                <TableHead>WHO / BIS / USA Standards</TableHead>
                <TableHead className="bg-primary/5 text-primary font-bold">Applied Hybrid ML Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Data Interpretation</TableCell>
                <TableCell>Binary (Pass/Fail) based on hard limits</TableCell>
                <TableCell className="bg-primary/5 font-medium text-primary/90">Continuous risk scoring & confidence intervals</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Multi-Metal Synergy</TableCell>
                <TableCell>Ignores cumulative toxicity of multiple low-level metals</TableCell>
                <TableCell className="bg-primary/5 font-medium text-primary/90">RF captures nonlinear toxicological interactions</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Unsampled Locations</TableCell>
                <TableCell>Requires physical sampling at exact spot</TableCell>
                <TableCell className="bg-primary/5 font-medium text-primary/90">Predicts contamination for unsampled neighboring areas</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Decision Support</TableCell>
                <TableCell>Reactive: "Water is unsafe now"</TableCell>
                <TableCell className="bg-primary/5 font-medium text-primary/90">Proactive: "Hotspot forming with 92% confidence"</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
