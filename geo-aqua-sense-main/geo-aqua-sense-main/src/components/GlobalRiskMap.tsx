import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { GlobalSample } from '@/types';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle } from 'lucide-react';

interface GlobalRiskMapProps {
  samples: GlobalSample[];
}

const getRiskColor = (riskCategory: string) => {
  switch (riskCategory.toLowerCase()) {
    case 'low': return '#22c55e'; // green
    case 'moderate': return '#eab308'; // yellow
    case 'high': return '#f97316'; // orange
    case 'critical': return '#ef4444'; // red
    default: return '#6b7280';
  }
};

export const GlobalRiskMap = ({ samples }: GlobalRiskMapProps) => {
  return (
    <div className="leaflet-map-isolation rounded-xl overflow-hidden border border-border shadow-xl relative" style={{ height: '600px', width: '100%' }}>
      <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true} minZoom={2}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {samples.map((sample) => (
          <CircleMarker
            key={sample.id}
            center={[sample.lat, sample.lon]}
            radius={4}
            fillColor={getRiskColor(sample.riskCategory)}
            color="#000"
            weight={0.5}
            opacity={0.8}
            fillOpacity={0.8}
          >
            <Popup className="custom-popup">
              <div className="p-1 space-y-2 min-w-[200px]">
                <div className="flex items-center gap-2 border-b pb-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-bold">{sample.siteId}</span>
                  <Badge variant="outline" className="ml-auto text-[10px]">{sample.country}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">HPI Score:</div>
                  <div className="font-mono font-medium text-right">{sample.hpi.toFixed(1)}</div>
                  <div className="text-muted-foreground">Risk Level:</div>
                  <div className="text-right">
                    <span style={{ color: getRiskColor(sample.riskCategory), fontWeight: 'bold' }}>
                      {sample.riskCategory}
                    </span>
                  </div>
                  <div className="text-muted-foreground">Water Safe:</div>
                  <div className="text-right font-medium">
                    {sample.waterSafe === 'Yes' ? (
                       <span className="text-green-600">Yes</span>
                    ) : sample.waterSafe === 'Borderline' ? (
                       <span className="text-yellow-600">Borderline</span>
                    ) : (
                       <span className="text-red-500 flex items-center justify-end gap-1">No <AlertTriangle className="h-3 w-3" /></span>
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};
