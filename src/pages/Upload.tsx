import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload as UploadIcon, Download, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Papa from 'papaparse';

const Upload = () => {
  const { setData } = useData();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [hasLocation, setHasLocation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const downloadTemplate = () => {
    const template = 'timestamp,footfall,latitude,longitude\n2024-01-01 10:00,35,19.0760,72.8777\n2024-01-01 11:00,42,19.0765,72.8780';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'footfall_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Template downloaded successfully');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        
        // Validate required columns
        if (data.length === 0) {
          toast.error('CSV file is empty');
          setIsProcessing(false);
          return;
        }

        const firstRow = data[0];
        const requiredColumns = ['timestamp', 'footfall'];
        const hasRequired = requiredColumns.every(col => col in firstRow);

        if (!hasRequired) {
          toast.error('CSV must contain timestamp and footfall columns');
          setIsProcessing(false);
          return;
        }

        const hasLoc = 'latitude' in firstRow && 'longitude' in firstRow;
        setHasLocation(hasLoc);

        if (!hasLoc) {
          toast.info('Heatmap features will be disabled due to missing geolocation data');
        }

        setUploadedData(data.slice(0, 20));
        setData(data);
        setIsProcessing(false);
        toast.success(`Successfully uploaded ${data.length} records`);
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`);
        setIsProcessing(false);
      }
    });
  };

  return (
    <div className="container py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Upload Your Data</h1>
        <p className="text-muted-foreground">
          Upload historical footfall data to unlock powerful insights and predictions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="w-5 h-5" />
              Upload CSV File
            </CardTitle>
            <CardDescription>
              Upload your footfall data to get started with analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-accent transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-2 font-medium">
                {isProcessing ? 'Processing...' : 'Click to upload CSV file'}
              </p>
              <p className="text-sm text-muted-foreground">
                or drag and drop your file here
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>CSV Format Requirements</CardTitle>
            <CardDescription>
              Ensure your CSV file follows this format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Required Columns</p>
                  <p className="text-sm text-muted-foreground">timestamp, footfall</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Optional Columns</p>
                  <p className="text-sm text-muted-foreground">latitude, longitude (for heatmaps)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Timestamp Format</p>
                  <p className="text-sm text-muted-foreground">YYYY-MM-DD HH:MM</p>
                </div>
              </div>
            </div>

            {uploadedData.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-accent">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Upload Successful</span>
                  </div>
                  {!hasLocation && (
                    <div className="flex items-center gap-2 text-amber-500">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">No location data</span>
                    </div>
                  )}
                </div>
                <Button onClick={() => navigate('/analytics')} className="w-full">
                  View Analytics Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Table */}
      {uploadedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>First 20 rows of your uploaded data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Timestamp</th>
                    <th className="text-right p-2 font-medium">Footfall</th>
                    {hasLocation && (
                      <>
                        <th className="text-right p-2 font-medium">Latitude</th>
                        <th className="text-right p-2 font-medium">Longitude</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {uploadedData.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{row.timestamp}</td>
                      <td className="text-right p-2">{row.footfall}</td>
                      {hasLocation && (
                        <>
                          <td className="text-right p-2">{row.latitude?.toFixed(4)}</td>
                          <td className="text-right p-2">{row.longitude?.toFixed(4)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Upload;
