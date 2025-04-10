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

  // Function to render object values as badges
  const renderCellContent = (item: any, column: string) => {
    if (column === 'name') {
      const name = item[column];
      return (
        <div className="font-medium text-gray-900 truncate max-w-xs" title={name}>
          {name}
        </div>
      );
    } else if (typeof item[column] === 'object' && item[column] !== null) {
      // For arrays, render each item as a badge
      if (Array.isArray(item[column])) {
        return (
          <div className="flex flex-wrap gap-1">
            {item[column].map((node: any, index: number) => (
              <span 
                key={index} 
                className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                title={typeof node === 'object' && node !== null && node.name ? node.name : ''}
              >
                {typeof node === 'object' && node !== null && node.name 
                  ? node.name.length > 15 ? `${node.name.substring(0, 15)}...` : node.name
                  : typeof node === 'string' 
                    ? node.length > 15 ? `${node.substring(0, 15)}...` : node
                    : `Item ${index + 1}`}
              </span>
            ))}
          </div>
        );
      }
      // For single objects, check if they have a name property
      else if (item[column].name) {
        const name = item[column].name;
        return (
          <span 
            className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
            title={name}
          >
            {name.length > 15 ? `${name.substring(0, 15)}...` : name}
          </span>
        );
      }
      // Fallback to showing keys
      else {
        return (
          <div className="flex flex-wrap gap-1">
            {Object.keys(item[column]).map((key, index) => (
              <span 
                key={index} 
                className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
              >
                {key}
              </span>
            ))}
          </div>
        );
      }
    } else if (typeof item[column] === 'string') {
      const text = item[column];
      return (
        <div className="truncate max-w-xs" title={text}>
          {text}
        </div>
      );
    } else {
      return item[column];
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-100 shadow-sm">
      <table className="min-w-full divide-y divide-gray-100">
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
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((item: any) => (
            <tr 
              key={item.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelect && onSelect(item.id)}
            >
              {columns.map(column => (
                <td key={`${item.id}-${column}`} className="px-6 py-4 whitespace-nowrap">
                  {renderCellContent(item, column)}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTableWidget;