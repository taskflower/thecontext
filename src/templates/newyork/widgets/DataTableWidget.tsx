// src/templates/newyork/widgets/DataTableWidget.tsx
import React from 'react';
import { WidgetProps } from 'template-registry-module';

const DataTableWidget: React.FC<WidgetProps> = ({ 
  data = [], 
  onSelect
}) => {
  // Determine columns from first item
  const columns = data.length > 0 
    ? Object.keys(data[0]).filter(key => key !== 'id') 
    : ['name', 'description'];

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(column => (
              <th 
                key={column}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.charAt(0).toUpperCase() + column.slice(1).replace(/([A-Z])/g, ' $1')}
              </th>
            ))}
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item: any) => (
            <tr 
              key={item.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelect && onSelect(item.id)}
            >
              {columns.map(column => (
                <td key={`${item.id}-${column}`} className="px-6 py-4 whitespace-nowrap">
                  {column === 'name' ? (
                    <div className="font-medium text-gray-900">{item[column]}</div>
                  ) : typeof item[column] === 'object' ? (
                    JSON.stringify(item[column])
                  ) : (
                    item[column]
                  )}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  className="text-black hover:text-gray-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect && onSelect(item.id);
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTableWidget;