// src/tpl/minimal/widgets/DataDisplayWidget.tsx
import React from "react";
import { DataDisplayWidgetProps } from "@/types";

const DataDisplayWidget: React.FC<DataDisplayWidgetProps> = ({
  title,
  description,
  type = 'keyValue',
  data = {},
  onSelect,
}) => {
  // Format values for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '—';
    }
    
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ');
      }
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  // Render content based on type
  const renderContent = () => {
    if (!data || (Array.isArray(data) && data.length === 0) || 
        (typeof data === 'object' && Object.keys(data).length === 0)) {
      return (
        <div className="py-3 px-1 text-sm text-gray-500 italic">
          Brak danych do wyświetlenia
        </div>
      );
    }

    switch (type) {
      case 'list':
        if (!Array.isArray(data)) return (
          <div className="py-3 px-1 text-sm text-gray-500 italic">
            Niepoprawny format danych
          </div>
        );
        
        return (
          <ul className="space-y-2 py-1">
            {data.map((item, idx) => (
              <li 
                key={idx} 
                className="flex items-start py-2 px-1 border-b border-gray-100 last:border-0"
                onClick={() => onSelect && onSelect(idx.toString())}
              >
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-500 flex-shrink-0"></span>
                <span className="text-sm text-gray-700">{
                  typeof item === 'object' ? JSON.stringify(item) : String(item)
                }</span>
              </li>
            ))}
          </ul>
        );
        
      case 'object':
        return (
          <div className="space-y-3 py-1">
            {Object.entries(data).map(([key, value]) => (
              <div 
                key={key} 
                className="flex flex-col py-2 px-1 border-b border-gray-100 last:border-0"
                onClick={() => onSelect && onSelect(key)}
              >
                <span className="text-xs font-medium uppercase text-gray-500 mb-1">{key}</span>
                <span className="text-sm text-gray-900">
                  {formatValue(value)}
                </span>
              </div>
            ))}
          </div>
        );
        
      case 'code':
        const codeStr = typeof data === 'string' 
          ? data 
          : JSON.stringify(data, null, 2);
        
        return (
          <pre className="bg-gray-50 rounded-md p-3 text-xs text-gray-800 overflow-auto">
            <code>{codeStr}</code>
          </pre>
        );
        
      case 'keyValue':
      default:
        return (
          <div className="grid grid-cols-1 gap-1">
            {Object.entries(data).map(([key, value]) => (
              <div 
                key={key} 
                className="flex flex-col sm:flex-row sm:items-center py-3 px-1 border-b border-gray-100 last:border-0"
                onClick={() => onSelect && onSelect(key)}
              >
                <span className="text-sm font-medium text-gray-500 sm:w-1/3">{key}</span>
                <span className="text-sm text-gray-900 sm:w-2/3">
                  {formatValue(value)}
                </span>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
      )}
      <div className="px-4 py-2">
        {renderContent()}
      </div>
    </div>
  );
};

export default DataDisplayWidget;