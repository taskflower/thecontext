/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

interface AnalysisSettingsProps {
  selectedHour: number;
  setSelectedHour: (hour: number) => void;
  selectedFactors: {
    windProduction: boolean;
    solarProduction: boolean;
    demandForecast: boolean;
    isWorkday: boolean;
  };
  setSelectedFactors: (factors: any) => void;
  hourlyStats: any;
}

const AnalysisSettings: React.FC<AnalysisSettingsProps> = ({ 
  selectedHour, 
  setSelectedHour, 
  selectedFactors, 
  setSelectedFactors, 
  hourlyStats 
}) => {
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h2 className="text-lg font-semibold mb-2">Analysis Settings</h2>
      <div className="flex items-center mb-2">
        <label className="mr-2">Hour:</label>
        <select 
          className="p-2 border rounded" 
          value={selectedHour}
          onChange={(e) => setSelectedHour(parseInt(e.target.value))}
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>{`${i}:00`}</option>
          ))}
        </select>
        
        {hourlyStats && (
          <span className="ml-4 font-semibold">
            RB &gt; RDN in {hourlyStats.rbHigherPercent}% of cases for hour {selectedHour}:00
          </span>
        )}
      </div>
      
      <div className="flex items-center">
        <label className="mr-2">Show price influencing factors:</label>
        <div className="flex flex-wrap">
          <label className="flex items-center mr-4">
            <input 
              type="checkbox" 
              checked={selectedFactors.windProduction} 
              onChange={() => setSelectedFactors({...selectedFactors, windProduction: !selectedFactors.windProduction})} 
              className="mr-1"
            />
            Wind Production
          </label>
          <label className="flex items-center mr-4">
            <input 
              type="checkbox" 
              checked={selectedFactors.solarProduction} 
              onChange={() => setSelectedFactors({...selectedFactors, solarProduction: !selectedFactors.solarProduction})} 
              className="mr-1"
            />
            Solar Production
          </label>
          <label className="flex items-center mr-4">
            <input 
              type="checkbox" 
              checked={selectedFactors.demandForecast} 
              onChange={() => setSelectedFactors({...selectedFactors, demandForecast: !selectedFactors.demandForecast})} 
              className="mr-1"
            />
            Demand Forecast
          </label>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={selectedFactors.isWorkday} 
              onChange={() => setSelectedFactors({...selectedFactors, isWorkday: !selectedFactors.isWorkday})} 
              className="mr-1"
            />
            Workday
          </label>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSettings;