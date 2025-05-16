// src/editor/components/EditorHeader.tsx
import React from "react";
import { Save, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EditorHeaderProps {
  title: string;
  configId: string;
  isDirty: boolean;
  onSave: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  title,
  configId,
  isDirty,
  onSave
}) => {
  const navigate = useNavigate();
  
  const goToHomepage = () => {
    navigate(`/${configId}`);
  };
  
  const goBack = () => {
    if (isDirty) {
      const confirmed = confirm("Masz niezapisane zmiany. Czy na pewno chcesz opuścić edytor?");
      if (!confirmed) return;
    }
    
    navigate(-1);
  };
  
  return (
    <header className="bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        <button
          onClick={goBack}
          className="mr-3 text-gray-500 hover:text-gray-700"
          title="Wróć"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <button
          onClick={goToHomepage}
          className="mr-4 text-gray-500 hover:text-gray-700"
          title="Strona główna"
        >
          <Home className="h-5 w-5" />
        </button>
        
        <h1 className="text-lg font-medium text-gray-800">
          {title}
          {isDirty && <span className="text-sm text-red-500 ml-2">(niezapisane zmiany)</span>}
        </h1>
      </div>
      
      <div>
        <button
          onClick={onSave}
          disabled={!isDirty}
          className={`px-4 py-1.5 rounded-md flex items-center ${
            isDirty 
              ? "bg-blue-600 text-white hover:bg-blue-700" 
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Save className="h-4 w-4 mr-1.5" />
          Zapisz
        </button>
      </div>
    </header>
  );
};