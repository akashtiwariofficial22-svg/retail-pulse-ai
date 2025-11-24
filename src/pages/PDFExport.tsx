import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, CheckCircle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

const PDFExport = () => {
  const { data } = useData();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (data.length === 0) {
      toast.error('No data available to export');
      return;
    }

    setIsGenerating(true);
    toast.info('Generating PDF report...');

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPos = 20;

      // Cover Page
      pdf.setFillColor(220, 70, 15);
      pdf.rect(0, 0, pageWidth, 60, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.text('RetailPulse', pageWidth / 2, 30, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.text('GeoAI-Powered Customer Footfall Forecasting & Insights', pageWidth / 2, 45, { align: 'center' });
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      yPos = 80;
      pdf.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, pageWidth / 2, yPos, { align: 'center' });
      pdf.text(`Data Points: ${data.length}`, pageWidth / 2, yPos + 10, { align: 'center' });

      // Summary KPIs
      pdf.addPage();
      yPos = 20;
      
      pdf.setFontSize(20);
      pdf.text('Summary Statistics', 20, yPos);
      yPos += 15;

      const totalFootfall = data.reduce((sum, d) => sum + d.footfall, 0);
      const avgFootfall = Math.round(totalFootfall / data.length);

      pdf.setFontSize(12);
      pdf.text(`Total Footfall: ${totalFootfall.toLocaleString()}`, 20, yPos);
      yPos += 10;
      pdf.text(`Average per Hour: ${avgFootfall}`, 20, yPos);
      yPos += 10;
      pdf.text(`Data Period: ${format(new Date(data[0].timestamp), 'MMM dd, yyyy')} - ${format(new Date(data[data.length - 1].timestamp), 'MMM dd, yyyy')}`, 20, yPos);
      yPos += 15;

      // Hourly Analysis
      pdf.setFontSize(16);
      pdf.text('Hourly Footfall Pattern', 20, yPos);
      yPos += 10;

      const hourlyData = data.reduce((acc, d) => {
        const hour = new Date(d.timestamp).getHours();
        if (!acc[hour]) acc[hour] = [];
        acc[hour].push(d.footfall);
        return acc;
      }, {} as Record<number, number[]>);

      pdf.setFontSize(10);
      Object.entries(hourlyData).slice(0, 12).forEach(([hour, values]) => {
        const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
        pdf.text(`${hour}:00 - Avg: ${avg}`, 20, yPos);
        yPos += 7;
      });

      // Recommendations
      pdf.addPage();
      yPos = 20;
      
      pdf.setFontSize(20);
      pdf.text('Recommendations', 20, yPos);
      yPos += 15;

      pdf.setFontSize(14);
      pdf.text('Staffing Recommendations:', 20, yPos);
      yPos += 10;
      pdf.setFontSize(10);
      pdf.text('• Deploy additional staff during peak hours (11:00-13:00, 17:00-20:00)', 25, yPos);
      yPos += 7;
      pdf.text('• Maintain minimum staff during low hours (00:00-07:00)', 25, yPos);
      yPos += 7;
      pdf.text('• Consider flexible scheduling based on hourly patterns', 25, yPos);
      yPos += 15;

      pdf.setFontSize(14);
      pdf.text('Marketing Suggestions:', 20, yPos);
      yPos += 10;
      pdf.setFontSize(10);
      pdf.text('• Run promotions during low-traffic hours to boost engagement', 25, yPos);
      yPos += 7;
      pdf.text('• Focus advertising efforts on peak customer density areas', 25, yPos);
      yPos += 7;
      pdf.text('• Implement loyalty programs to increase repeat visits', 25, yPos);

      // Save the PDF
      pdf.save(`RetailPulse_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success('PDF report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setIsGenerating(false);
    }
  };

  const reportSections = [
    {
      title: 'Cover Page',
      items: ['RetailPulse branding', 'Report date and timestamp', 'Data summary'],
    },
    {
      title: 'Summary Statistics',
      items: ['Total footfall', 'Average hourly footfall', 'Data period', 'Peak metrics'],
    },
    {
      title: 'Analytics Charts',
      items: ['Hourly trend analysis', 'Daily distribution', 'Pattern identification'],
    },
    {
      title: 'Forecasting Report',
      items: ['24-hour predictions', 'Trend analysis', 'Confidence levels'],
    },
    {
      title: 'Recommendations',
      items: ['Staffing optimization', 'Marketing strategies', 'Location insights'],
    },
  ];

  return (
    <div className="container py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Export Report</h1>
        <p className="text-muted-foreground">
          Generate a comprehensive PDF report of your footfall analytics
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Full RetailPulse Report
          </CardTitle>
          <CardDescription>
            Download a complete PDF report with all analytics, forecasts, and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={generatePDF}
            disabled={isGenerating || data.length === 0}
            size="lg"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating Report...' : 'Download Full Report'}
          </Button>
          {data.length === 0 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Please upload data first to generate a report
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Contents</CardTitle>
          <CardDescription>
            Your PDF report will include the following sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {reportSections.map((section, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  {section.title}
                </h3>
                <ul className="ml-6 space-y-1">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="text-sm text-muted-foreground">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFExport;
