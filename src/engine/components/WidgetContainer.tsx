// src/engine/components/WidgetContainer.tsx
import React from 'react';
import { useAppWidgets } from '@/engine';
import { Widget } from '@/engine/types';

interface WidgetContainerProps {
  widgets: Widget[];
  templateDir?: string;
  title?: string;
  layout?: 'grid' | 'stack';
  className?: string;
}

const getColSpanClass = (colSpan?: string | number) => {
  switch (colSpan) {
    case "full":
    case 3:
      return "col-span-3";
    case 2:
      return "col-span-2";
    default:
      return "col-span-1";
  }
};

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widgets,
  templateDir,
  title,
  layout = 'grid',
  className = ''
}) => {
  const loadedWidgets = useAppWidgets(widgets, templateDir);

  if (!widgets?.length) {
    return (
      <div className={`max-w-7xl mx-auto py-6 px-3 ${className}`}>
        {title && <h1 className="text-3xl font-bold mb-6">{title}</h1>}
        <div className="text-gray-500">No widgets configured</div>
      </div>
    );
  }

  const containerClass = layout === 'grid' 
    ? "grid grid-cols-3 gap-6" 
    : "space-y-6";

  return (
    <div className={`max-w-7xl mx-auto py-6 px-4 ${className}`}>
      {title && <h1 className="text-3xl font-bold mb-6">{title}</h1>}
      <div className={containerClass}>
        {loadedWidgets.map((widget, i) => {
          const { Component, colSpan, attrs, ...props } = widget;
          const itemClass = layout === 'grid' ? getColSpanClass(colSpan) : '';
          
          return (
            <div key={i} className={itemClass}>
              {Component ? (
                <Component {...props} attrs={attrs} />
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <span className="text-red-400">⚠️</span> Widget not found:{" "}
                  {widget.tplFile}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};