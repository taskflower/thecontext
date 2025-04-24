// src/views/MissingNodeError.tsx
import React from "react";
import { useAppNavigation } from "@/hooks";

export const MissingNodeError: React.FC = () => {
  const navigation = useAppNavigation();
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-600 text-lg">
        Błąd: Nie znaleziono node dla aktualnego flow.
        <button
          onClick={navigation.navigateToScenarios}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Wróć do scenariuszy
        </button>
      </div>
    </div>
  );
};

export default MissingNodeError;