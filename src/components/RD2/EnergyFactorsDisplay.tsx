/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label } from 'recharts';

interface EnergyFactorsDisplayProps {
  historicalData: any[];
  selectedHour: number;
  selectedFactors: {
    windProduction: boolean;
    solarProduction: boolean;
    demandForecast: boolean;
    isWorkday: boolean;
  };
}

const EnergyFactorsDisplay: React.FC<EnergyFactorsDisplayProps> = ({
  historicalData,
  selectedHour,
  selectedFactors
}) => {
  // Filter data for the selected hour
  const hourData = historicalData.filter(d => d.hour === selectedHour);
  
  // Sort by date for proper time series display
  const sortedData = [...hourData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Create a more readable date format for display
  const formattedData = sortedData.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
  }));

  // Calculate averages for context
  const calculateAverage = (data: any[], key: string) => {
    if (!data.length) return 0;
    return Math.round(data.reduce((sum, item) => sum + item[key], 0) / data.length);
  };

  const avgWind = calculateAverage(hourData, 'windProduction');
  const avgSolar = calculateAverage(hourData, 'solarProduction');
  const avgDemand = calculateAverage(hourData, 'demandForecast');
  const workdayPercentage = hourData.length ? 
    Math.round((hourData.filter(d => d.isWorkday).length / hourData.length) * 100) : 0;

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-lg font-semibold mb-3">Czynniki wpływające na ceny dla godziny {selectedHour}:00</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {selectedFactors.windProduction && (
          <div className="p-3 bg-blue-50 rounded">
            <h4 className="font-medium text-blue-800">Średnia produkcja wiatrowa</h4>
            <p className="text-xl font-bold">{avgWind} MW</p>
          </div>
        )}
        
        {selectedFactors.solarProduction && (
          <div className="p-3 bg-yellow-50 rounded">
            <h4 className="font-medium text-yellow-800">Średnia produkcja słoneczna</h4>
            <p className="text-xl font-bold">{avgSolar} MW</p>
          </div>
        )}
        
        {selectedFactors.demandForecast && (
          <div className="p-3 bg-purple-50 rounded">
            <h4 className="font-medium text-purple-800">Średnie zapotrzebowanie</h4>
            <p className="text-xl font-bold">{avgDemand} MW</p>
          </div>
        )}
        
        {selectedFactors.isWorkday && (
          <div className="p-3 bg-gray-50 rounded">
            <h4 className="font-medium text-gray-800">Dni robocze</h4>
            <p className="text-xl font-bold">{workdayPercentage}%</p>
          </div>
        )}
      </div>
      
      {/* Factors timeline chart */}
      {formattedData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate">
              <Label value="Data" offset={-5} position="insideBottom" />
            </XAxis>
            <YAxis yAxisId="left" orientation="left">
              <Label value="Produkcja (MW)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
            </YAxis>
            <YAxis yAxisId="right" orientation="right">
              <Label value="Zapotrzebowanie (MW)" angle={90} position="insideRight" style={{ textAnchor: 'middle' }} />
            </YAxis>
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'windProduction') return [`${value} MW`, 'Produkcja wiatrowa'];
                if (name === 'solarProduction') return [`${value} MW`, 'Produkcja słoneczna'];
                if (name === 'demandForecast') return [`${value} MW`, 'Zapotrzebowanie'];
                return [value, name];
              }}
            />
            <Legend />
            
            {selectedFactors.windProduction && (
              <Line 
                type="monotone" 
                dataKey="windProduction" 
                name="Produkcja wiatrowa"
                stroke="#3b82f6" 
                yAxisId="left"
                activeDot={{ r: 5 }}
              />
            )}
            
            {selectedFactors.solarProduction && (
              <Line 
                type="monotone" 
                dataKey="solarProduction" 
                name="Produkcja słoneczna"
                stroke="#eab308" 
                yAxisId="left"
                activeDot={{ r: 5 }}
              />
            )}
            
            {selectedFactors.demandForecast && (
              <Line 
                type="monotone" 
                dataKey="demandForecast" 
                name="Zapotrzebowanie"
                stroke="#8b5cf6" 
                yAxisId="right"
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
      
      {/* Correlation analysis */}
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="font-medium text-gray-800 mb-1">Analiza korelacji z różnicą cen RB-RDN:</h3>
        <ul className="list-disc pl-5">
          <li>Produkcja wiatrowa: <span className="font-medium">Średnia do wysoka korelacja ujemna</span> - Wyższa generacja wiatrowa często skutkuje niższymi cenami RB</li>
          <li>Produkcja słoneczna: <span className="font-medium">Średnia korelacja ujemna</span> - Wysokie nasłonecznienie może obniżać ceny na RB</li>
          <li>Zapotrzebowanie: <span className="font-medium">Średnia korelacja dodatnia</span> - Wyższe zapotrzebowanie zwiększa prawdopodobieństwo wysokich cen RB</li>
          <li>Dzień roboczy: <span className="font-medium">Słaba korelacja dodatnia</span> - W dni robocze częściej występują wyższe ceny RB</li>
        </ul>
      </div>
    </div>
  );
};

export default EnergyFactorsDisplay;