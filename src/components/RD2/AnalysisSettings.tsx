/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

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
  hourlyStats,
}) => {
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h2 className="text-lg font-semibold mb-3">Ustawienia analizy</h2>

      {/* Timeline for hour selection */}
      <div className="mb-4">
        <div className=" items-center mb-2">
          <label className="mr-2 font-medium">Godzina:</label>
          <div>
          {hourlyStats && (
            <span className="ml-auto text-sm font-medium">
              RB &gt; RDN w {hourlyStats.rbHigherPercent}% przypadków dla
              godziny {selectedHour}:00
            </span>
          )}
          </div>
         
        </div>

        {/* Simplified timeline with direct button elements */}
        <div className="  bg-gray-100 rounded-lg overflow-hidden text-xs">
          {Array.from({ length: 24 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedHour(i)}
              className={`w-full p-2 items-center justify-center border-r border-gray-300 last:border-r-0 
                ${
                  selectedHour === i
                    ? "bg-blue-500 text-white"
                    : "hover:bg-blue-100 text-gray-700"
                }`}
            >
              {i}:00
            </button>
          ))}
        </div>
      </div>

      {/* Factors selection */}
      <div>
        <label className="block font-medium mb-2">
          Pokaż czynniki wpływające na cenę:
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={`p-2 text-sm rounded-lg border flex flex-col items-center transition-colors
              ${
                selectedFactors.windProduction
                  ? "bg-blue-500 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            onClick={() =>
              setSelectedFactors({
                ...selectedFactors,
                windProduction: !selectedFactors.windProduction,
              })
            }
          >
            <svg
              className="w-5 h-5 mb-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
            </svg>
            Produkcja wiatru
          </button>

          <button
            type="button"
            className={`p-2 text-sm rounded-lg border flex flex-col items-center transition-colors
              ${
                selectedFactors.solarProduction
                  ? "bg-blue-500 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            onClick={() =>
              setSelectedFactors({
                ...selectedFactors,
                solarProduction: !selectedFactors.solarProduction,
              })
            }
          >
            <svg
              className="w-5 h-5 mb-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            Produkcja słoneczna
          </button>

          <button
            type="button"
            className={`p-2 text-sm rounded-lg border flex flex-col items-center transition-colors
              ${
                selectedFactors.demandForecast
                  ? "bg-blue-500 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            onClick={() =>
              setSelectedFactors({
                ...selectedFactors,
                demandForecast: !selectedFactors.demandForecast,
              })
            }
          >
            <svg
              className="w-5 h-5 mb-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            Prognoza zapotrzebowania
          </button>

          <button
            type="button"
            className={`p-2 text-sm rounded-lg border flex flex-col items-center transition-colors
              ${
                selectedFactors.isWorkday
                  ? "bg-blue-500 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            onClick={() =>
              setSelectedFactors({
                ...selectedFactors,
                isWorkday: !selectedFactors.isWorkday,
              })
            }
          >
            <svg
              className="w-5 h-5 mb-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Dzień roboczy
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSettings;
