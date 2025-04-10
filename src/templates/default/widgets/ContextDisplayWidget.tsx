// src/templates/default/widgets/ContextDisplayWidget.tsx
import React from 'react';
import { WidgetProps } from 'template-registry-module';
import { useAppStore } from '@/lib/store';

interface ContextDisplayWidgetProps extends WidgetProps {
  title?: string;
}

interface ContextItem {
  id: string;
  title?: string;
  contentType?: string;
  content: any;
  updatedAt?: any;
}

const ContextDisplayWidget: React.FC<ContextDisplayWidgetProps> = ({ 
  data = [],
  title = "Context Data",
  onSelect
}) => {
  // Użyj kontekstu bezpośrednio z AppStore, jeśli nie otrzymano danych z zewnątrz
  const context = useAppStore(state => state.getContext());
  
  // Jeśli dane są przekazane jako prop, użyj ich
  // W przeciwnym razie, sformatuj kontekst z AppStore
  const contextItems: ContextItem[] = data.length > 0 
    ? data as ContextItem[] 
    : Object.entries(context).map(([key, value]) => ({
        id: key,
        title: key,
        contentType: typeof value === 'object' ? 'application/json' : 'text/plain',
        content: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value),
        updatedAt: null
      }));

  if (contextItems.length === 0) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-gray-500 italic">No context data available yet.</p>
      </div>
    );
  }

  // Funkcja pomocnicza do formatowania JSON dla lepszej czytelności
  const formatJson = (jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return jsonString;
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      
      <div className="space-y-3">
        {contextItems.map((item) => (
          <div 
            key={item.id} 
            className="bg-white p-3 rounded shadow-sm cursor-pointer hover:bg-gray-50"
            onClick={() => onSelect && onSelect(item.id)}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-blue-600">{item.title || item.id}</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {item.contentType || 'text/plain'}
              </span>
            </div>
            
            <div className="text-sm">
              {item.contentType === 'application/json' ? (
                <pre className="bg-gray-50 p-2 rounded overflow-x-auto">
                  {formatJson(item.content)}
                </pre>
              ) : (
                <p className="text-gray-800">{item.content}</p>
              )}
            </div>
            
            {item.updatedAt && (
              <div className="text-xs text-gray-500 mt-1">
                Updated: {new Date(item.updatedAt).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextDisplayWidget;