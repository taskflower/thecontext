import React from 'react';
import { Star, Check, Info, AlertTriangle, X, Briefcase, Calculator, BarChart, DollarSign, FileText } from 'lucide-react';

type CardItem = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
};

type CardListProps = {
  title?: string;
  data?: CardItem[];
  emptyMessage?: string;
};

export default function CardListWidget({ 
  title, 
  data = [], 
  emptyMessage = 'Brak elementów do wyświetlenia' 
}: CardListProps) {
  // Funkcja do renderowania ikony
  const renderIcon = (icon?: string) => {
    if (!icon) return null;
    
    // Mapa ikon Lucide
    const iconMap: Record<string, React.ReactNode> = {
      'star': <Star className="w-5 h-5 text-amber-500" />,
      'check': <Check className="w-5 h-5 text-green-500" />,
      'info': <Info className="w-5 h-5 text-blue-500" />,
      'warning': <AlertTriangle className="w-5 h-5 text-amber-500" />,
      'error': <X className="w-5 h-5 text-red-500" />,
      'briefcase': <Briefcase className="w-5 h-5 text-indigo-500" />,
      'calculator': <Calculator className="w-5 h-5 text-purple-500" />,
      'chart': <BarChart className="w-5 h-5 text-blue-500" />,
      'money': <DollarSign className="w-5 h-5 text-green-500" />,
      'document': <FileText className="w-5 h-5 text-gray-500" />,
    };
    
    return (
      <div className="mr-2">
        {iconMap[icon] || icon}
      </div>
    );
  };

  return (
    <div className="p-4">
      {title && <h3 className="mt-0 mb-4 text-lg font-medium">{title}</h3>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.length > 0 ? (
          data.map(item => (
            <div 
              key={item.id} 
              className="bg-white border border-gray-200 rounded-md p-4 shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md"
            >
              <div className="flex items-center mb-2">
                {renderIcon(item.icon)}
                <h4 className="m-0 text-base font-medium">{item.name}</h4>
              </div>
              
              {item.description && (
                <p className="m-0 text-sm text-gray-600">{item.description}</p>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-gray-500 bg-gray-50 rounded-md">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}