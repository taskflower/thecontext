// src/components/WidgetRenderer.tsx
import { useComponents, useFlow } from '@/hooks';
import React from 'react';


/**
 * Właściwości dla komponentu WidgetRenderer
 */
interface WidgetRendererProps {
  type: string;
  data?: any;
  onSelect?: (id: string) => void;
  [key: string]: any;
}

/**
 * Komponent renderujący widget na podstawie jego typu
 * 
 * Automatycznie ładuje odpowiedni komponent widget z template
 * i przekazuje do niego dane oraz funkcje obsługi zdarzeń
 */
const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  type,
  data,
  onSelect,
  ...rest
}) => {
  // Formatowanie nazwy widgetu (może być "cardList", "card-list", "CardList" itp.)
  const widgetId = formatWidgetType(type);
  
  // Ładowanie komponentu widgetu
  const { component: WidgetComponent, error, isLoading } = useComponents(
    'widget',
    widgetId
  );
  
  // Jeśli komponent jest w trakcie ładowania
  if (isLoading) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center justify-center">
          <div className="animate-spin h-5 w-5 border-2 border-gray-900 rounded-full border-t-transparent"></div>
          <span className="ml-2 text-sm text-gray-600">Ładowanie widgetu...</span>
        </div>
      </div>
    );
  }
  
  // Jeśli wystąpił błąd ładowania
  if (error || !WidgetComponent) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <h3 className="text-sm font-medium text-red-600">Błąd widgetu: {widgetId}</h3>
        <p className="text-xs text-red-500 mt-1">
          {error || `Nie znaleziono komponentu widgetu: ${widgetId}`}
        </p>
      </div>
    );
  }
  
  // Renderowanie komponentu widgetu z wszystkimi danymi
  return (
    <WidgetComponent
      data={data}
      onSelect={onSelect}
      {...rest}
    />
  );
};

/**
 * Formatuje typ widgetu do standardowej postaci
 * 
 * Obsługuje różne konwencje nazewnictwa:
 * - cardList, CardList -> CardList
 * - card-list -> CardList
 * - DataDisplayWidget -> DataDisplay
 */
function formatWidgetType(type: string): string {
  // Usuń przyrostek "Widget" jeśli istnieje
  let formatted = type.replace(/Widget$/, '');
  
  // Przekształć kebab-case na PascalCase
  if (formatted.includes('-')) {
    formatted = formatted
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  } 
  // Przekształć camelCase na PascalCase
  else if (/^[a-z]/.test(formatted)) {
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
  
  return formatted;
}

export default WidgetRenderer;