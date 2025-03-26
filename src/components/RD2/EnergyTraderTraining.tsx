/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { generateSampleData } from "./generateSampleData";
import { fetchAllPSEData, processRawPSEData } from "./utils/dataUtils";
import { analyzeHourData } from "./analyzeHourData";
import AnalysisSettings from "./AnalysisSettings";
import ChartsSection from "./ChartsSection";
import TrainingModule from "./TrainingModule";
import EnergyFactorsDisplay from "./EnergyFactorsDisplay";
import DailyPriceView from "./DailyPriceView";
import ChartDataExtractor from "./dataExtractors/ChartDataExtractor";
import LLMChecklist from "./dataExtractors/LLMChecklist";


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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [userPrediction, setUserPrediction] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] =
    useState<PredictionResult | null>(null);
  const [selectedFactors, setSelectedFactors] = useState({
    windProduction: true,
    solarProduction: true,
    demandForecast: true,
    isWorkday: true,
  });
  const [showDataPoints, setShowDataPoints] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<"sample" | "api">("sample");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDataExtractor, setShowDataExtractor] = useState<boolean>(false);
  const [apiDateRange, setApiDateRange] = useState({
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 14 dni temu
    endDate: new Date().toISOString().split("T")[0], // dzisiaj
  });

  // Wczytaj dane przykładowe przy starcie
  useEffect(() => {
    if (dataSource === "sample") {
      setHistoricalData(generateSampleData());
    }
  }, [dataSource]);

  // Dopasuj wybraną godzinę, jeśli nie jest dostępna w danych
  useEffect(() => {
    if (dataSource === "api" && historicalData.length > 0) {
      const availableHour = historicalData[0].hour;
      if (!historicalData.some((d) => d.hour === selectedHour)) {
        setSelectedHour(availableHour);
      }
    }
  }, [historicalData, dataSource, selectedHour]);

  // Pobierz dane z API z obsługą stronicowania
  const fetchApiData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Zmiana endpointu z 'cor-rozl' na 'crb-rozl' dla danych cenowych
      const apiData = await fetchAllPSEData(
        "crb-rozl",
        apiDateRange.startDate,
        apiDateRange.endDate
      );

      if (!apiData || apiData.length === 0) {
        throw new Error("API nie zwróciło żadnych danych");
      }

      console.log(`Pomyślnie pobrano ${apiData.length} rekordów z API`);

      // Przetwarzanie danych z API, aby miały odpowiedni format do wykresów
      const processedData = processRawPSEData(apiData);

      if (processedData.length === 0) {
        throw new Error("Nie udało się przetworzyć danych z API");
      }

      console.log(`Przetworzono ${processedData.length} rekordów`);

      // Debug - przykładowy przetworzony rekord
      if (processedData.length > 0) {
        console.log("Przykładowy przetworzony rekord:", processedData[0]);
      }

      setHistoricalData(processedData);
      setDataSource("api");
    } catch (err) {
      console.error("Błąd pobierania API:", err);
      setError(
        `${
          err instanceof Error
            ? err.message
            : "Błąd podczas pobierania danych z API"
        }`
      );
      // W przypadku błędu i braku danych, przełącz na dane przykładowe
      if (historicalData.length === 0) {
        resetToSampleData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset do danych przykładowych
  const resetToSampleData = () => {
    setDataSource("sample");
    setHistoricalData(generateSampleData());
    setSelectedDate(null);
    setError(null);
  };

  // Oblicz zakres dat z danych historycznych
  const dataDateRange = useMemo(() => {
    if (!historicalData || historicalData.length === 0) 
      return { startDate: '-', endDate: '-' };
    
    const dates = historicalData.map(d => d.date);
    return {
      startDate: dates.reduce((a, b) => a < b ? a : b),
      endDate: dates.reduce((a, b) => a > b ? a : b)
    };
  }, [historicalData]);

  // Pobierz dostępne daty z danych
  const availableDates = useMemo(() => 
    [...new Set(historicalData.map(d => d.date))].sort(),
    [historicalData]
  );

  // Filtrowanie danych dla wybranej godziny i opcjonalnej daty (do wybranej daty włącznie)
  const hourData = useMemo(() => 
    historicalData.filter(d => 
      d.hour === selectedHour && 
      (selectedDate === null || d.date <= selectedDate)
    ),
    [historicalData, selectedHour, selectedDate]
  );
  
  const hourlyStats = analyzeHourData(hourData);

  // Updated makePrediction function to use real data when available
  const makePrediction = (prediction: string) => {
    setUserPrediction(prediction);
    
    // Check if we have a selected date and it's not the last date
    const selectedDateIndex = availableDates.indexOf(selectedDate || '');
    const isRealDataAvailable = selectedDate && 
      selectedDateIndex >= 0 && 
      selectedDateIndex < availableDates.length - 1;
    
    let predictionScenario;
    
    if (isRealDataAvailable) {
      // Use actual data from the next day
      const nextDate = availableDates[selectedDateIndex + 1];
      const nextDayData = historicalData.filter(d => 
        d.hour === selectedHour && d.date === nextDate
      );
      
      if (nextDayData.length > 0) {
        const realData = nextDayData[0];
        
        predictionScenario = {
          hour: selectedHour,
          windProduction: realData.windProduction,
          solarProduction: realData.solarProduction,
          demandForecast: realData.demandForecast,
          isWorkday: realData.isWorkday,
          rdnPrice: realData.rdnPrice,
          rbPrice: realData.rbPrice,
          priceDiff: realData.priceDiff
        };
        
        const isCorrect =
          (prediction === "higher" && realData.rbPrice > realData.rdnPrice) ||
          (prediction === "lower" && realData.rbPrice <= realData.rdnPrice);
        
        setPredictionResult({
          isCorrect,
          scenario: predictionScenario
        });
        
        return;
      }
    }
    
    // Fallback to random scenario if real data is not available
    // (Keep the existing random generation logic for cases where we don't have real data)
    const windProduction = Math.round(Math.random() * 2500);
    const solarProduction =
      selectedHour >= 8 && selectedHour <= 17
        ? Math.round(
            Math.random() * 2000 * (1 - Math.abs(selectedHour - 12.5) / 10)
          )
        : 0;
    const demandForecast = Math.round(
      18000 +
        (selectedHour >= 8 && selectedHour <= 20 ? 4000 : 0) *
          (0.8 + Math.random() * 0.4)
    );
    const isWorkday = Math.random() > 0.3;

    // Determine if RB price will be higher than RDN
    const rbHigher = Math.random() > 0.5;

    // Calculate final prices
    const rdnPrice = Math.round(
      280 +
        (selectedHour >= 8 && selectedHour <= 20 && isWorkday ? 100 : 0) -
        solarProduction / 20 -
        windProduction / 50
    );
    const rbPrice = rbHigher
      ? Math.round(rdnPrice * (1 + 0.05 + Math.random() * 0.15))
      : Math.round(rdnPrice * (0.85 + Math.random() * 0.1));

    const isCorrect =
      (prediction === "higher" && rbPrice > rdnPrice) ||
      (prediction === "lower" && rbPrice <= rdnPrice);

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
        priceDiff: rbPrice - rdnPrice,
      },
    });
  };

  return (
    <div className="p-4 max-w-full bg-gray-50 min-h-screen">
      <div className="container mx-auto">
        <header className="bg-blue-700 text-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                Narzędzie szkoleniowe dla traderów energii
              </h1>
              <p className="mt-2 text-blue-100">
                Ćwicz przewidywanie różnic cen między Rynkiem Bilansującym (RB) a
                Rynkiem Dnia Następnego (RDN) na polskim rynku energii
              </p>
            </div>
            <button
              onClick={() => setShowDataExtractor(!showDataExtractor)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {showDataExtractor ? "Ukryj ekstraktor danych" : "Pokaż ekstraktor danych"}
            </button>
          </div>
        </header>

        {showDataExtractor && (
          <div className="mb-6">
            <ChartDataExtractor
              historicalData={historicalData}
              selectedHour={selectedHour}
              selectedDate={selectedDate}
              hourlyStats={hourlyStats}
              selectedFactors={selectedFactors}
            />
          </div>
        )}

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-3">
            {" "}
            <AnalysisSettings
              selectedHour={selectedHour}
              setSelectedHour={setSelectedHour}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              availableDates={availableDates}
              dataDateRange={dataDateRange}
              selectedFactors={selectedFactors}
              setSelectedFactors={setSelectedFactors}
              hourlyStats={hourlyStats}
            />
          </div>

          <div className="w-full col-span-9">
            {/* Kontrola źródła danych */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold mb-3">Źródło danych</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      className="form-radio h-5 w-5 text-blue-600"
                      checked={dataSource === "sample"}
                      onChange={() => resetToSampleData()}
                    />
                    <span className="ml-2">Dane przykładowe</span>
                  </label>

                  <label className="inline-flex items-center ml-6 cursor-pointer">
                    <input
                      type="radio"
                      className="form-radio h-5 w-5 text-blue-600"
                      checked={dataSource === "api"}
                      onChange={() => fetchApiData()}
                    />
                    <span className="ml-2">Dane z API</span>
                  </label>
                </div>

                {dataSource === "api" && (
                  <div className="flex gap-2 items-center">
                    <div>
                      <label className="text-sm text-gray-600 block">Od:</label>
                      <input
                        type="date"
                        className="border rounded p-1 text-sm"
                        value={apiDateRange.startDate}
                        onChange={(e) =>
                          setApiDateRange({
                            ...apiDateRange,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block">Do:</label>
                      <input
                        type="date"
                        className="border rounded p-1 text-sm"
                        value={apiDateRange.endDate}
                        onChange={(e) =>
                          setApiDateRange({
                            ...apiDateRange,
                            endDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded mt-4 text-sm"
                      onClick={fetchApiData}
                      disabled={isLoading}
                    >
                      Pobierz
                    </button>
                  </div>
                )}
              </div>

              {isLoading && (
                <div className="mt-3 text-blue-600">Ładowanie danych...</div>
              )}
              {error && (
                <div className="mt-3 text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  {error}
                </div>
              )}
              {dataSource === "api" &&
                !isLoading &&
                !error &&
                historicalData.length > 0 && (
                  <div className="mt-3 text-green-600">
                    Pomyślnie pobrano {historicalData.length} rekordów z API
                  </div>
                )}
            </div>

            {/* Nowy komponent wyświetlający czynniki energetyczne */}
            <EnergyFactorsDisplay
              historicalData={historicalData}
              selectedHour={selectedHour}
              selectedFactors={selectedFactors}
            />

            {selectedDate && hourData.length === 1 && (
              <DailyPriceView
                hourData={hourData[0]}
                selectedHour={selectedHour}
                selectedDate={selectedDate}
              />
            )}
            
            <ChartsSection
              hourData={hourData}
              selectedHour={selectedHour}
              selectedDate={selectedDate}
              historicalData={historicalData}
              showDataPoints={showDataPoints}
              setShowDataPoints={setShowDataPoints}
              hourlyStats={hourlyStats}
            />

<LLMChecklist
  selectedHour={selectedHour}
  selectedFactors={selectedFactors}
  predictionScenario={predictionResult ? predictionResult.scenario : null}
  historicalData={historicalData}
/>

<TrainingModule
  selectedHour={selectedHour}
  selectedDate={selectedDate}
  availableDates={availableDates}
  historicalData={historicalData}
  selectedFactors={selectedFactors}
  userPrediction={userPrediction}
  predictionResult={predictionResult}
  makePrediction={makePrediction}
  setPredictionResult={setPredictionResult}
  setUserPrediction={setUserPrediction}
/>
          </div>
        </div>
        <footer className="text-center text-gray-500 text-sm mt-8 pb-8">
          © {new Date().getFullYear()} Narzędzie szkoleniowe dla traderów
          energii | Polski rynek energii
        </footer>
      </div>
    </div>
  );
};

export default EnergyTraderTraining;