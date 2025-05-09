// src/themes/default/widgets/ListTableWidget.tsx

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
      star: <Star className="w-4 h-4 text-amber-500" />,
      check: <Check className="w-4 h-4 text-green-500" />,
      info: <Info className="w-4 h-4 text-blue-500" />,
      warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
      error: <X className="w-4 h-4 text-red-500" />,
      briefcase: <Briefcase className="w-4 h-4 text-indigo-500" />,
      calculator: <Calculator className="w-4 h-4 text-purple-500" />,
      chart: <BarChart className="w-4 h-4 text-gray-500" />,
      money: <DollarSign className="w-4 h-4 text-green-500" />,
      document: <FileText className="w-4 h-4 text-gray-500" />,
    };

    return <div className="flex-shrink-0 mr-2">{iconMap[icon] || icon}</div>;
  };

  return (
    <div className="h-full">
      {title && <div className="p-4 border-b border-gray-100">
        <h3 className="m-0 text-sm font-medium text-gray-900">{title}</h3>
      </div>}

      {data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="p-3 text-xs font-medium text-gray-500">Nazwa</th>
                <th className="p-3 text-xs font-medium text-gray-500">Opis</th>
                <th className="p-3 text-xs font-medium text-gray-500 text-right">
                  Wartość
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="p-3">
                    <div className="flex items-center">
                      {renderIcon(item.icon)}
                      <span className="text-sm text-gray-700">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-gray-500">
                    {item.description || "-"}
                  </td>
                  <td className="p-3 text-right text-sm font-medium text-gray-600">
                    {item.value !== undefined ? item.value : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4">
          <div className="py-4 text-center text-gray-500 bg-gray-50 rounded border border-gray-200 text-xs">
            {emptyMessage}
          </div>
        </div>
      )}
    </div>
  );
}