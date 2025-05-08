// src/themes/clean/widgets/ListTableWidget.tsx
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
      'check': <Check className="w-4 h-4 text-emerald-500" />,
      'info': <Info className="w-4 h-4 text-cyan-500" />,
      'warning': <AlertTriangle className="w-4 h-4 text-amber-500" />,
      'error': <X className="w-4 h-4 text-rose-500" />,
      'briefcase': <Briefcase className="w-4 h-4 text-indigo-500" />,
      'calculator': <Calculator className="w-4 h-4 text-purple-500" />,
      'chart': <BarChart className="w-4 h-4 text-slate-600" />,
      'money': <DollarSign className="w-4 h-4 text-emerald-500" />,
      'document': <FileText className="w-4 h-4 text-slate-500" />,
    };
    
    return (
      <div className="flex-shrink-0 mr-2">
        {iconMap[icon] || icon}
      </div>
    );
  };

  return (
    <div className="h-full">
      {title && (
        <div className="p-4 border-b border-sky-100">
          <h3 className="text-base font-medium text-slate-800">{title}</h3>
        </div>
      )}
      
      <div className="p-4">
        {data.length > 0 ? (
          <div className="overflow-x-auto border border-sky-200 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sky-200 bg-sky-50">
                  <th className="p-3 text-xs font-medium text-slate-500">Nazwa</th>
                  <th className="p-3 text-xs font-medium text-slate-500">Opis</th>
                  <th className="p-3 text-xs font-medium text-slate-500 text-right">Wartość</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id} className="border-b border-sky-100 hover:bg-sky-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center">
                        {renderIcon(item.icon)}
                        <span className="font-medium text-slate-700">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-slate-500">
                      {item.description || '-'}
                    </td>
                    <td className="p-3 text-right font-medium text-indigo-600">
                      {item.value !== undefined ? item.value : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 px-4 text-center text-slate-500 bg-sky-50 rounded-lg border border-sky-200">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}