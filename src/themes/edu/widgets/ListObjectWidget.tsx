// src/themes/clean/widgets/ListObjectWidget.tsx
import React from 'react';
import { 
  Star, Check, Info, AlertTriangle, X, 
  Briefcase, Calculator, BarChart, 
  DollarSign, FileText
} from 'lucide-react';

// Typ dla przekazanych danych - może być obiekt lub tablica
type DataType = Record<string, any> | any[];

type ListObjectWidgetProps = {
  title?: string;
  data?: DataType;
  emptyMessage?: string;
  layout?: 'grid' | 'list' | 'table';
};

export default function ListObjectWidget({ 
  title, 
  data, 
  emptyMessage = 'Brak elementów do wyświetlenia',
  layout = 'list'
}: ListObjectWidgetProps) {
  
  // Sprawdzenie czy dane istnieją
  if (!data) {
    return (
      <div className="h-full">
        {title && <div className="p-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        </div>}
        <div className="p-4">
          <div className="py-6 text-center text-slate-500 bg-slate-50 rounded-md border border-slate-200 text-sm">
            {emptyMessage}
          </div>
        </div>
      </div>
    );
  }
  
  // Konwersja danych do tablicy elementów do wyświetlenia
  const items = React.useMemo(() => {
    if (Array.isArray(data)) {
      return data.map((item, index) => {
        if (typeof item === 'object' && item !== null) {
          return {
            id: item.id || `item-${index}`,
            name: item.name || `Element ${index + 1}`,
            description: item.description || '',
            icon: item.icon || '',
            value: item.value || ''
          };
        } else {
          return {
            id: `item-${index}`,
            name: String(item),
            description: '',
            icon: '',
            value: ''
          };
        }
      });
    } else if (typeof data === 'object') {
      return Object.entries(data).map(([key, value], index) => {
        const valueStr = typeof value === 'object' && value !== null
          ? JSON.stringify(value)
          : String(value);
          
        return {
          id: `item-${index}`,
          name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          description: '',
          icon: '',
          value: valueStr
        };
      });
    }
    return [];
  }, [data]);

  const renderIcon = (icon?: string) => {
    if (!icon) return null;
    
    const iconMap: Record<string, React.ReactNode> = {
      'star': <Star className="w-4 h-4 text-amber-500" />,
      'check': <Check className="w-4 h-4 text-green-500" />,
      'info': <Info className="w-4 h-4 text-blue-500" />,
      'warning': <AlertTriangle className="w-4 h-4 text-amber-500" />,
      'error': <X className="w-4 h-4 text-red-500" />,
      'briefcase': <Briefcase className="w-4 h-4 text-indigo-500" />,
      'calculator': <Calculator className="w-4 h-4 text-purple-500" />,
      'chart': <BarChart className="w-4 h-4 text-slate-600" />,
      'money': <DollarSign className="w-4 h-4 text-green-500" />,
      'document': <FileText className="w-4 h-4 text-slate-500" />,
    };
    
    return (
      <div className="flex-shrink-0 mr-2">
        {iconMap[icon] || icon}
      </div>
    );
  };

  // Widok listy (domyślny)
  if (layout === 'list') {
    return (
      <div className="h-full">
        {title && <div className="p-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        </div>}
        
        {items.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {items.map(item => (
              <div key={item.id} className="p-3 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {renderIcon(item.icon)}
                    <div className="text-sm text-slate-700">{item.name}</div>
                  </div>
                  {item.value !== undefined && item.value !== '' && (
                    <div className="text-sm font-semibold text-slate-600 ml-2">{item.value}</div>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-slate-500 mt-1 ml-6">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4">
            <div className="py-4 text-center text-slate-500 bg-slate-50 rounded-md border border-slate-200 text-sm">
              {emptyMessage}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Widok tabeli
  if (layout === 'table') {
    return (
      <div className="h-full">
        {title && <div className="p-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        </div>}
        
        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="p-3 text-xs font-semibold text-slate-500">Nazwa</th>
                  <th className="p-3 text-xs font-semibold text-slate-500 text-right">Wartość</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center">
                        {renderIcon(item.icon)}
                        <span className="text-sm text-slate-700">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right text-sm font-semibold text-slate-600">
                      {item.value !== undefined && item.value !== '' ? item.value : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4">
            <div className="py-4 text-center text-slate-500 bg-slate-50 rounded-md border border-slate-200 text-sm">
              {emptyMessage}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Widok 'grid'
  return (
    <div className="h-full">
      {title && <div className="p-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      </div>}
      
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length > 0 ? (
            items.map(item => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm hover:shadow transition-all"
              >
                <div className="p-3">
                  <div className="flex items-center mb-1">
                    {renderIcon(item.icon)}
                    <h4 className="text-sm font-semibold text-slate-800">{item.name}</h4>
                  </div>
                  
                  {item.description && item.description !== '' && (
                    <p className="text-xs text-slate-500 mb-2">{item.description}</p>
                  )}
                  
                  {item.value !== undefined && item.value !== '' && (
                    <div className="pt-2 border-t border-slate-100 text-right">
                      <span className="text-xs font-semibold text-slate-600">{item.value}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-4 text-center text-slate-500 bg-slate-50 rounded-md border border-slate-200 text-sm">
              {emptyMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}