// src/templates/simple/widgets/SimpleContextWidget.tsx
import React from 'react';
import { WidgetProps } from 'template-registry-module';

import { contextManager } from '@/lib/contextSingleton';
import { ContextManager } from 'raw_modules/context-manager-module/src/core/ContextManager';

const SimpleContextWidget: React.FC<WidgetProps> = ({
  data
}) => {
  const currentContext = contextManager.getContext();
  // Pobierz schemat kontekstu
  const schemaManager = (contextManager as ContextManager).schemaManager;
  const schema = schemaManager ? schemaManager.getSchema('userProfileSchema') : null;

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
    <div className="bg-white p-4 rounded-lg border border-gray-200" style={{ minHeight: '200px' }}>
      <h2 className="text-lg font-semibold mb-3 border-b pb-2">Aktualny Kontekst</h2>

      {/* Wyświetl aktualny kontekst */}
      <div className="mb-4">
        <h3 className="font-medium text-blue-700 mb-2">Wartości kontekstu:</h3>
        {currentContext && currentContext.userProfile ? (
          <div className="bg-gray-50 p-3 rounded">
            {renderNestedObject(currentContext.userProfile)}
          </div>
        ) : (
          <p className="text-gray-500 italic">Kontekst jest pusty.</p>
        )}
      </div>

      {/* Wyświetl schemat kontekstu (opcjonalnie) */}
      {schema && (
        <div className="mt-4">
          <h3 className="font-medium text-blue-700 mb-2">Schemat kontekstu:</h3>
          <div className="bg-gray-50 p-3 rounded text-sm">
            {schema.schema && schema.schema.userProfile && schema.schema.userProfile.properties && (
              <ul className="list-disc list-inside">
                {Object.entries(schema.schema.userProfile.properties).map(([key, prop]: [string, any]) => (
                  <li key={key} className="mb-1">
                    <span className="font-semibold">{key}</span>: {prop.type}
                    {prop.description && <span className="text-gray-500 ml-1">({prop.description})</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleContextWidget;