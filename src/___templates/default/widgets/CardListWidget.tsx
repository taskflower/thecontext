// src/templates/widgets/IconCardListWidget.tsx
import React from "react";
import { WidgetProps } from "@/views/types";
import { SubjectIcon } from "@/components/SubjectIcon";

interface CardItem {
  id: string;
  name: string;
  description?: string;
  count?: number;
  countLabel?: string;
  icon?: string;
}

const CardListWidget: React.FC<WidgetProps> = ({ data = [], onSelect }) => {
  console.log(data);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data.map((item: CardItem) => (
        <div
          key={item.id}
          onClick={() => onSelect && onSelect(item.id)}
          className="bg-white border border-gray-200 p-4 rounded shadow cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="space-y-4 gap-3 mb-2">
            <div className="w-24 h-24 flex items-center justify-center rounded-md bg-gray-50 text-gray-600">
              <SubjectIcon iconName={item.icon} size={24} />
            </div>
            <h2 className="font-semibold">{item.name}</h2>
          </div>

          {item.description && (
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
          )}

          {item.count !== undefined && (
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                {item.count} {item.countLabel || "items"}
              </p>
              <div className="text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CardListWidget;
