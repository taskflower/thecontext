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

export default function ListTableWidget({ 
  title, 
  data = [], 
  emptyMessage = 'Brak elementów do wyświetlenia',
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