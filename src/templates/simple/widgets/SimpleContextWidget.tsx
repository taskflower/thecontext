// src/templates/simple/widgets/SimpleContextWidget.tsx
import React from 'react';
import { WidgetProps } from 'template-registry-module';

const SimpleContextWidget: React.FC<WidgetProps> = ({ 
  data = {}
}) => {
  // Zakładamy, że data to pojedynczy obiekt kontekstu (userProfile)
  const contextData = data as Record<string, any>;
  
  // Funkcja pomocnicza do formatowania wartości
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };
  
  // Funkcja rekurencyjna do renderowania zagnieżdżonych obiektów
  const renderNestedObject = (obj: Record<string, any>, prefix = '') => {
    return Object.entries(obj).map(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (value !== null && typeof value === 'object') {
        return (
          <div key={fullKey} className="mt-2">
            <div className="font-medium text-gray-700">{key}:</div>
            <div className="pl-4">
              {renderNestedObject(value, fullKey)}
            </div>
          </div>
        );
      }
      
      return (
        <div key={fullKey} className="py-1 flex">
          <span className="text-gray-600 w-1/3">{key}:</span>
          <span className="text-gray-900 w-2/3">{formatValue(value)}</span>
        </div>
      );
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-3 border-b pb-2">Aktualny Kontekst</h2>
      
      {Object.keys(contextData).length === 0 ? (
        <p className="text-gray-500 italic">Brak danych kontekstowych.</p>
      ) : (
        <div className="space-y-2">
          {Object.entries(contextData).map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-3 rounded">
              <h3 className="font-medium text-blue-700 mb-2">{key}</h3>
              {typeof value === 'object' && value !== null ? (
                <div className="text-sm">
                  {renderNestedObject(value)}
                </div>
              ) : (
                <div className="text-sm">{formatValue(value)}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleContextWidget;