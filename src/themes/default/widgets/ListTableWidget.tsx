// src/themes/default/widgets/CardListWidget.tsx
import React from "react";
import {
  Star,
  Check,
  Info,
  AlertTriangle,
  X,
  Briefcase,
  Calculator,
  BarChart,
  DollarSign,
  FileText,
} from "lucide-react";

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

export default function CardTableWidget({
  title,
  data = [],
  emptyMessage = "Brak elementów do wyświetlenia",
}: CardListProps) {
  const renderIcon = (icon?: string) => {
    if (!icon) return null;

    const iconMap: Record<string, React.ReactNode> = {
      star: <Star className="w-4 h-4 text-amber-600" />,
      check: <Check className="w-4 h-4 text-green-600" />,
      info: <Info className="w-4 h-4 text-gray-600" />,
      warning: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      error: <X className="w-4 h-4 text-red-600" />,
      briefcase: <Briefcase className="w-4 h-4 text-indigo-600" />,
      calculator: <Calculator className="w-4 h-4 text-purple-600" />,
      chart: <BarChart className="w-4 h-4 text-gray-600" />,
      money: <DollarSign className="w-4 h-4 text-green-600" />,
      document: <FileText className="w-4 h-4 text-gray-600" />,
    };

    return <div className="flex-shrink-0 mr-2">{iconMap[icon] || icon}</div>;
  };

  return (
    <div className="p-6 h-full overflow-x-auto">
      {title && (
        <h3 className="mt-0 mb-4 text-lg font-medium text-gray-900">{title}</h3>
      )}

      {data.length > 0 ? (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-sm font-medium text-gray-700">Nazwa</th>
              <th className="p-3 text-sm font-medium text-gray-700">Opis</th>
              <th className="p-3 text-sm font-medium text-gray-700 text-right">
                Wartość
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="p-3">
                  <div className="flex items-center">
                    {renderIcon(item.icon)}
                    <span className="font-medium text-gray-700">
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {item.description || "-"}
                </td>
                <td className="p-3 text-right font-medium text-gray-700">
                  {item.value !== undefined ? item.value : "-"}
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
