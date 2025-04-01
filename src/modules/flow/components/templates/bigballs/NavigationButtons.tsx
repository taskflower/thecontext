// src/modules/flow/components/templates/bigballs/NavigationButtons.tsx
import React from "react";
import { NavigationButtonsProps } from "../../interfaces";

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  isFirstStep,
  isLastStep,
  isProcessing,
  onPrevious,
  onNext,
}) => (
  <div className="p-5">
    <button
      onClick={onNext}
      disabled={isProcessing}
      className="w-full bg-black text-white font-medium py-3 px-6 rounded hover:bg-gray-800 transition-colors"
    >
      {isProcessing
        ? "Przetwarzanie..."
        : isLastStep
        ? "Publikuj"
        : isFirstStep
        ? "Analizuj"
        : "Kontynuuj"}
    </button>

    {!isFirstStep && (
      <div className="mt-3 text-center">
        <button
          onClick={onPrevious}
          disabled={isProcessing}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          Wróć do poprzedniego kroku
        </button>
      </div>
    )}

    {/* Step dots */}
    <div className="flex justify-center mt-8 space-x-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i === (isFirstStep ? 0 : isLastStep ? 4 : 2)
              ? "bg-black"
              : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  </div>
);

export default NavigationButtons;