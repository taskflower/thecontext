// src/templates/default/widgets/InfoWidget.tsx
import React from "react";
import { InfoWidgetProps } from "../types";
import { useAppStore } from "@/useAppStore";


const InfoWidget: React.FC<InfoWidgetProps> = ({
  data = {},
  onSelect
}) => {
  // Używamy scentralizowanego store zamiast osobnych
  const currentWorkspaceId = useAppStore(state => state.data.currentWorkspaceId);
  const contexts = useAppStore(state => state.data.contexts);
  const context = currentWorkspaceId ? contexts[currentWorkspaceId] : null;

  // Pobierz dane z kontekstu jeśli data jest stringiem (np. "header")
  let widgetData = data;
  if (typeof data === 'string' && context) {
    // Znajdź dane w kontekście (np. dla "header" znajdź headerData w kontekście)
    widgetData = context[data] || {};
  }

  // Fallback, gdy widgetData to nadal string lub jest puste
  if (typeof widgetData === 'string' || !widgetData) {
    widgetData = {};
  }

  // Określenie stylów dla wariantów
  const variantStyles = {
    default: "bg-gray-50 border-gray-200 text-gray-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800"
  };

  const variant = widgetData.variant || 'default';
  const bgStyle = variantStyles[variant as keyof typeof variantStyles] || variantStyles.default;

  return (
    <div className={`rounded-lg border p-4 ${bgStyle}`}>
      {widgetData.title && <h3 className="font-medium text-lg mb-2">{widgetData.title}</h3>}
      {widgetData.description && <div className="text-sm">{widgetData.description}</div>}
      
      {widgetData.backLink && widgetData.backText && (
        <button 
          onClick={() => onSelect && onSelect(widgetData.backLink)} 
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
          {widgetData.backText}
        </button>
      )}
    </div>
  );
};

export default InfoWidget;