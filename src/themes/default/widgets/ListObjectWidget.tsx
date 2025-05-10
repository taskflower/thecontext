// src/themes/default/widgets/ListObjectWidget.tsx
import React, { useMemo } from 'react';
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

// Komponenty pomocnicze - memoizowane dla lepszej wydajności
const EmptyState = React.memo(({ emptyMessage }: { emptyMessage: string }) => (
  <div className="p-4">
    <div className="py-4 text-center text-gray-500 bg-gray-50 rounded border border-gray-200 text-xs">
      {emptyMessage}
    </div>
  </div>
));

const WidgetHeader = React.memo(({ title }: { title?: string }) => {
  if (!title) return null;
  return (
    <div className="p-4 border-b border-gray-100">
      <h3 className="mt-0 mb-0 text-sm font-semibold text-gray-900">{title}</h3>
    </div>
  );
});

// Wykrywanie ikon - wyodrębnione do funkcji aby uniknąć powtarzania
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
    'chart': <BarChart className="w-4 h-4 text-gray-500" />,
    'money': <DollarSign className="w-4 h-4 text-green-500" />,
    'document': <FileText className="w-4 h-4 text-gray-500" />,
  };
  
  return (
    <div className="flex-shrink-0 mr-2">
      {iconMap[icon] || icon}
    </div>
  );
};

// Konwersja danych wyodrębniona do osobnej funkcji
const convertDataToItems = (data: DataType) => {
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
};

// Memoizowany główny komponent
const ListObjectWidget = React.memo(({ 
  title, 
  data, 
  emptyMessage = 'Brak elementów do wyświetlenia',
  layout = 'list' // Zmiana domyślnego układu na listę dla większej spójności
}: ListObjectWidgetProps) => {
  
  // Sprawdzenie czy dane istnieją
  if (!data) {
    return (
      <div className="p-4 h-full">
        {title && <h3 className="mt-0 mb-3 text-sm font-semibold text-gray-900">{title}</h3>}
        <EmptyState emptyMessage={emptyMessage} />
      </div>
    );
  }
  
  // useMemo dla konwersji danych - unikamy przeliczania przy każdym renderze
  const items = useMemo(() => convertDataToItems(data), [data]);

  // Widok listy (domyślny)
  if (layout === 'list') {
    return (
      <div className="h-full">
        <WidgetHeader title={title} />
        
        {items.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {items.map(item => (
              <div key={item.id} className="p-3 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {renderIcon(item.icon)}
                    <div className="text-sm text-gray-700">{item.name}</div>
                  </div>
                  {item.value !== undefined && item.value !== '' && (
                    <div className="text-sm font-semibold text-gray-600 ml-2">{item.value}</div>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-gray-500 mt-1 ml-6">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState emptyMessage={emptyMessage} />
        )}
      </div>
    );
  }

  // Widok tabeli
  if (layout === 'table') {
    return (
      <div className="h-full">
        <WidgetHeader title={title} />
        
        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="p-3 text-xs font-semibold text-gray-500">Nazwa</th>
                  <th className="p-3 text-xs font-semibold text-gray-500 text-right">Wartość</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center">
                        {renderIcon(item.icon)}
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right text-sm font-semibold text-gray-600">
                      {item.value !== undefined && item.value !== '' ? item.value : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState emptyMessage={emptyMessage} />
        )}
      </div>
    );
  }
  
  // Widok 'grid'
  return (
    <div className="h-full">
      <WidgetHeader title={title} />
      
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.length > 0 ? (
            items.map(item => (
              <div
                key={item.id}
                className="border border-gray-100 rounded overflow-hidden bg-white shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
              >
                <div className="p-3">
                  <div className="flex items-center mb-1">
                    {renderIcon(item.icon)}
                    <h4 className="m-0 text-sm font-semibold text-gray-800">{item.name}</h4>
                  </div>
                  
                  {item.description && item.description !== '' && (
                    <p className="m-0 text-xs text-gray-500 mb-2">{item.description}</p>
                  )}
                  
                  {item.value !== undefined && item.value !== '' && (
                    <div className="pt-2 border-t border-gray-50 text-right">
                      <span className="text-xs font-semibold text-gray-600">{item.value}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-4 text-center text-gray-500 bg-gray-50 rounded border border-gray-200 text-xs">
              {emptyMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ListObjectWidget;