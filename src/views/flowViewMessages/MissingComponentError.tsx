// src/views/MissingComponentError.tsx
import React from "react";
import { useAppNavigation } from "@/hooks";

export const MissingComponentError: React.FC<{ componentId: string, nodeId: string }> = ({ componentId, nodeId }) => {
  const navigation = useAppNavigation();
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-600 text-lg p-4 bg-red-100 rounded-lg">
        <h3 className="font-bold">
          Błąd: Nie znaleziono komponentu flow step
        </h3>
        <p className="mt-2">
          Szukany komponent:{" "}
          <span className="font-mono bg-red-50 px-1">{componentId}</span>
        </p>
        <p className="mt-2">
          ID węzła:{" "}
          <span className="font-mono bg-red-50 px-1">{nodeId}</span>
        </p>
        <p className="mt-2">
          Sprawdź w konsoli przeglądarki listę dostępnych komponentów (F12
          Console)
        </p>
        <button
          onClick={navigation.navigateToScenarios}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Wróć do scenariuszy
        </button>
      </div>
    </div>
  );
};

export default MissingComponentError;