import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "./contexts/DataContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Analytics from "./pages/Analytics";
import GeoInsights from "./pages/GeoInsights";
import Forecasting from "./pages/Forecasting";
import Recommendations from "./pages/Recommendations";
import PDFExport from "./pages/PDFExport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="upload" element={<Upload />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="geo-insights" element={<GeoInsights />} />
              <Route path="forecasting" element={<Forecasting />} />
              <Route path="recommendations" element={<Recommendations />} />
              <Route path="pdf-export" element={<PDFExport />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
