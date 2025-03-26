/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';

import AnalysisSettings from './AnalysisSettings';
import ChartsSection from './ChartsSection';
import { analyzeHourData } from './analyzeHourData';
import { generateSampleData } from './generateSampleData';
import TrainingModule from './TrainingModule';


interface PredictionResult {
  isCorrect: boolean;
  scenario: {
    hour: number;
    windProduction: number;
    solarProduction: number;
    demandForecast: number;
    isWorkday: boolean;
    rdnPrice: number;
    rbPrice: number;
    priceDiff: number;
  };
}

const EnergyTraderTraining: React.FC = () => {
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [selectedHour, setSelectedHour] = useState<number>(12);
  const [userPrediction, setUserPrediction] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [selectedFactors, setSelectedFactors] = useState({
    windProduction: false,
    solarProduction: false,
    demandForecast: false,
    isWorkday: false
  });
  const [showDataPoints, setShowDataPoints] = useState<boolean>(true);

  // Load data on initial render
  useEffect(() => {
    setHistoricalData(generateSampleData());
  }, []);

  // Filter data for selected hour
  const hourData = historicalData.filter(d => d.hour === selectedHour);
  const hourlyStats = analyzeHourData(hourData);

  // Make prediction function for training
  const makePrediction = (prediction: string) => {
    setUserPrediction(prediction);
    
    // Create a random scenario
    const windProduction = Math.round(Math.random() * 2500);
    const solarProduction = selectedHour >= 8 && selectedHour <= 17 ? 
                          Math.round(Math.random() * 2000 * (1 - Math.abs(selectedHour - 12.5) / 10)) : 0;
    const demandForecast = Math.round(18000 + (selectedHour >= 8 && selectedHour <= 20 ? 4000 : 0) * (0.8 + Math.random() * 0.4));
    const isWorkday = Math.random() > 0.3;
    
    // Randomly determine if RB will be higher than RDN
    const rbHigher = Math.random() > 0.5;
    
    // Calculate if user was correct
    const isCorrect = (prediction === 'higher' && rbHigher) || (prediction === 'lower' && !rbHigher);
    
    // Final prices
    const rdnPrice = Math.round(280 + (selectedHour >= 8 && selectedHour <= 20 && isWorkday ? 100 : 0) - (solarProduction / 20) - (windProduction / 50));
    const rbPrice = rbHigher ? 
                  Math.round(rdnPrice * (1 + 0.05 + Math.random() * 0.15)) : 
                  Math.round(rdnPrice * (0.85 + Math.random() * 0.1));
    
    setPredictionResult({
      isCorrect,
      scenario: {
        hour: selectedHour,
        windProduction,
        solarProduction,
        demandForecast,
        isWorkday,
        rdnPrice,
        rbPrice,
        priceDiff: rbPrice - rdnPrice
      }
    });
  };

  return (
    <div className="p-4 max-w-full">
      <h1 className="text-2xl font-bold mb-2">Energy Market Trader Training Tool</h1>
      <p className="mb-4">Train yourself to predict price differences between Balancing Market (RB) and Day-Ahead Market (RDN)</p>
      
      <AnalysisSettings 
        selectedHour={selectedHour}
        setSelectedHour={setSelectedHour}
        selectedFactors={selectedFactors}
        setSelectedFactors={setSelectedFactors}
        hourlyStats={hourlyStats}
      />
      
      <ChartsSection 
        hourData={hourData}
        selectedHour={selectedHour}
        showDataPoints={showDataPoints}
        setShowDataPoints={setShowDataPoints}
        hourlyStats={hourlyStats}
      />
      
      <TrainingModule 
        selectedHour={selectedHour}
        selectedFactors={selectedFactors}
        userPrediction={userPrediction}
        predictionResult={predictionResult}
        makePrediction={makePrediction}
        setPredictionResult={setPredictionResult}
        setUserPrediction={setUserPrediction}
      />
    </div>
  );
};

export default EnergyTraderTraining;