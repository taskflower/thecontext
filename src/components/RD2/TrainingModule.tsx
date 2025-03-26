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
  selectedDate: string | null;
  availableDates: string[];
  historicalData: any[];
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
  selectedDate,
  availableDates,
  historicalData,
  selectedFactors,
  userPrediction,
  predictionResult,
  makePrediction,
  setPredictionResult,
  setUserPrediction
}) => {
  // Check if selectedDate is the last day in the data range
  const isLastDate = selectedDate && availableDates.length > 0 && 
    selectedDate === availableDates[availableDates.length - 1];
  
  // Get next day data when possible
  const getNextDayData = () => {
    if (!selectedDate || !predictionResult) return null;
    
    const selectedDateIndex = availableDates.indexOf(selectedDate);
    if (selectedDateIndex < 0 || selectedDateIndex === availableDates.length - 1) return null;
    
    const nextDate = availableDates[selectedDateIndex + 1];
    const nextDayData = historicalData.filter(d => 
      d.hour === selectedHour && d.date === nextDate
    );
    
    return nextDayData.length > 0 ? nextDayData[0] : null;
  };
  
  const nextDayData = getNextDayData();

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-lg font-semibold mb-2">Moduł szkoleniowy - Prognoza cen</h2>
      
      {isLastDate ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-medium text-yellow-800">Uwaga:</h3>
          <p className="mt-2">
            Wybrany dzień jest ostatnim dniem w zakresie danych. Nie możemy przeprowadzić
            treningu predykcji, ponieważ brakuje danych z następnego dnia do weryfikacji.
          </p>
          <p className="mt-2">
            Wybierz wcześniejszy dzień, aby skorzystać z modułu predykcji.
          </p>
        </div>
      ) : (
        <div className="mb-4">
          <h3 className="font-medium">Scenariusz na godzinę {selectedHour}:00 
            {selectedDate ? ` dnia ${availableDates[availableDates.indexOf(selectedDate) + 1] || 'jutro'}` : ' jutro'}:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
            {selectedFactors.windProduction && (
              <div className="p-3 bg-blue-50 rounded">
                <h4 className="font-medium text-blue-800">Produkcja energii wiatrowej</h4>
                <p className="text-xl font-bold">{predictionResult ? predictionResult.scenario.windProduction : "???"} MW</p>
              </div>
            )}
            
            {selectedFactors.solarProduction && (
              <div className="p-3 bg-yellow-50 rounded">
                <h4 className="font-medium text-yellow-800">Produkcja energii słonecznej</h4>
                <p className="text-xl font-bold">{predictionResult ? predictionResult.scenario.solarProduction : "???"} MW</p>
              </div>
            )}
            
            {selectedFactors.demandForecast && (
              <div className="p-3 bg-purple-50 rounded">
                <h4 className="font-medium text-purple-800">Zapotrzebowanie</h4>
                <p className="text-xl font-bold">{predictionResult ? predictionResult.scenario.demandForecast : "???"} MW</p>
              </div>
            )}
            
            {selectedFactors.isWorkday && (
              <div className="p-3 bg-gray-50 rounded">
                <h4 className="font-medium text-gray-800">Typ dnia</h4>
                <p className="text-xl font-bold">
                  {predictionResult ? (predictionResult.scenario.isWorkday ? "Dzień roboczy" : "Weekend") : "???"}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <p className="font-medium">Cena RDN: {predictionResult ? `${predictionResult.scenario.rdnPrice} PLN/MWh` : "???"}</p>
            
            <p className="mt-4">Przewidujesz, że cena RB będzie:</p>
            <div className="mt-2">
              <button 
                className={`mr-4 py-2 px-4 rounded ${userPrediction === 'higher' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
                onClick={() => makePrediction('higher')}
                disabled={predictionResult !== null}
              >
                Wyższa niż RDN
              </button>
              <button 
                className={`py-2 px-4 rounded ${userPrediction === 'lower' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                onClick={() => makePrediction('lower')}
                disabled={predictionResult !== null}
              >
                Niższa niż RDN
              </button>
            </div>
          </div>
          
          {predictionResult && (
            <div className="mt-4 p-4 rounded bg-gray-50">
              <h3 className="font-semibold">Wynik:</h3>
              {nextDayData ? (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800">Faktyczne dane z dnia {nextDayData.date}:</p>
                </div>
              ) : null}
              <p className="mt-2">
                Cena RB: <span className="font-bold">{predictionResult.scenario.rbPrice} PLN/MWh</span>
              </p>
              <p className="mt-1">
                Różnica RB-RDN: <span className={`font-bold ${predictionResult.scenario.priceDiff > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {predictionResult.scenario.priceDiff} PLN/MWh
                </span>
              </p>
              <p className="mt-4">
                Twoja prognoza była: 
                <span className={`font-bold ml-2 ${predictionResult.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {predictionResult.isCorrect ? 'POPRAWNA' : 'NIEPOPRAWNA'}
                </span>
              </p>
              
              <button 
                className="mt-4 py-2 px-4 bg-blue-500 text-white rounded"
                onClick={() => {
                  setUserPrediction(null);
                  setPredictionResult(null);
                }}
              >
                Spróbuj ponownie
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrainingModule;