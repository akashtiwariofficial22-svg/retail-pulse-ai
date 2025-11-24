import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { AlertCircle, Map as MapIcon } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';

const GeoInsights = () => {
  const { data, hasLocationData } = useData();

  const mapCenter = useMemo(() => {
    if (!hasLocationData || data.length === 0) return [19.0760, 72.8777] as [number, number];
    
    const avgLat = data.reduce((sum, d) => sum + (d.latitude || 0), 0) / data.length;
    const avgLng = data.reduce((sum, d) => sum + (d.longitude || 0), 0) / data.length;
    
    return [avgLat, avgLng] as [number, number];
  }, [data, hasLocationData]);

  const heatmapData = useMemo(() => {
    if (!hasLocationData) return [];
    
    const locationCounts = data.reduce((acc, d) => {
      if (d.latitude && d.longitude) {
        const key = `${d.latitude.toFixed(4)},${d.longitude.toFixed(4)}`;
        if (!acc[key]) {
          acc[key] = { lat: d.latitude, lng: d.longitude, count: 0 };
        }
        acc[key].count += d.footfall;
      }
      return acc;
    }, {} as Record<string, { lat: number; lng: number; count: number }>);

    return Object.values(locationCounts);
  }, [data, hasLocationData]);

  const maxCount = useMemo(() => {
    return Math.max(...heatmapData.map(d => d.count), 1);
  }, [heatmapData]);

  if (!hasLocationData) {
    return (
      <div className="container py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Geo-Insights</h1>
          <p className="text-muted-foreground">
            Geospatial analysis and customer density heatmaps
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Location Data Not Available</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Heatmap features are disabled because your uploaded data doesn't include latitude and longitude columns.
              Please upload data with geolocation information to enable this feature.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Geo-Insights</h1>
        <p className="text-muted-foreground">
          Geospatial analysis and customer density heatmaps around your store
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapIcon className="w-5 h-5" />
              Location Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Total Data Points</p>
              <p className="text-2xl font-bold">{data.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unique Locations</p>
              <p className="text-2xl font-bold">{heatmapData.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Center Coordinates</p>
              <p className="text-sm font-mono">
                {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-accent mt-2" />
              <div>
                <p className="font-medium">High Density Areas</p>
                <p className="text-sm text-muted-foreground">
                  Larger circles indicate areas with higher customer footfall concentration
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-accent mt-2" />
              <div>
                <p className="font-medium">Customer Distribution</p>
                <p className="text-sm text-muted-foreground">
                  The map shows the geographical spread of customer activity around your location
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Density Heatmap</CardTitle>
          <CardDescription>
            Interactive map showing footfall density across locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] rounded-lg overflow-hidden">
            <MapContainer
              center={mapCenter}
              zoom={13}
              className="h-full w-full"
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {heatmapData.map((point, idx) => {
                const intensity = point.count / maxCount;
                const radius = 5 + intensity * 15;
                const opacity = 0.3 + intensity * 0.5;
                
                return (
                  <CircleMarker
                    key={idx}
                    center={[point.lat, point.lng]}
                    radius={radius}
                    pathOptions={{
                      fillColor: 'hsl(190, 95%, 50%)',
                      fillOpacity: opacity,
                      color: 'hsl(220, 70%, 15%)',
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div>
                        <p className="font-semibold">Footfall: {point.count}</p>
                        <p className="text-xs text-muted-foreground">
                          {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeoInsights;
