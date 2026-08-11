import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { WaterSample } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { searchPuneLocation, findNearestSample, PUNE_LOCATIONS, PuneLocation } from '@/utils/puneLocations';
import 'leaflet/dist/leaflet.css';

interface PuneRiskMapProps {
  samples: WaterSample[];
  onSampleClick?: (sample: WaterSample) => void;
}

const PUNE_CENTER: [number, number] = [18.5204, 73.8567];

function MapController({ flyTo }: { flyTo: { lat: number; lon: number; zoom?: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lon], flyTo.zoom ?? 15, { duration: 1.2 });
    }
  }, [flyTo, map]);

  // Force size invalidation after mount/tab-switch
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 500);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [map]);

  return null;
}

const getRiskColor = (riskLevel?: string) => {
  switch (riskLevel) {
    case 'low': return '#22c55e';
    case 'medium': return '#eab308';
    case 'high': return '#f97316';
    case 'critical': return '#ef4444';
    default: return '#6b7280';
  }
};

const getRiskRadius = (riskLevel?: string) => {
  switch (riskLevel) {
    case 'low': return 6;
    case 'medium': return 8;
    case 'high': return 10;
    case 'critical': return 12;
    default: return 6;
  }
};

export const IndiaRiskMap = ({ samples, onSampleClick }: PuneRiskMapProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [flyTo, setFlyTo] = useState<{ lat: number; lon: number; zoom?: number } | null>(null);
  const [searchResult, setSearchResult] = useState<{ location: PuneLocation; sample: WaterSample | null } | null>(null);
  const [suggestions, setSuggestions] = useState<PuneLocation[]>([]);

  const handleSearch = (q?: string) => {
    const query = (q ?? searchQuery).trim();
    if (!query) return;
    const loc = searchPuneLocation(query);
    if (loc) {
      const nearest = findNearestSample({ lat: loc.lat, lon: loc.lon }, samples);
      setSearchResult({ location: loc, sample: nearest });
      setFlyTo({ lat: loc.lat, lon: loc.lon, zoom: 14 });
      setSuggestions([]);
      setSearchQuery(loc.name);
    }
  };

  const handleSuggestionClick = (loc: PuneLocation) => {
    setSearchQuery(loc.name);
    handleSearch(loc.name);
  };

  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      const v = val.toLowerCase();
      setSuggestions(
        PUNE_LOCATIONS.filter(l =>
          l.name.toLowerCase().includes(v) || l.aliases.some(a => a.includes(v))
        ).slice(0, 6)
      );
    } else {
      setSuggestions([]);
    }
  };

  const resetView = () => {
    setSearchResult(null);
    setSearchQuery('');
    setFlyTo({ lat: PUNE_CENTER[0], lon: PUNE_CENTER[1], zoom: 11 });
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Pune location (e.g. Swargate, Hinjewadi, Kothrud, Koregaon Park)..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {suggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-popover border rounded-md shadow-lg z-[1000] max-h-64 overflow-auto">
              {suggestions.map(s => (
                <button
                  key={s.name}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center justify-between"
                  onClick={() => handleSuggestionClick(s)}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium">{s.name}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{s.area}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <Button onClick={() => handleSearch()}>
          <Search className="h-4 w-4 mr-1" />
          Search
        </Button>
        <Button variant="outline" onClick={resetView}>
          <Navigation className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* Search Result Banner */}
      {searchResult && (
        <div className="rounded-lg border bg-card p-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-sm">{searchResult.location.name}</div>
              <div className="text-xs text-muted-foreground">{searchResult.location.area} • {searchResult.location.lat.toFixed(4)}°N, {searchResult.location.lon.toFixed(4)}°E</div>
            </div>
          </div>
          {searchResult.sample ? (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                style={{ borderColor: getRiskColor(searchResult.sample.riskLevel), color: getRiskColor(searchResult.sample.riskLevel) }}
              >
                {searchResult.sample.riskLevel?.toUpperCase()} RISK
              </Badge>
              <Button size="sm" onClick={() => searchResult.sample && onSampleClick?.(searchResult.sample)}>
                View Analysis
              </Button>
            </div>
          ) : (
            <Badge variant="outline">No samples nearby</Badge>
          )}
        </div>
      )}

      {/* Map — explicit height + width to ensure visibility */}
      <div
        className="leaflet-map-isolation rounded-lg overflow-hidden border border-border shadow-lg relative"
        style={{ height: '600px', width: '100%' }}
      >
        <MapContainer
          center={PUNE_CENTER}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <MapController flyTo={flyTo} />
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Pune Landmarks (faint reference markers) */}
          {PUNE_LOCATIONS.slice(0, 12).map(loc => (
            <CircleMarker
              key={loc.name}
              center={[loc.lat, loc.lon]}
              radius={3}
              fillColor="#3b82f6"
              color="#1e40af"
              weight={1}
              opacity={0.5}
              fillOpacity={0.4}
            >
              <Popup>
                <div className="text-xs">
                  <div className="font-bold">{loc.name}</div>
                  <div className="text-muted-foreground">{loc.area}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Sample markers */}
          {samples.map((sample) => (
            <CircleMarker
              key={sample.id}
              center={[sample.lat, sample.lon]}
              radius={getRiskRadius(sample.riskLevel)}
              fillColor={getRiskColor(sample.riskLevel)}
              color="#fff"
              weight={2}
              opacity={1}
              fillOpacity={0.85}
              eventHandlers={{
                click: () => onSampleClick?.(sample),
              }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
