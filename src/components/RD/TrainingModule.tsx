import React from 'react';

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

interface TrainingModuleProps {
  selectedHour: number;
  selectedFactors: {
    windProduction: boolean;
    solarProduction: boolean;
    demandForecast: boolean;
    isWorkday: boolean;
  };
  userPrediction: string | null;
  predictionResult: PredictionResult | null;
  makePrediction: (prediction: string) => void;
  setPredictionResult: (result: PredictionResult | null) => void;
  setUserPrediction: (prediction: string | null) => void;
}

const TrainingModule: React.FC<TrainingModuleProps> = ({
  selectedHour,
  selectedFactors,
  userPrediction,
  predictionResult,
  makePrediction,
  setPredictionResult,
  setUserPrediction
}) => {
  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-lg font-semibold mb-2">Training Module - Price Prediction</h2>
      
      <div className="mb-4">
        <h3 className="font-medium">Scenario for hour {selectedHour}:00 tomorrow:</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
          {selectedFactors.windProduction && (
            <div className="p-3 bg-blue-50 rounded">
              <h4 className="font-medium text-blue-800">Wind Production Forecast</h4>
              <p className="text-xl font-bold">{predictionResult ? predictionResult.scenario.windProduction : "???"} MW</p>
            </div>
          )}
          
          {selectedFactors.solarProduction && (
            <div className="p-3 bg-yellow-50 rounded">
              <h4 className="font-medium text-yellow-800">Solar Production Forecast</h4>
              <p className="text-xl font-bold">{predictionResult ? predictionResult.scenario.solarProduction : "???"} MW</p>
            </div>
          )}
          
          {selectedFactors.demandForecast && (
            <div className="p-3 bg-purple-50 rounded">
              <h4 className="font-medium text-purple-800">Demand Forecast</h4>
              <p className="text-xl font-bold">{predictionResult ? predictionResult.scenario.demandForecast : "???"} MW</p>
            </div>
          )}
          
          {selectedFactors.isWorkday && (
            <div className="p-3 bg-gray-50 rounded">
              <h4 className="font-medium text-gray-800">Day Type</h4>
              <p className="text-xl font-bold">{predictionResult ? (predictionResult.scenario.isWorkday ? "Workday" : "Weekend") : "???"}</p>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <p className="font-medium">RDN Price: {predictionResult ? `${predictionResult.scenario.rdnPrice} PLN/MWh` : "???"}</p>
          
          <p className="mt-4">You predict that the RB price will be:</p>
          <div className="mt-2">
            <button 
              className={`mr-4 py-2 px-4 rounded ${userPrediction === 'higher' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
              onClick={() => makePrediction('higher')}
              disabled={predictionResult !== null}
            >
              Higher than RDN
            </button>
            <button 
              className={`py-2 px-4 rounded ${userPrediction === 'lower' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
              onClick={() => makePrediction('lower')}
              disabled={predictionResult !== null}
            >
              Lower than RDN
            </button>
          </div>
        </div>
        
        {predictionResult && (
          <div className="mt-4 p-4 rounded bg-gray-50">
            <h3 className="font-semibold">Result:</h3>
            <p className="mt-2">
              RB Price: <span className="font-bold">{predictionResult.scenario.rbPrice} PLN/MWh</span>
            </p>
            <p className="mt-1">
              RB-RDN Difference: <span className={`font-bold ${predictionResult.scenario.priceDiff > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {predictionResult.scenario.priceDiff} PLN/MWh
              </span>
            </p>
            <p className="mt-4">
              Your prediction was: 
              <span className={`font-bold ml-2 ${predictionResult.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {predictionResult.isCorrect ? 'CORRECT' : 'INCORRECT'}
              </span>
            </p>
            
            <button 
              className="mt-4 py-2 px-4 bg-blue-500 text-white rounded"
              onClick={() => {
                setUserPrediction(null);
                setPredictionResult(null);
              }}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingModule;