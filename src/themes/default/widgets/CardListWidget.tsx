// src/themes/default/widgets/CardListWidget.tsx
import React from 'react';
import { 
  Star, Check, Info, AlertTriangle, X, 
  Briefcase, Calculator, BarChart, 
  DollarSign, FileText
} from 'lucide-react';

type CardItem = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  value?: number | string;
};

type CardListProps = {
  title?: string;
  data?: CardItem[];
  emptyMessage?: string;
  layout?: 'grid' | 'list' | 'table';
};

export default function CardListWidget({ 
  title, 
  data = [], 
  emptyMessage = 'Brak elementów do wyświetlenia',
  layout = 'grid'
}: CardListProps) {
  const renderIcon = (icon?: string) => {
    if (!icon) return null;
    
    const iconMap: Record<string, React.ReactNode> = {
      'star': <Star className="w-4 h-4 text-amber-600" />,
      'check': <Check className="w-4 h-4 text-green-600" />,
      'info': <Info className="w-4 h-4 text-gray-600" />,
      'warning': <AlertTriangle className="w-4 h-4 text-amber-600" />,
      'error': <X className="w-4 h-4 text-red-600" />,
      'briefcase': <Briefcase className="w-4 h-4 text-indigo-600" />,
      'calculator': <Calculator className="w-4 h-4 text-purple-600" />,
      'chart': <BarChart className="w-4 h-4 text-gray-600" />,
      'money': <DollarSign className="w-4 h-4 text-green-600" />,
      'document': <FileText className="w-4 h-4 text-gray-600" />,
    };
    
    return (
      <div className="flex-shrink-0 mr-2">
        {iconMap[icon] || icon}
      </div>
    );
  };

  if (layout === 'table') {
    return (
      <div className="p-6 h-full overflow-x-auto">
        {title && <h3 className="mt-0 mb-4 text-lg font-medium text-gray-900">{title}</h3>}
        
        {data.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3 text-sm font-medium text-gray-700">Nazwa</th>
                <th className="p-3 text-sm font-medium text-gray-700">Opis</th>
                <th className="p-3 text-sm font-medium text-gray-700 text-right">Wartość</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center">
                      {renderIcon(item.icon)}
                      <span className="font-medium text-gray-700">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {item.description || '-'}
                  </td>
                  <td className="p-3 text-right font-medium text-gray-700">
                    {item.value !== undefined ? item.value : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-6 text-center text-gray-500 bg-gray-50 rounded-md border border-gray-200">
            {emptyMessage}
          </div>
        )}
      </div>
    );
  }
  
  if (layout === 'list') {
    return (
      <div className="p-6 h-full">
        {title && <h3 className="mt-0 mb-4 text-lg font-medium text-gray-900">{title}</h3>}
        
        {data.length > 0 ? (
          <div className="border border-gray-200 rounded-md divide-y divide-gray-200 shadow-sm">
            {data.map(item => (
              <div key={item.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {renderIcon(item.icon)}
                    <div>
                      <div className="font-medium text-gray-700">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                      )}
                    </div>
                  </div>
                  {item.value !== undefined && (
                    <div className="font-medium text-gray-700 ml-2">{item.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500 bg-gray-50 rounded-md border border-gray-200">
            {emptyMessage}
          </div>
        )}
      </div>
    );
  }
  
  // Default 'grid' layout
  return (
    <div className="p-6 h-full">
      {title && <h3 className="mt-0 mb-4 text-lg font-medium text-gray-900">{title}</h3>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.length > 0 ? (
          data.map(item => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm hover:shadow transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-center mb-2">
                  {renderIcon(item.icon)}
                  <h4 className="m-0 text-base font-medium text-gray-800">{item.name}</h4>
                </div>
                
                {item.description && (
                  <p className="m-0 text-sm text-gray-600 mb-3">{item.description}</p>
                )}
                
                {item.value !== undefined && (
                  <div className="pt-2 border-t border-gray-100 text-right">
                    <span className="text-sm font-medium text-gray-700">{item.value}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-6 text-center text-gray-500 bg-gray-50 rounded-md border border-gray-200">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}