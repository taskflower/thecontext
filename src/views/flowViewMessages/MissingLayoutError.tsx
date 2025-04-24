// src/views/MissingLayoutError.tsx
import React from "react";
import { useAppNavigation } from "@/hooks";

export const MissingLayoutError: React.FC<{ layoutName: string }> = ({ layoutName }) => {
  const navigation = useAppNavigation();
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-600 text-lg p-4 bg-red-100 rounded-lg">
        <h3 className="font-bold">
          Błąd: Nie znaleziono komponentu layoutu
        </h3>
        <p className="mt-2">
          Szukany layout:{" "}
          <span className="font-mono bg-red-50 px-1">
            {layoutName}
          </span>
        </p>
        <button
          onClick={navigation.navigateToHome}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Wróć do listy aplikacji
        </button>
      </div>
    </div>
  );
};

export default MissingLayoutError;