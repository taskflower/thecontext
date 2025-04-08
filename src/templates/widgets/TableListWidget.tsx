/* eslint-disable @typescript-eslint/no-explicit-any */
// src/templates/widgets/TableListWidget.tsx
import React from 'react';
import { WidgetProps } from '../../lib/templateRegistry';

const TableListWidget: React.FC<WidgetProps> = ({ 
  data = [], 
  onSelect
}) => {
  // Determine columns from first item
  const columns = data.length > 0 
    ? Object.keys(data[0]).filter(key => key !== 'id') 
    : ['name', 'description'];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(column => (
              <th 
                key={column}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column}
              </th>
            ))}
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">View</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item: any) => (
            <tr 
              key={item.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelect && onSelect(item.id)}
            >
              {columns.map(column => (
                <td key={`${item.id}-${column}`} className="px-6 py-4 whitespace-nowrap">
                  {typeof item[column] === 'object' 
                    ? JSON.stringify(item[column]) 
                    : item[column]}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-indigo-600 hover:text-indigo-900">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableListWidget;