import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Users, TrendingUp, Clock, Calendar } from 'lucide-react';
import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const { data } = useData();

  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const totalFootfall = data.reduce((sum, d) => sum + d.footfall, 0);
    const avgFootfall = Math.round(totalFootfall / data.length);
    
    const hourlyData = data.reduce((acc, d) => {
      const hour = new Date(d.timestamp).getHours();
      if (!acc[hour]) acc[hour] = [];
      acc[hour].push(d.footfall);
      return acc;
    }, {} as Record<number, number[]>);

    const avgByHour = Object.entries(hourlyData).map(([hour, values]) => ({
      hour: parseInt(hour),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    }));

    const peakHour = avgByHour.reduce((max, curr) => curr.avg > max.avg ? curr : max);
    const lowestHour = avgByHour.reduce((min, curr) => curr.avg < min.avg ? curr : min);

    const dailyData = data.reduce((acc, d) => {
      const date = format(parseISO(d.timestamp), 'yyyy-MM-dd');
      if (!acc[date]) acc[date] = 0;
      acc[date] += d.footfall;
      return acc;
    }, {} as Record<string, number>);

    const peakDay = Object.entries(dailyData).reduce((max, curr) => 
      curr[1] > max[1] ? curr : max
    );

    return {
      totalFootfall,
      avgFootfall,
      peakHour: `${peakHour.hour}:00`,
      lowestHour: `${lowestHour.hour}:00`,
      peakDay: format(parseISO(peakDay[0]), 'MMM dd, yyyy'),
    };
  }, [data]);

  const hourlyChartData = useMemo(() => {
    const hourlyAvg = new Array(24).fill(0).map(() => ({ count: 0, sum: 0 }));
    
    data.forEach(d => {
      const hour = new Date(d.timestamp).getHours();
      hourlyAvg[hour].sum += d.footfall;
      hourlyAvg[hour].count += 1;
    });

    return {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [{
        label: 'Average Hourly Footfall',
        data: hourlyAvg.map(h => h.count > 0 ? h.sum / h.count : 0),
        borderColor: 'hsl(190, 95%, 50%)',
        backgroundColor: 'hsla(190, 95%, 50%, 0.1)',
        fill: true,
        tension: 0.4,
      }],
    };
  }, [data]);

  const dailyChartData = useMemo(() => {
    const dailyData = data.reduce((acc, d) => {
      const date = format(parseISO(d.timestamp), 'MMM dd');
      if (!acc[date]) acc[date] = 0;
      acc[date] += d.footfall;
      return acc;
    }, {} as Record<string, number>);

    const sortedDates = Object.keys(dailyData).slice(-14); // Last 14 days

    return {
      labels: sortedDates,
      datasets: [{
        label: 'Daily Footfall',
        data: sortedDates.map(date => dailyData[date]),
        backgroundColor: 'hsl(190, 95%, 50%)',
      }],
    };
  }, [data]);

  if (!stats) {
    return (
      <div className="container py-8 px-4">
        <p className="text-center text-muted-foreground">No data available. Please upload data first.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into your footfall patterns
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Footfall</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFootfall.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total visitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg per Hour</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgFootfall}</div>
            <p className="text-xs text-muted-foreground">Average hourly</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.peakHour}</div>
            <p className="text-xs text-muted-foreground">Busiest time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lowest Hour</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowestHour}</div>
            <p className="text-xs text-muted-foreground">Quietest time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Peak Day</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{stats.peakDay}</div>
            <p className="text-xs text-muted-foreground">Highest traffic</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Hourly Footfall Pattern</CardTitle>
            <CardDescription>Average footfall by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line 
                data={hourlyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Footfall Trend</CardTitle>
            <CardDescription>Last 14 days total footfall</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar 
                data={dailyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
