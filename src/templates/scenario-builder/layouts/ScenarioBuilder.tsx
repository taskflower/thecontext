// src/templates/scenario-builder/layouts/scenarioBuilder.tsx
import React, { useState } from "react";
import { X, ChevronLeft, Info } from "lucide-react";
import { LayoutProps } from "@/types";
import { useFlow, useAppStore } from "@/hooks";

const ScenarioBuilderLayout: React.FC<LayoutProps> = ({
  children,
  title,
  stepTitle,
  onBackClick
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const flow = useFlow();
  const { getCurrentScenario, getCurrentWorkspace } = useAppStore();
  
  const currentScenario = getCurrentScenario();
  const currentWorkspace = getCurrentWorkspace();
  const handleCloseClick = onBackClick || flow.navigateToWorkspaces;

  // Pobierz postęp (aktualny krok / całkowita liczba kroków)
  const totalSteps = flow.nodes?.length || 1;
  const currentStepIndex = flow.params?.stepIndex ? parseInt(flow.params.stepIndex) : 0;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-lg mx-auto w-full max-w-5xl h-full md:min-h-[95vh] md:max-h-[95vh]">
      {/* Nagłówek */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCloseClick}
              className="rounded-full p-1 hover:bg-gray-200 transition-colors"
              aria-label="Powrót"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentScenario?.name || title || "Generator Scenariuszy"}
              </h1>
              <p className="text-sm text-gray-500">
                {currentWorkspace?.name || "Tworzenie i zarządzanie scenariuszami"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="rounded-full p-1 hover:bg-gray-200 transition-colors relative"
              aria-label="Informacje"
            >
              <Info className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handleCloseClick}
              className="rounded-full p-1 hover:bg-gray-200 transition-colors"
              aria-label="Zamknij"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Pasek postępu */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Informacja o kroku */}
        {stepTitle && (
          <div className="mt-2 flex justify-between items-center">
            <p className="text-sm font-medium text-gray-700">{stepTitle}</p>
            <p className="text-xs text-gray-500">Krok {currentStepIndex + 1} z {totalSteps}</p>
          </div>
        )}
      </div>

      {/* Panel informacyjny */}
      {showInfo && (
        <div className="border-b border-gray-200 bg-blue-50 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <Info className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Informacje o generatorze scenariuszy</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Generator scenariuszy pozwala na tworzenie, edycję i zarządzanie przepływami pracy w aplikacji.</p>
                <p className="mt-1">Każdy scenariusz składa się z kroków, które mogą być formularzami, analizą AI lub widgetami wyświetlającymi dane.</p>
              </div>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="ml-auto flex-shrink-0 rounded-md p-1 hover:bg-blue-100 transition-colors"
            >
              <X className="h-4 w-4 text-blue-500" />
            </button>
          </div>
        </div>
      )}

      {/* Przewijalna zawartość */}
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
      
      {/* Stopka z informacją o zapisie */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Wszystkie zmiany są automatycznie zapisywane
          </p>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-700">Aktywny</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioBuilderLayout;