// src/templates/simple/widgets/SimpleContextWidget.tsx
import React from 'react';
import { WidgetProps } from '@/views/types';
import { useContextStore } from '@/lib/contextStore';

const SimpleContextWidget: React.FC<WidgetProps> = () => {
  const context = useContextStore(state => state.context);
  const userProfile = context.userProfile || {};
  
  // Improved rendering function with architectural style
  const renderObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') return null;
    
    return Object.entries(obj).map(([key, value]) => {
      if (value !== null && typeof value === 'object') {
        return (
          <div key={key} className="mt-6">
            <h4 className="font-medium uppercase text-xs tracking-widest text-gray-900 border-b border-gray-200 pb-2">{key}</h4>
            <div className="pl-4 mt-2">
              {renderObject(value)}
            </div>
          </div>
        );
      }
      
      return (
        <div key={key} className="py-3 flex border-b border-gray-100">
          <span className="text-gray-500 w-1/3 uppercase text-xs tracking-widest font-medium">{key}</span>
          <span className="text-gray-900 w-2/3 font-light">
            {value ? String(value) : '—'}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="border-t-2 border-black pt-8">
      <h2 className="text-xl uppercase tracking-wide font-light mb-6 flex items-center">
        <span className="w-8 h-px bg-black mr-4"></span>
        Kontekst Aplikacji
      </h2>
      
      <div className="bg-white rounded p-1">
        {Object.keys(userProfile).length > 0 ? (
          renderObject(userProfile)
        ) : (
          <p className="text-gray-400 italic font-light">Kontekst jest pusty</p>
        )}
      </div>
      
      <div className="mt-6 text-xs uppercase tracking-widest text-gray-400">
        Współdzielony kontekst
      </div>
    </div>
  );
};

export default SimpleContextWidget;