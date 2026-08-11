import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WaterSample } from '@/types';
import { predictHealthRisks, HealthRiskPrediction } from '@/utils/healthRiskPredictor';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { 
  AlertTriangle, 
  Activity, 
  Droplets, 
  Heart, 
  Shield, 
  MapPin,
  Thermometer,
  Beaker,
  TrendingUp,
  Users
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { AIInsightCard } from './AIInsightCard';
import 'leaflet/dist/leaflet.css';

interface SampleDetailModalProps {
  sample: WaterSample | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'Safe': return 'bg-green-500';
    case 'Caution': return 'bg-yellow-500';
    case 'Unsafe': return 'bg-orange-500';
    case 'Dangerous': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getProbabilityColor = (prob: string) => {
  switch (prob) {
    case 'High': return 'text-red-500';
    case 'Medium': return 'text-yellow-500';
    case 'Low': return 'text-green-500';
    default: return 'text-gray-500';
  }
};

export const SampleDetailModal = ({ sample, open, onOpenChange }: SampleDetailModalProps) => {
  const [prediction, setPrediction] = useState<HealthRiskPrediction | null>(null);

  useEffect(() => {
    if (sample) {
      const risk = predictHealthRisks(sample);
      setPrediction(risk);
    }
  }, [sample]);

  if (!sample || !prediction) return null;

  const metalData = [
    { name: 'As', value: sample.as, limit: 10, fill: sample.as > 10 ? '#ef4444' : '#22c55e' },
    { name: 'Pb', value: sample.pb, limit: 10, fill: sample.pb > 10 ? '#ef4444' : '#22c55e' },
    { name: 'Cd', value: sample.cd, limit: 3, fill: sample.cd > 3 ? '#ef4444' : '#22c55e' },
    { name: 'Cr', value: sample.cr, limit: 50, fill: sample.cr > 50 ? '#ef4444' : '#22c55e' },
    { name: 'Ni', value: sample.ni, limit: 20, fill: sample.ni > 20 ? '#ef4444' : '#22c55e' },
  ];

  const indexData = [
    { name: 'HPI', value: Math.min((sample.hpi || 0) / 3, 100), fullMark: 100 },
    { name: 'HEI', value: Math.min((sample.hei || 0) * 10, 100), fullMark: 100 },
    { name: 'HI', value: Math.min((sample.hi || 0) * 50, 100), fullMark: 100 },
    { name: 'PLI', value: Math.min((sample.pli || 0) * 50, 100), fullMark: 100 },
    { name: 'Igeo', value: Math.min(Math.max((sample.igeo || 0) + 2, 0) * 20, 100), fullMark: 100 },
  ];

  const safetyPieData = [
    { name: 'Safe', value: prediction.safetyScore },
    { name: 'Risk', value: 100 - prediction.safetyScore },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Droplets className="h-6 w-6 text-primary" />
            Sample Analysis: {sample.sampleId}
            <Badge className={`${getRiskColor(prediction.overallRisk)} text-white ml-2`}>
              {prediction.overallRisk}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="health" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="health">Health Risk</TabsTrigger>
            <TabsTrigger value="ai">AI Insight</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="details">Raw Data</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <AIInsightCard sample={sample} />
          </TabsContent>

          <TabsContent value="health" className="space-y-4 mt-4">
            {/* Safety Status Banner */}
            <Card className={`border-2 ${
              prediction.overallRisk === 'Safe' ? 'border-green-500 bg-green-50 dark:bg-green-950' :
              prediction.overallRisk === 'Caution' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' :
              prediction.overallRisk === 'Unsafe' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' :
              'border-red-500 bg-red-50 dark:bg-red-950'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{prediction.drinkingSafety}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Safety Score: {prediction.safetyScore}/100</p>
                  </div>
                  <div className="w-24 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={safetyPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={40}
                          dataKey="value"
                        >
                          <Cell fill="#22c55e" />
                          <Cell fill="#ef4444" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disease Predictions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  AI-Predicted Health Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {prediction.potentialDiseases.length > 0 ? (
                  <div className="space-y-3">
                    {prediction.potentialDiseases.map((disease, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{disease.disease}</p>
                          <p className="text-sm text-muted-foreground">Caused by: {disease.causedBy}</p>
                        </div>
                        <Badge variant="outline" className={getProbabilityColor(disease.probability)}>
                          {disease.probability} Risk
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-600 font-medium">✅ No significant disease risks detected</p>
                )}
              </CardContent>
            </Card>

            {/* Exposure Risk */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Short-Term Exposure</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{prediction.exposureRisk.shortTerm}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Long-Term Exposure</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{prediction.exposureRisk.longTerm}</p>
                </CardContent>
              </Card>
            </div>

            {/* Vulnerable Groups */}
            {prediction.vulnerableGroups.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    At-Risk Groups
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {prediction.vulnerableGroups.map((group, idx) => (
                      <Badge key={idx} variant="destructive">{group}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prediction.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-primary">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4 mt-4">
            {/* Contaminant Alerts */}
            {prediction.contaminantAlerts.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Contaminant Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {prediction.contaminantAlerts.map((alert, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{alert.metal}</span>
                        <span className="text-sm text-destructive">+{alert.exceedance}% above limit</span>
                      </div>
                      <Progress 
                        value={Math.min(alert.exceedance, 100)} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        Level: {alert.level} μg/L (Limit: {alert.limit} μg/L) — {alert.healthEffect}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Metal Concentration Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Metal Concentrations vs Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={metalData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Concentration (μg/L)">
                      {metalData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pollution Index Radar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pollution Index Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={indexData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar 
                      name="Index Value" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.5} 
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Sample Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] rounded-lg overflow-hidden">
                  <MapContainer
                    center={[sample.lat, sample.lon]}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <CircleMarker
                      center={[sample.lat, sample.lon]}
                      radius={15}
                      fillColor={
                        sample.riskLevel === 'critical' ? '#ef4444' :
                        sample.riskLevel === 'high' ? '#f97316' :
                        sample.riskLevel === 'medium' ? '#eab308' : '#22c55e'
                      }
                      color="#fff"
                      weight={3}
                      fillOpacity={0.8}
                    >
                      <Popup>
                        <div className="p-2">
                          <h4 className="font-bold">{sample.sampleId}</h4>
                          <p>Risk: {sample.riskLevel?.toUpperCase()}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  </MapContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Latitude</p>
                    <p className="font-mono">{sample.lat.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Longitude</p>
                    <p className="font-mono">{sample.lon.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Well ID</p>
                    <p className="font-mono">{sample.wellId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Depth</p>
                    <p className="font-mono">{sample.depthM} meters</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Sample ID</p>
                    <p className="font-mono font-medium">{sample.sampleId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Sample Date</p>
                    <p className="font-mono">{sample.sampleDate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">pH Level</p>
                    <p className="font-mono">{sample.pH.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">TDS</p>
                    <p className="font-mono">{sample.tds.toFixed(0)} mg/L</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Conductivity</p>
                    <p className="font-mono">{sample.ec.toFixed(0)} μS/cm</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Lab ID</p>
                    <p className="font-mono">{sample.labId}</p>
                  </div>
                  
                  <div className="col-span-full border-t pt-4 mt-2">
                    <p className="font-semibold mb-3">Heavy Metal Concentrations (μg/L)</p>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-muted-foreground text-xs">Arsenic</p>
                        <p className={`font-mono ${sample.as > 10 ? 'text-red-500' : ''}`}>{sample.as.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Lead</p>
                        <p className={`font-mono ${sample.pb > 10 ? 'text-red-500' : ''}`}>{sample.pb.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Cadmium</p>
                        <p className={`font-mono ${sample.cd > 3 ? 'text-red-500' : ''}`}>{sample.cd.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Chromium</p>
                        <p className={`font-mono ${sample.cr > 50 ? 'text-red-500' : ''}`}>{sample.cr.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Nickel</p>
                        <p className={`font-mono ${sample.ni > 20 ? 'text-red-500' : ''}`}>{sample.ni.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Copper</p>
                        <p className="font-mono">{sample.cu.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Zinc</p>
                        <p className="font-mono">{sample.zn.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Iron</p>
                        <p className="font-mono">{sample.fe.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-full border-t pt-4 mt-2">
                    <p className="font-semibold mb-3">Pollution Indices</p>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-muted-foreground text-xs">HPI</p>
                        <p className="font-mono font-bold">{sample.hpi?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">HEI</p>
                        <p className="font-mono font-bold">{sample.hei?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Igeo</p>
                        <p className="font-mono font-bold">{sample.igeo?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">PLI</p>
                        <p className="font-mono font-bold">{sample.pli?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">HI (Hazard Index)</p>
                        <p className={`font-mono font-bold ${(sample.hi || 0) > 1 ? 'text-red-500' : ''}`}>
                          {sample.hi?.toFixed(3)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">CF</p>
                        <p className="font-mono font-bold">{sample.cf?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">EF</p>
                        <p className="font-mono font-bold">{sample.ef?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
