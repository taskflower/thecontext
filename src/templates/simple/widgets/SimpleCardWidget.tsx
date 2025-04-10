// src/templates/simple/widgets/SimpleCardWidget.tsx
import React from "react";
import { WidgetProps } from "@/views/types";

const SimpleCardWidget: React.FC<WidgetProps> = ({
  data = [],
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.isArray(data) &&
        data.map((item) => (
          <div
            key={item.id}
            className="border-l-2 border-t border-r border-b border-black group hover:bg-gray-50 transition-colors"
            onClick={() => onSelect && onSelect(item.id)}
            role="button"
            tabIndex={0}
          >
            <div className="p-5 cursor-pointer h-full flex flex-col">
              <h3 className="text-xl font-light uppercase tracking-wide mb-2">
                {item.name}
              </h3>

              {item.description && (
                <p className="text-gray-600 mt-2 mb-3">{item.description}</p>
              )}

              {typeof item.count === "number" && (
                <div className="mt-auto pt-3 border-t border-gray-200 text-sm text-gray-500">
                  {item.count} {item.countLabel || "items"}
                </div>
              )}

              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity text-sm text-blue-600">
                Select &rarr;
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default SimpleCardWidget;
