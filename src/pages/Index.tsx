import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Activity, BarChart3, Map, TrendingUp, Lightbulb, Upload, ArrowRight } from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: Upload,
      title: 'Easy Data Upload',
      description: 'Upload your historical footfall data via CSV and get instant insights',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Visualize hourly, daily, and weekly patterns with interactive charts',
    },
    {
      icon: Map,
      title: 'Geospatial Heatmaps',
      description: 'Understand customer density around your store with interactive maps',
    },
    {
      icon: TrendingUp,
      title: 'AI-Powered Forecasting',
      description: 'Predict next 24 hours footfall with machine learning models',
    },
    {
      icon: Lightbulb,
      title: 'Smart Recommendations',
      description: 'Get actionable staffing and promotion suggestions based on data',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28 lg:py-32">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="container relative px-4">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center shadow-strong">
                <Activity className="w-11 h-11 text-accent-foreground" />
              </div>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                RetailPulse
              </span>
            </h1>
            <p className="mb-4 text-xl md:text-2xl font-semibold text-foreground">
              GeoAI-Powered Customer Footfall Forecasting & Insights
            </p>
            <p className="mb-8 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload past footfall data to get hourly predictions, AI-driven staffing suggestions, 
              promotional recommendations, and geospatial customer density heatmaps around your store.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="group">
                <Link to="/upload" className="flex items-center gap-2">
                  Upload Your Data
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/analytics">View Demo Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground">
              Everything you need to understand and optimize your retail footfall
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative rounded-xl border bg-card p-6 shadow-soft hover:shadow-medium transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mb-4 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6 text-accent group-hover:text-accent-foreground transition-colors" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Upload your data now and unlock powerful insights for your retail business
            </p>
            <Button asChild size="lg">
              <Link to="/upload" className="flex items-center gap-2">
                Get Started Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
