// src/templates/default/widgets/StatsWidget.tsx
import React from "react";
import { StatsWidgetProps, StatItem } from "../types";

const StatsWidget: React.FC<StatsWidgetProps> = ({
  title,
  description,
  stats,
  data = {},
}) => {
  // Dodany log dla debugowania
  console.log("StatsWidget - otrzymane dane:", { title, description, stats, data });

  // Konwersja danych na format statystyk
  const statsData: StatItem[] = stats || Object.entries(data).map(([key, value]) => ({
    label: key,
    value: value as any,
  }));

  // Dodany log po konwersji
  console.log("StatsWidget - dane po konwersji:", statsData);

  // Sprawdzanie czy mamy jakiekolwiek dane do wyświetlenia
  const hasData = statsData && statsData.length > 0;

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
      {title && (
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-medium text-gray-900">{title}</h3>
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
      )}
      
      {!hasData ? (
        // Wyświetl informację, gdy brak danych
        <div className="p-5 text-center text-gray-500">
          <p>Brak danych do wyświetlenia</p>
        </div>
      ) : (
        // Wyświetl statystyki
        <div className="grid gap-6 p-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, index) => (
            <div key={index} className="flex flex-col">
              <div className="flex items-center gap-2">
                {stat.icon && (
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
                    className="text-gray-500"
                  >
                    <path d={stat.icon} />
                  </svg>
                )}
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              </div>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {typeof stat.value === 'number'
                  ? new Intl.NumberFormat().format(stat.value)
                  : stat.value || '—'}
              </p>
              {stat.description && (
                <p className="mt-1 text-xs text-gray-500">{stat.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatsWidget;