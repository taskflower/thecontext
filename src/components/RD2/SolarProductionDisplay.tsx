// src/components/RD2/SolarProductionDisplay.tsx
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { solarDataService, SolarProductionData } from './solarDataService';

interface SolarProductionDisplayProps {
  selectedDate: string | null;
  selectedHour: number;
  dataDateRange: {
    startDate: string;
    endDate: string;
  };
}

const SolarProductionDisplay: React.FC<SolarProductionDisplayProps> = ({ 
  selectedDate, 
  selectedHour,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [solarData, setSolarData] = useState<SolarProductionData | null>(null);
  const [dailyData, setDailyData] = useState<SolarProductionData[]>([]);
  
  // Fetch data for selected date and hour
  useEffect(() => {
    const fetchSolarData = async () => {
      if (!selectedDate) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch data for the specific hour
        const data = await solarDataService.getSolarProductionData(
          selectedDate, 
          selectedHour.toString()
        );
        
        setSolarData(data);
        
        // Generate mock data for the entire day
        const mockDailyData: SolarProductionData[] = [];
        
        // Fill in data for hours 6-20 (daylight hours)
        for (let hour = 6; hour <= 20; hour++) {
          const hourData = await solarDataService.getSolarProductionData(
            selectedDate, 
            hour.toString()
          );
          
          if (hourData) {
            mockDailyData.push(hourData);
          }
        }
        
        setDailyData(mockDailyData);
      } catch (err) {
        console.error('Error fetching solar data:', err);
        setError('Nie udało się pobrać danych produkcji PV');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSolarData();
  }, [selectedDate, selectedHour]);
  
  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Produkcja fotowoltaiczna</h2>
        <div className="p-4 text-center text-blue-600">Ładowanie danych...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Produkcja fotowoltaiczna</h2>
        <div className="p-4 text-center text-red-600">
          {error}
        </div>
      </div>
    );
  }
  
  // Format data for the chart
  const chartData = dailyData.map(data => ({
    hour: `${data.hour}:00`,
    production: parseFloat(data.totalProductionMWh.toFixed(1)),
    efficiency: parseFloat(data.efficiencyPercent.toFixed(1))
  }));
  
  console.log("Chart data:", chartData);
  
  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-lg font-semibold mb-3">Produkcja fotowoltaiczna</h2>
      
      {!solarData ? (
        <div className="p-4 text-center text-gray-600">
          {selectedDate 
            ? `Brak danych dla godziny ${selectedHour}:00 w dniu ${selectedDate}` 
            : 'Wybierz datę, aby zobaczyć dane produkcji PV'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-yellow-50 rounded">
              <h4 className="font-medium text-yellow-800">Produkcja PV</h4>
              <p className="text-xl font-bold">{solarData.totalProductionMWh.toFixed(1)} MWh</p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded">
              <h4 className="font-medium text-blue-800">Wydajność</h4>
              <p className="text-xl font-bold">{solarData.efficiencyPercent.toFixed(1)}%</p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded">
              <h4 className="font-medium text-purple-800">Moc zainstalowana</h4>
              <p className="text-xl font-bold">{solarData.installedCapacityMW.toFixed(1)} MW</p>
            </div>
            
            <div className="p-3 bg-green-50 rounded">
              <h4 className="font-medium text-green-800">Usłonecznienie</h4>
              <p className="text-xl font-bold">{solarData.weatherConditions.sunHours} h</p>
            </div>
          </div>
          
          <div className="p-3 mb-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Warunki pogodowe:</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="font-medium">Temperatura:</span> {solarData.weatherConditions.temperature}°C
              </div>
              <div>
                <span className="font-medium">Zachmurzenie:</span> {solarData.weatherConditions.cloudCover}/8
              </div>
              <div>
                <span className="font-medium">Najlepsza farma:</span> {solarData.bestFarm || "brak danych"}
              </div>
            </div>
          </div>
          
          {chartData.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Produkcja fotowoltaiczna w ciągu dnia:</h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis yAxisId="left" orientation="left" label={{ value: 'Produkcja (MWh)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Wydajność (%)', angle: 90, position: 'insideRight' }} domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="production" name="Produkcja (MWh)" fill="#FBBF24" stroke="#F59E0B" />
                    <Area yAxisId="right" type="monotone" dataKey="efficiency" name="Wydajność (%)" fill="#93C5FD" stroke="#3B82F6" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SolarProductionDisplay;