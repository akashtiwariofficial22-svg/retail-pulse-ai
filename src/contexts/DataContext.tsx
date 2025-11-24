import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface FootfallData {
  timestamp: string;
  footfall: number;
  latitude?: number;
  longitude?: number;
}

interface DataContextType {
  data: FootfallData[];
  setData: (data: FootfallData[]) => void;
  hasLocationData: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Generate dummy data
const generateDummyData = (): FootfallData[] => {
  const data: FootfallData[] = [];
  const startDate = new Date('2024-01-01T00:00:00');
  const days = 30;
  
  for (let day = 0; day < days; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      currentDate.setHours(hour);
      
      // Simulate realistic footfall patterns
      let baseFootfall = 20;
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Higher footfall on weekends
      if (isWeekend) baseFootfall += 15;
      
      // Peak hours: 11-13 and 17-20
      if ((hour >= 11 && hour <= 13) || (hour >= 17 && hour <= 20)) {
        baseFootfall += 25;
      }
      
      // Low hours: 0-7
      if (hour >= 0 && hour <= 7) {
        baseFootfall -= 10;
      }
      
      // Add some randomness
      const footfall = Math.max(5, Math.floor(baseFootfall + Math.random() * 15 - 7.5));
      
      // Mumbai coordinates with slight variation
      const latitude = 19.0760 + (Math.random() - 0.5) * 0.01;
      const longitude = 72.8777 + (Math.random() - 0.5) * 0.01;
      
      data.push({
        timestamp: currentDate.toISOString(),
        footfall,
        latitude,
        longitude,
      });
    }
  }
  
  return data;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<FootfallData[]>(generateDummyData());

  const hasLocationData = data.length > 0 && 
    data.some(d => d.latitude !== undefined && d.longitude !== undefined);

  return (
    <DataContext.Provider value={{ data, setData, hasLocationData }}>
      {children}
    </DataContext.Provider>
  );
};
