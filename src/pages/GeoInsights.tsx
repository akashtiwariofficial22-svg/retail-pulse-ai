import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { AlertCircle, Map as MapIcon, MapPin } from 'lucide-react';
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

      {/* Location Data Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Location Density Analysis</CardTitle>
          <CardDescription>
            Top locations by customer footfall concentration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Location</th>
                  <th className="text-left p-2 font-medium">Coordinates</th>
                  <th className="text-right p-2 font-medium">Total Footfall</th>
                  <th className="text-right p-2 font-medium">Intensity</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.slice(0, 20).map((point, idx) => {
                  const intensity = point.count / maxCount;
                  const intensityPercent = (intensity * 100).toFixed(0);
                  
                  return (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-accent" />
                          Location {idx + 1}
                        </div>
                      </td>
                      <td className="p-2 font-mono text-xs">
                        {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                      </td>
                      <td className="text-right p-2 font-medium">{point.count}</td>
                      <td className="text-right p-2">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent"
                              style={{ width: `${intensityPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-10">{intensityPercent}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Visual Heatmap Representation */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Density Visualization</CardTitle>
          <CardDescription>
            Visual representation of footfall intensity by location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {heatmapData.slice(0, 24).map((point, idx) => {
              const intensity = point.count / maxCount;
              const size = 60 + intensity * 80;
              const opacity = 0.3 + intensity * 0.7;
              
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="rounded-full bg-accent mb-2"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      opacity: opacity,
                    }}
                  />
                  <p className="text-xs font-medium">Loc {idx + 1}</p>
                  <p className="text-xs text-muted-foreground">{point.count} visits</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeoInsights;
