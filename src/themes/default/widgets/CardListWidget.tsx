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
  // Funkcja do renderowania ikony
  const renderIcon = (icon?: string) => {
    if (!icon) return null;
    
    // Mapa ikon Lucide
    const iconMap: Record<string, React.ReactNode> = {
      'star': <Star className="w-4 h-4 text-amber-500" />,
      'check': <Check className="w-4 h-4 text-green-500" />,
      'info': <Info className="w-4 h-4 text-blue-500" />,
      'warning': <AlertTriangle className="w-4 h-4 text-amber-500" />,
      'error': <X className="w-4 h-4 text-red-500" />,
      'briefcase': <Briefcase className="w-4 h-4 text-indigo-500" />,
      'calculator': <Calculator className="w-4 h-4 text-purple-500" />,
      'chart': <BarChart className="w-4 h-4 text-blue-500" />,
      'money': <DollarSign className="w-4 h-4 text-green-500" />,
      'document': <FileText className="w-4 h-4 text-gray-500" />,
    };
    
    return (
      <div className="flex-shrink-0 mr-2">
        {iconMap[icon] || icon}
      </div>
    );
  };

  // Renderowanie w zależności od layoutu
  if (layout === 'table') {
    return (
      <div className="p-4 h-full overflow-x-auto">
        {title && <h3 className="mt-0 mb-4 text-lg font-medium">{title}</h3>}
        
        {data.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border-b">Nazwa</th>
                <th className="p-2 border-b">Opis</th>
                <th className="p-2 border-b text-right">Wartość</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-2">
                    <div className="flex items-center">
                      {renderIcon(item.icon)}
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="p-2 text-sm text-gray-600">
                    {item.description || '-'}
                  </td>
                  <td className="p-2 text-right font-medium">
                    {item.value !== undefined ? item.value : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-4 text-center text-gray-500 bg-gray-50 rounded">
            {emptyMessage}
          </div>
        )}
      </div>
    );
  }
  
  if (layout === 'list') {
    return (
      <div className="p-4 h-full">
        {title && <h3 className="mt-0 mb-4 text-lg font-medium">{title}</h3>}
        
        {data.length > 0 ? (
          <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
            {data.map(item => (
              <div key={item.id} className="p-3 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {renderIcon(item.icon)}
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-600">{item.description}</div>
                      )}
                    </div>
                  </div>
                  {item.value !== undefined && (
                    <div className="font-medium text-blue-600 ml-2">{item.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-gray-500 bg-gray-50 rounded">
            {emptyMessage}
          </div>
        )}
      </div>
    );
  }
  
  // Default 'grid' layout
  return (
    <div className="p-4 h-full">
      {title && <h3 className="mt-0 mb-4 text-lg font-medium">{title}</h3>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.length > 0 ? (
          data.map(item => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-md overflow-hidden bg-white"
            >
              <div className="p-3">
                <div className="flex items-center mb-2">
                  {renderIcon(item.icon)}
                  <h4 className="m-0 text-base font-medium">{item.name}</h4>
                </div>
                
                {item.description && (
                  <p className="m-0 text-sm text-gray-600 mb-2">{item.description}</p>
                )}
                
                {item.value !== undefined && (
                  <div className="pt-1 border-t border-gray-100 text-right">
                    <span className="text-sm font-medium text-blue-600">{item.value}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-4 text-center text-gray-500 bg-gray-50 rounded">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}