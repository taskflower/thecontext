// src/views/MissingWorkspaceError.tsx
import React from "react";
import { useAppNavigation } from "@/hooks";

export const MissingWorkspaceError: React.FC = () => {
  const navigation = useAppNavigation();
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-600 text-lg">
        Brak danych workspace lub scenariusza.
        <button
          onClick={navigation.navigateToHome}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Wróć do listy aplikacji
        </button>
      </div>
    </div>
  );
};

export default MissingWorkspaceError;