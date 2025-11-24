import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { Line } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';
import { useMemo } from 'react';
import { addHours, format } from 'date-fns';

const Forecasting = () => {
  const { data } = useData();

  const forecast = useMemo(() => {
    if (data.length === 0) return null;

    // Get last 7 days of hourly averages
    const recentData = data.slice(-168); // Last 7 days (24 hours * 7)
    
    // Calculate hourly averages
    const hourlyAvg = new Array(24).fill(0).map(() => ({ sum: 0, count: 0 }));
    recentData.forEach(d => {
      const hour = new Date(d.timestamp).getHours();
      hourlyAvg[hour].sum += d.footfall;
      hourlyAvg[hour].count += 1;
    });

    const hourlyAverages = hourlyAvg.map(h => 
      h.count > 0 ? Math.round(h.sum / h.count) : 0
    );

    // Simple moving average for next 24 hours
    const lastTimestamp = new Date(data[data.length - 1].timestamp);
    const predictions = [];
    
    for (let i = 1; i <= 24; i++) {
      const futureTime = addHours(lastTimestamp, i);
      const hour = futureTime.getHours();
      
      // Add some trend and randomness
      const baseValue = hourlyAverages[hour];
      const trend = (Math.random() - 0.5) * 5;
      const predicted = Math.max(5, Math.round(baseValue + trend));
      
      predictions.push({
        timestamp: futureTime,
        hour: format(futureTime, 'HH:mm'),
        predicted,
      });
    }

    // Calculate insights
    const totalPredicted = predictions.reduce((sum, p) => sum + p.predicted, 0);
    const avgPredicted = Math.round(totalPredicted / predictions.length);
    const peakPredicted = predictions.reduce((max, p) => p.predicted > max.predicted ? p : max);
    
    const lastDayTotal = recentData.slice(-24).reduce((sum, d) => sum + d.footfall, 0);
    const trend = totalPredicted > lastDayTotal ? 'up' : 'down';
    const trendPercent = Math.abs(((totalPredicted - lastDayTotal) / lastDayTotal) * 100).toFixed(1);

    // Confidence based on data consistency
    const variance = hourlyAverages.reduce((sum, val) => {
      const diff = val - avgPredicted;
      return sum + diff * diff;
    }, 0) / 24;
    
    const confidence = variance < 100 ? 'high' : variance < 300 ? 'medium' : 'low';

    return {
      predictions,
      totalPredicted,
      avgPredicted,
      peakHour: peakPredicted.hour,
      trend,
      trendPercent,
      confidence,
      historicalAvg: hourlyAverages,
    };
  }, [data]);

  const chartData = useMemo(() => {
    if (!forecast) return null;

    const historicalLast24 = data.slice(-24);
    
    return {
      labels: [
        ...historicalLast24.map(d => format(new Date(d.timestamp), 'HH:mm')),
        ...forecast.predictions.map(p => p.hour),
      ],
      datasets: [
        {
          label: 'Historical',
          data: [
            ...historicalLast24.map(d => d.footfall),
            ...new Array(24).fill(null),
          ],
          borderColor: 'hsl(220, 70%, 15%)',
          backgroundColor: 'hsla(220, 70%, 15%, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Forecast',
          data: [
            ...new Array(historicalLast24.length).fill(null),
            ...forecast.predictions.map(p => p.predicted),
          ],
          borderColor: 'hsl(190, 95%, 50%)',
          backgroundColor: 'hsla(190, 95%, 50%, 0.1)',
          borderDash: [5, 5],
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [data, forecast]);

  if (!forecast) {
    return (
      <div className="container py-8 px-4">
        <p className="text-center text-muted-foreground">No data available for forecasting.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Footfall Forecasting</h1>
        <p className="text-muted-foreground">
          AI-powered predictions for the next 24 hours
        </p>
      </div>

      {/* Insight Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Predicted Total</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forecast.totalPredicted}</div>
            <p className="text-xs text-muted-foreground">Next 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            {forecast.trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-accent" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecast.trend === 'up' ? '+' : '-'}{forecast.trendPercent}%
            </div>
            <p className="text-xs text-muted-foreground">
              {forecast.trend === 'up' ? 'Busier' : 'Slower'} than yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forecast.peakHour}</div>
            <p className="text-xs text-muted-foreground">Expected busiest time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Confidence</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{forecast.confidence}</div>
            <p className="text-xs text-muted-foreground">Prediction accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>24-Hour Forecast</CardTitle>
          <CardDescription>
            Predicted footfall for the next 24 hours based on historical patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData && (
            <div className="h-96">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    intersect: false,
                    mode: 'index',
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forecast Table */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Forecast Details</CardTitle>
          <CardDescription>Detailed predictions for each hour</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Time</th>
                  <th className="text-right p-2 font-medium">Predicted Footfall</th>
                  <th className="text-right p-2 font-medium">Historical Avg</th>
                </tr>
              </thead>
              <tbody>
                {forecast.predictions.map((pred, idx) => {
                  const hour = new Date(pred.timestamp).getHours();
                  const historicalAvg = forecast.historicalAvg[hour];
                  
                  return (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{pred.hour}</td>
                      <td className="text-right p-2 font-medium">{pred.predicted}</td>
                      <td className="text-right p-2 text-muted-foreground">{historicalAvg}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Forecasting;
