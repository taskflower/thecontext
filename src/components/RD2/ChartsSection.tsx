/* eslint-disable @typescript-eslint/no-explicit-any */
// Fixed version of ChartsSection.tsx
import React, { useMemo } from 'react';
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell, Legend } from 'recharts';

interface ChartsSectionProps {
  hourData: any[];
  selectedHour: number;
  selectedDate: string | null;
  historicalData: any[];
  showDataPoints: boolean;
  setShowDataPoints: (show: boolean) => void;
  hourlyStats: any;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ 
  hourData, 
  selectedHour,
  selectedDate,
  historicalData,
  showDataPoints, 
  setShowDataPoints, 
  hourlyStats 
}) => {
  // Filter data for historical chart (from beginning to selected date)
  const chartData = useMemo(() => {
    if (!selectedDate) {
      // Sort data chronologically when viewing the entire range
      console.log(`Filtrowanie danych dla godziny ${selectedHour} - cały zakres`);
      
      // Filter historical data for the selected hour and sort chronologically
      const filteredData = historicalData.filter(d => 
        d.hour === selectedHour
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      console.log(`Znaleziono ${filteredData.length} rekordów`);
      return filteredData;
    } else {
      console.log(`Filtrowanie danych dla godziny ${selectedHour} do dnia ${selectedDate}`);
      
      // Filter historical data for the selected hour and up to selected date
      const filteredData = historicalData.filter(d => 
        d.hour === selectedHour && 
        d.date <= selectedDate
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      console.log(`Znaleziono ${filteredData.length} rekordów`);
      return filteredData;
    }
  }, [historicalData, selectedHour, selectedDate, hourData]);
   
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Historical price difference chart */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">
          {selectedDate 
            ? `Historyczne różnice RB-RDN dla godziny ${selectedHour}:00 do dnia ${selectedDate}`
            : `Historyczne różnice RB-RDN dla godziny ${selectedHour}:00`}
        </h2>
        
        {chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => {
                  if (name === 'priceDiff') return [`${value} PLN/MWh`, 'Różnica RB-RDN'];
                  return [value, name];
                }}
                labelFormatter={(label: string) => `Data: ${label}`}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#000" />
              <Bar dataKey="priceDiff" name="Różnica RB-RDN" isAnimationActive={false}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.priceDiff > 0 ? "#ff7300" : "#82ca9d"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center bg-gray-50">
            <p className="text-gray-500">Brak danych dla wybranej godziny</p>
          </div>
        )}
      </div>
      
      {/* Factors affecting price difference */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">
          Czynniki wpływające na różnicę cen dla godziny {selectedHour}:00
          {selectedDate ? ` do dnia ${selectedDate}` : ''}
        </h2>
        
        <div className="flex mb-2">
          <button 
            className={`mr-2 py-1 px-3 rounded ${showDataPoints ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setShowDataPoints(true)}
          >
            Korelacje
          </button>
          <button 
            className={`py-1 px-3 rounded ${!showDataPoints ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setShowDataPoints(false)}
          >
            Statystyki
          </button>
        </div>
        
        {showDataPoints && hourlyStats && hourlyStats.imbalanceVsPriceDiff && hourlyStats.imbalanceVsPriceDiff.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="imbalance" 
                name="Niezbilansowanie" 
                unit=" MW" 
                domain={['dataMin', 'dataMax']}
              />
              <YAxis 
                type="number" 
                dataKey="priceDiff" 
                name="Różnica RB-RDN" 
                unit=" PLN/MWh" 
                domain={['dataMin', 'dataMax']}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                formatter={(value: any) => [`${value}`, '']}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#000" />
              <ReferenceLine x={0} stroke="#000" />
              <Scatter 
                name="RB-RDN vs Niezbilansowanie" 
                data={hourlyStats.imbalanceVsPriceDiff} 
                fill="#8884d8" 
                isAnimationActive={false}
              />
            </ScatterChart>
          </ResponsiveContainer>
        ) : !showDataPoints ? (
          <div className="h-64 flex items-center justify-center bg-gray-50">
            <p className="text-gray-500">Wizualizacja statystyk będzie tutaj wyświetlona</p>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center bg-gray-50">
            <p className="text-gray-500">Brak danych korelacji dla wybranej godziny</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartsSection;