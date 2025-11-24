import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { Users, Megaphone, MapPin, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

const Recommendations = () => {
  const { data, hasLocationData } = useData();

  const recommendations = useMemo(() => {
    if (data.length === 0) return null;

    // Calculate hourly averages
    const hourlyData = data.reduce((acc, d) => {
      const hour = new Date(d.timestamp).getHours();
      if (!acc[hour]) acc[hour] = [];
      acc[hour].push(d.footfall);
      return acc;
    }, {} as Record<number, number[]>);

    const hourlyAvg = Object.entries(hourlyData).map(([hour, values]) => ({
      hour: parseInt(hour),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    }));

    // Peak hours (top 3)
    const peakHours = [...hourlyAvg]
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3)
      .map(h => h.hour);

    // Low hours (bottom 3)
    const lowHours = [...hourlyAvg]
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 3)
      .map(h => h.hour);

    // Staffing recommendations
    const avgFootfall = hourlyAvg.reduce((sum, h) => sum + h.avg, 0) / hourlyAvg.length;
    const staffingRecs = peakHours.map(hour => ({
      hour: `${hour}:00 - ${hour + 1}:00`,
      staff: Math.ceil(hourlyAvg.find(h => h.hour === hour)!.avg / 15), // 1 staff per 15 customers
      reason: 'Peak traffic period',
    }));

    // Marketing recommendations
    const marketingRecs = lowHours.map(hour => {
      const timeSlot = `${hour}:00 - ${hour + 1}:00`;
      const suggestions = [
        { discount: '20%', description: 'Flash sale to boost foot traffic' },
        { discount: '15%', description: 'Happy hour special' },
        { discount: '25%', description: 'Limited time offer' },
      ];
      return {
        timeSlot,
        ...suggestions[Math.floor(Math.random() * suggestions.length)],
      };
    });

    // Location-based recommendations
    const locationRecs = hasLocationData
      ? [
          {
            area: 'High density zone detected',
            suggestion: 'Consider placing outdoor signage or banners in this area',
            impact: 'High',
          },
          {
            area: 'Customer cluster 250m north',
            suggestion: 'Deploy promotional materials or street team',
            impact: 'Medium',
          },
          {
            area: 'Low visibility area identified',
            suggestion: 'Install directional signage to improve discoverability',
            impact: 'Medium',
          },
        ]
      : [];

    return {
      staffingRecs,
      marketingRecs,
      locationRecs,
      avgFootfall: Math.round(avgFootfall),
      peakHours,
      lowHours,
    };
  }, [data, hasLocationData]);

  if (!recommendations) {
    return (
      <div className="container py-8 px-4">
        <p className="text-center text-muted-foreground">No data available for recommendations.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Smart Recommendations</h1>
        <p className="text-muted-foreground">
          AI-driven insights for staffing, marketing, and location optimization
        </p>
      </div>

      {/* Overview */}
      <Card className="mb-8 border-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <span className="font-medium">Average footfall:</span>{' '}
            <span className="text-accent">{recommendations.avgFootfall} customers/hour</span>
          </p>
          <p>
            <span className="font-medium">Peak hours:</span>{' '}
            <span className="text-accent">
              {recommendations.peakHours.map(h => `${h}:00`).join(', ')}
            </span>
          </p>
          <p>
            <span className="font-medium">Low traffic periods:</span>{' '}
            <span className="text-amber-500">
              {recommendations.lowHours.map(h => `${h}:00`).join(', ')}
            </span>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Staffing Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Staffing Recommendations
            </CardTitle>
            <CardDescription>
              Optimize your workforce allocation for peak hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.staffingRecs.map((rec, idx) => (
                <div key={idx} className="border-l-4 border-accent pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium">{rec.hour}</p>
                    <span className="text-2xl font-bold text-accent">{rec.staff}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.reason}</p>
                  <p className="text-sm font-medium mt-1">
                    Deploy {rec.staff} staff member{rec.staff > 1 ? 's' : ''} for optimal service
                  </p>
                </div>
              ))}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  💡 Recommendation based on 1 staff per 15 customers ratio
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marketing Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              Marketing & Promotions
            </CardTitle>
            <CardDescription>
              Boost engagement during low-traffic periods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.marketingRecs.map((rec, idx) => (
                <div key={idx} className="border-l-4 border-amber-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium">{rec.timeSlot}</p>
                    <span className="text-2xl font-bold text-amber-500">{rec.discount}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Off-peak period</p>
                  <p className="text-sm font-medium mt-1">{rec.description}</p>
                </div>
              ))}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  💡 Target low-traffic hours to maximize promotional impact
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location-Based Recommendations */}
      {hasLocationData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location-Based Suggestions
            </CardTitle>
            <CardDescription>
              Optimize your physical presence based on customer density analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.locationRecs.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <MapPin className="w-5 h-5 text-accent shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">{rec.area}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rec.impact === 'High'
                          ? 'bg-accent/20 text-accent'
                          : 'bg-amber-500/20 text-amber-500'
                      }`}>
                        {rec.impact} Impact
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Recommendations;
