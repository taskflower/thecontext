/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell, Legend } from 'recharts';

interface ChartsSectionProps {
  hourData: any[];
  selectedHour: number;
  showDataPoints: boolean;
  setShowDataPoints: (show: boolean) => void;
  hourlyStats: any;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ 
  hourData, 
  selectedHour, 
  showDataPoints, 
  setShowDataPoints, 
  hourlyStats 
}) => {
  const [, setHasData] = useState(false);
  
  // Check if chart data is valid
  useEffect(() => {
    const validBarData = hourData && hourData.length > 0;
    const validScatterData = hourlyStats && 
                            hourlyStats.imbalanceVsPriceDiff && 
                            hourlyStats.imbalanceVsPriceDiff.length > 0;
    
    setHasData(validBarData && validScatterData);
    
    // Debug logging
    console.log(`Bar chart data: ${hourData?.length || 0} items`);
    console.log(`Scatter data: ${hourlyStats?.imbalanceVsPriceDiff?.length || 0} items`);
    
    if (validBarData) {
      console.log('Sample bar data item:', hourData[0]);
    }
    
    if (validScatterData) {
      console.log('Sample scatter data item:', hourlyStats.imbalanceVsPriceDiff[0]);
    }
  }, [hourData, hourlyStats]);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Historical price difference chart */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">
          Historical RB-RDN Price Difference for Hour {selectedHour}:00
        </h2>
        
        {hourData && hourData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={hourData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => {
                  if (name === 'priceDiff') return [`${value} PLN/MWh`, 'RB-RDN Difference'];
                  return [value, name];
                }}
                labelFormatter={(label: string) => `Date: ${label}`}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#000" />
              <Bar dataKey="priceDiff" name="RB-RDN Difference" isAnimationActive={false}>
                {hourData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.priceDiff > 0 ? "#ff7300" : "#82ca9d"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center bg-gray-50">
            <p className="text-gray-500">No data available for the selected hour</p>
          </div>
        )}
      </div>
      
      {/* Factors affecting price difference */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">
          Factors Affecting Price Difference for Hour {selectedHour}:00
        </h2>
        
        <div className="flex mb-2">
          <button 
            className={`mr-2 py-1 px-3 rounded ${showDataPoints ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setShowDataPoints(true)}
          >
            Correlations
          </button>
          <button 
            className={`py-1 px-3 rounded ${!showDataPoints ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setShowDataPoints(false)}
          >
            Statistics
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
                name="Imbalance" 
                unit=" MW" 
                domain={['dataMin', 'dataMax']}
              />
              <YAxis 
                type="number" 
                dataKey="priceDiff" 
                name="RB-RDN Difference" 
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
                name="RB-RDN vs Imbalance" 
                data={hourlyStats.imbalanceVsPriceDiff} 
                fill="#8884d8" 
                isAnimationActive={false}
              />
            </ScatterChart>
          </ResponsiveContainer>
        ) : !showDataPoints ? (
          <div className="h-64 flex items-center justify-center bg-gray-50">
            <p className="text-gray-500">Statistics visualization would be shown here</p>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center bg-gray-50">
            <p className="text-gray-500">No correlation data available for the selected hour</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartsSection;