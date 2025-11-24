import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, BarChart3, Map, TrendingUp, Lightbulb, FileText, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Activity },
    { path: '/upload', label: 'Upload Data', icon: Upload },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/geo-insights', label: 'Geo-Insights', icon: Map },
    { path: '/forecasting', label: 'Forecasting', icon: TrendingUp },
    { path: '/recommendations', label: 'Recommendations', icon: Lightbulb },
    { path: '/pdf-export', label: 'Export Report', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Activity className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              RetailPulse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.slice(1).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container flex h-14 items-center justify-center px-4 text-sm text-muted-foreground">
          RetailPulse © 2024 - GeoAI-Powered Customer Footfall Forecasting
        </div>
      </footer>
    </div>
  );
};

export default Layout;
