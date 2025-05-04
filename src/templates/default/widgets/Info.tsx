// src/templates/default/widgets/Info.tsx
import React from "react";
import { InfoWidgetProps } from "../types";

const InfoWidget: React.FC<InfoWidgetProps> = ({
  data = {},
  title,
  variant: propVariant,
  onSelect
}) => {
  // Usprawnione przetwarzanie danych
  let widgetData = data;
  let displayTitle = title;
  let displayDescription = "";
  let displayVariant = propVariant || "default";
  
  // Obsługa różnych formatów danych
  if (typeof data === 'string') {
    // Jeśli przekazano prosty string, użyj go jako opis
    displayDescription = data;
  } else if (data && typeof data === 'object') {
    // Jeśli to obiekt, użyj jego pól
    displayTitle = data.title || title;
    displayDescription = data.description || "";
    displayVariant = data.variant || propVariant || "default";
  }

  // Określenie stylów dla wariantów
  const variantStyles = {
    default: "bg-gray-50 border-gray-200 text-gray-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800"
  };

  const bgStyle = variantStyles[displayVariant as keyof typeof variantStyles] || variantStyles.default;

  return (
    <div className={`rounded-lg border p-4 ${bgStyle}`}>
      {displayTitle && <h3 className="font-medium text-lg mb-2">{displayTitle}</h3>}
      {displayDescription && <div className="text-sm">{displayDescription}</div>}
      
      {data && data.backLink && data.backText && (
        <button 
          onClick={() => onSelect && onSelect(data.backLink)} 
          className="mt-4 text-sm flex items-center hover:underline"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="mr-1"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {data.backText}
        </button>
      )}
    </div>
  );
};

export default InfoWidget;