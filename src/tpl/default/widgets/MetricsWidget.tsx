// src/tpl/minimal/widgets/MetricsWidget.tsx
import React from "react";
import { MetricsWidgetProps, MetricItem } from "../types";

const MetricsWidget: React.FC<MetricsWidgetProps> = ({ 
  title,
  metrics = [],
  data = [],
}) => {
  // If metrics prop is not provided, try to convert data to metrics format
  const displayMetrics: MetricItem[] = metrics && metrics.length > 0 
    ? metrics 
    : Array.isArray(data) 
      ? data.map(item => ({
        label: item.label || item.name || "",
        value: item.value || 0,
        prefix: item.prefix || "",
        suffix: item.suffix || "",
        change: item.change,
      }))
      : Object.entries(data || {}).map(([key, value]) => ({
        label: key,
        value: value as any,
        prefix: "",
        suffix: "",
      }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      {title && (
        <h3 className="text-base font-medium text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayMetrics.map((metric, index) => (
          <div key={index} className="flex flex-col">
            <p className="text-sm font-medium text-gray-500 mb-1">{metric.label}</p>
            <div className="flex items-baseline">
              {metric.prefix && (
                <span className="text-gray-600 mr-1">{metric.prefix}</span>
              )}
              <p className="text-2xl font-semibold text-gray-900">
                {typeof metric.value === 'number' 
                  ? new Intl.NumberFormat().format(metric.value) 
                  : metric.value}
              </p>
              {metric.suffix && (
                <span className="text-gray-600 ml-1">{metric.suffix}</span>
              )}
            </div>
            
            {typeof metric.change === 'number' && (
              <div className={`flex items-center text-xs font-medium ${
                metric.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <span className="mr-1">
                  {metric.change >= 0 
                    ? '↑' 
                    : '↓'}
                </span>
                <span>
                  {Math.abs(metric.change)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsWidget;