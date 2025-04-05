/**
 * Context List Component
 * Displays a list of context items with filtering and search
 */
import React from 'react';
import { ContextItem, ContextContentType, ContextVisibility } from '../types';
import { useContextStore } from '../contextStore';

interface ContextListProps {
  items: ContextItem[];
  onSelect: (item: ContextItem) => void;
  onEdit: (item: ContextItem) => void;
  className?: string;
}

const ContextList: React.FC<ContextListProps> = ({
  items,
  onSelect,
  onEdit,
  className = ''
}) => {
  const { deleteItem, duplicateItem } = useContextStore();
  
  // Get content type label
  const getContentTypeLabel = (type: ContextContentType): string => {
    switch (type) {
      case ContextContentType.TEXT:
        return 'Text';
      case ContextContentType.JSON:
        return 'JSON';
      case ContextContentType.MARKDOWN:
        return 'Markdown';
      case ContextContentType.HTML:
        return 'HTML';
      case ContextContentType.XML:
        return 'XML';
      case ContextContentType.YAML:
        return 'YAML';
      case ContextContentType.CSV:
        return 'CSV';
      default:
        return 'Unknown';
    }
  };
  
  // Get visibility label
  const getVisibilityLabel = (visibility: ContextVisibility): string => {
    switch (visibility) {
      case ContextVisibility.PRIVATE:
        return 'Private';
      case ContextVisibility.WORKSPACE:
        return 'Workspace';
      case ContextVisibility.PUBLIC:
        return 'Public';
      default:
        return 'Unknown';
    }
  };
  
  // Get content type color
  const getContentTypeColor = (type: ContextContentType): string => {
    switch (type) {
      case ContextContentType.TEXT:
        return 'bg-gray-100 text-gray-800';
      case ContextContentType.JSON:
        return 'bg-yellow-100 text-yellow-800';
      case ContextContentType.MARKDOWN:
        return 'bg-blue-100 text-blue-800';
      case ContextContentType.HTML:
        return 'bg-orange-100 text-orange-800';
      case ContextContentType.XML:
        return 'bg-purple-100 text-purple-800';
      case ContextContentType.YAML:
        return 'bg-green-100 text-green-800';
      case ContextContentType.CSV:
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get visibility color
  const getVisibilityColor = (visibility: ContextVisibility): string => {
    switch (visibility) {
      case ContextVisibility.PRIVATE:
        return 'bg-red-100 text-red-800';
      case ContextVisibility.WORKSPACE:
        return 'bg-blue-100 text-blue-800';
      case ContextVisibility.PUBLIC:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle duplicate item
  const handleDuplicate = (item: ContextItem, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateItem(item.id);
  };
  
  // Handle delete item
  const handleDelete = (item: ContextItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      deleteItem(item.id);
    }
  };
  
  // Handle edit item
  const handleEdit = (item: ContextItem, e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(item);
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Truncate content preview
  const truncateContent = (content: string, maxLength: number = 100): string => {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className={`${className}`}>
      {items.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No context items found</p>
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your filters or create a new context item
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => handleEdit(item, e)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={(e) => handleDuplicate(item, e)}
                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                    title="Duplicate"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                      <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={(e) => handleDelete(item, e)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500 font-mono line-clamp-2 bg-gray-50 p-2 rounded">
                {truncateContent(item.content)}
              </div>
              
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full ${getContentTypeColor(item.contentType)}`}>
                  {getContentTypeLabel(item.contentType)}
                </span>
                
                <span className={`px-2 py-1 rounded-full ${getVisibilityColor(item.visibility)}`}>
                  {getVisibilityLabel(item.visibility)}
                </span>
                
                {item.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {tag}
                  </span>
                ))}
                
                <span className="text-gray-400 ml-auto">
                  Updated: {formatDate(item.updatedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContextList;