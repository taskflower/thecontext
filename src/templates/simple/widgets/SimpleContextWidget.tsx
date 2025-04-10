// src/templates/simple/widgets/SimpleContextWidget.tsx
import React from 'react';
import { WidgetProps } from '@/views/types'; // Zmieniamy import na lokalny
import { useContextStore } from '@/lib/contextStore';

const SimpleContextWidget: React.FC<WidgetProps> = () => {
  // Pobieramy kontekst bezpośrednio z Zustand
  const context = useContextStore(state => state.context);
  const userProfile = context.userProfile || {};
  
  // Funkcja do renderowania obiektu
  const renderObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') return null;
    
    return Object.entries(obj).map(([key, value]) => {
      if (value !== null && typeof value === 'object') {
        return (
          <div key={key} className="mt-2">
            <h4 className="font-medium text-gray-700">{key}:</h4>
            <div className="pl-4">
              {renderObject(value)}
            </div>
          </div>
        );
      }
      
      return (
        <div key={key} className="py-1 flex">
          <span className="text-gray-600 w-1/3">{key}:</span>
          <span className="text-gray-900 w-2/3">
            {value ? String(value) : '-'}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <h2 className="text-lg font-bold mb-3">Kontekst Aplikacji</h2>
      
      <div className="bg-gray-50 p-4 rounded">
        {Object.keys(userProfile).length > 0 ? (
          renderObject(userProfile)
        ) : (
          <p className="text-gray-500 italic">Kontekst jest pusty</p>
        )}
      </div>
      
      <div className="mt-3 text-sm text-gray-500">
        Ten kontekst jest współdzielony między scenariuszami
      </div>
    </div>
  );
};

export default SimpleContextWidget;