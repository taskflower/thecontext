// src/templates/newyork/widgets/GridCardWidget.tsx
import React from 'react';
import { WidgetProps } from 'template-registry-module';

const GridCardWidget: React.FC<WidgetProps> = ({ 
  data = [], 
  onSelect
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((item: any) => (
        <div 
          key={item.id} 
          onClick={() => onSelect && onSelect(item.id)}
          className="group cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-1 bg-gradient-to-r from-gray-900 to-black">
              <div className="h-1"></div>
            </div>
            
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-black">
                {item.name}
              </h3>
              
              {item.description && (
                <p className="mt-2 text-sm text-gray-600">
                  {item.description}
                </p>
              )}
              
              <div className="mt-4 flex justify-between items-center">
                {item.count !== undefined && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">
                    {item.count} {item.countLabel || 'items'}
                  </span>
                )}
                
                <svg 
                  className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GridCardWidget;