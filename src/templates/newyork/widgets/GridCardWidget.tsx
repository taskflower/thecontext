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
          className="group cursor-pointer transition-all duration-200"
        >
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden hover:shadow transition-shadow">
            {/* Slim top indicator instead of gradient bar */}
            <div className="flex items-center space-x-1 p-3 pb-0">
              <div className="h-1 w-6 bg-gray-200 rounded"></div>
              <div className="h-1 w-12 bg-black rounded"></div>
              <div className="h-1 w-6 bg-gray-200 rounded"></div>
            </div>
            
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">
                {item.name}
              </h3>
              
              {item.description && (
                <p className="mt-2 text-sm text-gray-600">
                  {item.description}
                </p>
              )}
              
              <div className="mt-4 flex justify-between items-center">
                {item.count !== undefined && (
                  <span className="text-xs text-gray-500">
                    {item.count} {item.countLabel || 'items'}
                  </span>
                )}
                
                <button 
                  className="p-1 rounded-full text-gray-400 hover:text-black hover:bg-gray-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect && onSelect(item.id);
                  }}
                >
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
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GridCardWidget;