/* eslint-disable @typescript-eslint/no-explicit-any */
// src/templates/widgets/CardListWidget.tsx
import { WidgetProps } from '@/views/types';
import React from 'react';


const CardListWidget: React.FC<WidgetProps> = ({ 
  data = [], 
  onSelect
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data.map((item: any) => (
        <div 
          key={item.id} 
          onClick={() => onSelect && onSelect(item.id)}
          className="bg-white border border-gray-200 p-4 rounded shadow cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <h2 className="font-semibold">{item.name}</h2>
          {item.description && (
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
          )}
          {item.count !== undefined && (
            <p className="text-sm text-gray-500 mt-2">
              {item.count} {item.countLabel || 'items'}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default CardListWidget;