/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';

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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Historical price difference chart */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">
          Historical RB-RDN Price Difference for Hour {selectedHour}:00
        </h2>
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
            <ReferenceLine y={0} stroke="#000" />
            <Bar dataKey="priceDiff" name="RB-RDN Difference">
              {hourData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.priceDiff > 0 ? "#ff7300" : "#82ca9d"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
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
        
        {showDataPoints && hourlyStats ? (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="imbalance" name="Imbalance" unit=" MW" />
              <YAxis type="number" dataKey="priceDiff" name="RB-RDN Difference" unit=" PLN/MWh" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <ReferenceLine y={0} stroke="#000" />
              <ReferenceLine x={0} stroke="#000" />
              <Scatter 
                name="RB-RDN vs Imbalance" 
                data={hourlyStats.imbalanceVsPriceDiff || []} 
                fill="#8884d8" 
              />
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p>Statistics visualization would be shown here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartsSection;