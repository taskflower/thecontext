// src/themes/clean/widgets/CardListWidget.tsx
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
      'star': <Star className="w-4 h-4 text-amber-500" />,
      'check': <Check className="w-4 h-4 text-green-500" />,
      'info': <Info className="w-4 h-4 text-blue-500" />,
      'warning': <AlertTriangle className="w-4 h-4 text-amber-500" />,
      'error': <X className="w-4 h-4 text-red-500" />,
      'briefcase': <Briefcase className="w-4 h-4 text-indigo-500" />,
      'calculator': <Calculator className="w-4 h-4 text-purple-500" />,
      'chart': <BarChart className="w-4 h-4 text-zinc-700" />,
      'money': <DollarSign className="w-4 h-4 text-green-500" />,
      'document': <FileText className="w-4 h-4 text-zinc-500" />,
    };
    
    return (
      <div className="flex-shrink-0 mr-2">
        {iconMap[icon] || icon}
      </div>
    );
  };

  if (layout === 'table') {
    return (
      <div className="h-full overflow-x-auto">
        {title && <h3 className="text-xl font-semibold mb-4 text-slate-800">{title}</h3>}
        
        {data.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-sm font-medium text-zinc-500">Nazwa</th>
                <th className="p-3 text-sm font-medium text-zinc-500">Opis</th>
                <th className="p-3 text-sm font-medium text-zinc-500 text-right">Wartość</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id} className="border-b hover:bg-zinc-50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center">
                      {renderIcon(item.icon)}
                      <span className="font-medium text-slate-800">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-zinc-500">
                    {item.description || '-'}
                  </td>
                  <td className="p-3 text-right font-medium text-zinc-900">
                    {item.value !== undefined ? item.value : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-6 text-zinc-500">
            {emptyMessage}
          </div>
        )}
      </div>
    );
  }
  
  if (layout === 'list') {
    return (
      <div className="p-6 h-full">
        {title && <h3 className="text-lg font-medium text-zinc-900 mb-4">{title}</h3>}
        
        {data.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            {data.map((item, index) => (
              <div key={item.id} className={`p-4 hover:bg-zinc-50 transition-colors ${index !== data.length - 1 ? 'border-b' : ''}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {renderIcon(item.icon)}
                    <div>
                      <div className="font-medium text-zinc-900">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-zinc-500 mt-1">{item.description}</div>
                      )}
                    </div>
                  </div>
                  {item.value !== undefined && (
                    <div className="font-medium text-zinc-900 ml-2">{item.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-zinc-500">
            {emptyMessage}
          </div>
        )}
      </div>
    );
  }
  
  // Default 'grid' layout
  return (
    <div className="p-6 h-full">
      {title && <h3 className="text-lg font-medium text-zinc-900 mb-4">{title}</h3>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.length > 0 ? (
          data.map(item => (
            <div
              key={item.id}
              className="rounded-md border p-4 hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center mb-2">
                {renderIcon(item.icon)}
                <h4 className="text-base font-medium text-zinc-900">{item.name}</h4>
              </div>
              
              {item.description && (
                <p className="text-sm text-zinc-500 mb-3">{item.description}</p>
              )}
              
              {item.value !== undefined && (
                <div className="pt-2 text-right">
                  <span className="text-sm font-medium text-zinc-900">{item.value}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-6 text-center text-zinc-500">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}