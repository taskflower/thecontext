/**
 * Context Details Component
 * Displays context item details and preview
 */
import React, { useState } from 'react';
import { ContextItem, ContextContentType } from '../types';
import { useContextStore } from '../contextStore';

interface ContextDetailsProps {
  item: ContextItem;
  onEdit: () => void;
  onBack: () => void;
  className?: string;
}

const ContextDetails: React.FC<ContextDetailsProps> = ({
  item,
  onEdit,
  onBack,
  className = ''
}) => {
  // State for current view mode
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');
  
  const { deleteItem, duplicateItem } = useContextStore();
  
  // Get content type label
  const getContentTypeLabel = (type: ContextContentType): string => {
    switch (type) {
      case ContextContentType.TEXT:
        return 'Plain Text';
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
  
  // Format date
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle duplicate item
  const handleDuplicate = () => {
    duplicateItem(item.id);
    onBack();
  };
  
  // Handle delete item
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      deleteItem(item.id);
      onBack();
    }
  };
  
  // Render content based on content type
  const renderContent = () => {
    if (viewMode === 'raw') {
      return (
        <pre className="p-4 bg-gray-50 rounded-md border border-gray-200 overflow-auto text-xs font-mono whitespace-pre-wrap">
          {item.content}
        </pre>
      );
    }
    
    switch (item.contentType) {
      case ContextContentType.JSON:
        try {
          const parsed = JSON.parse(item.content);
          return (
            <pre className="p-4 bg-gray-50 rounded-md border border-gray-200 overflow-auto text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          );
        } catch {
          return (
            <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
              <p className="font-medium">Invalid JSON</p>
              <p className="text-sm mt-1">The content cannot be parsed as valid JSON.</p>
            </div>
          );
        }
      
      case ContextContentType.MARKDOWN:
        // In a real app, use a proper markdown renderer
        return (
          <div className="p-4 bg-white rounded-md border border-gray-200 prose max-w-none">
            {/* Placeholder for markdown rendering */}
            <div className="italic text-gray-500 mb-4">
              Markdown rendering would be implemented here with a library like react-markdown
            </div>
            <pre className="whitespace-pre-wrap text-sm">{item.content}</pre>
          </div>
        );
      
      case ContextContentType.HTML:
        return (
          <div className="p-4 bg-white rounded-md border border-gray-200">
            <div className="italic text-gray-500 mb-4">
              HTML content preview (sanitized for security)
            </div>
            <div className="border-t border-gray-200 pt-4">
              {/* For security, don't render HTML directly in a real app without sanitization */}
              <pre className="whitespace-pre-wrap text-sm">{item.content}</pre>
            </div>
          </div>
        );
      
      case ContextContentType.XML:
      case ContextContentType.YAML:
      case ContextContentType.CSV:
        // These would have specialized renderers in a real app
        return (
          <pre className="p-4 bg-gray-50 rounded-md border border-gray-200 overflow-auto text-xs font-mono whitespace-pre-wrap">
            {item.content}
          </pre>
        );
      
      default: // TEXT
        return (
          <div className="p-4 bg-white rounded-md border border-gray-200">
            <p className="whitespace-pre-wrap">{item.content}</p>
          </div>
        );
    }
  };

  return (
    <div className={`${className}`}>
      {/* Header with back button and actions */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to List
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit
          </button>
          
          <button
            onClick={handleDuplicate}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
              <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
            </svg>
            Duplicate
          </button>
          
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Delete
          </button>
        </div>
      </div>
      
      {/* Title and description */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
        {item.description && (
          <p className="text-gray-600 mt-2">{item.description}</p>
        )}
      </div>
      
      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
        <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Content Type:</span>
              <span className="font-medium">{getContentTypeLabel(item.contentType)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Visibility:</span>
              <span className="font-medium">{item.visibility}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Schema Status:</span>
              <span className="font-medium">{item.schemaStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">ID:</span>
              <span className="font-mono text-xs">{item.id}</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">Timeline</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Created:</span>
              <span>{formatDate(item.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Last Updated:</span>
              <span>{formatDate(item.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tags */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-2">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {item.tags.length > 0 ? (
            item.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {tag}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">No tags</span>
          )}
        </div>
      </div>
      
      {/* Content section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-700">Content</h3>
          
          <div className="flex rounded-md overflow-hidden border border-gray-300">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 text-sm ${
                viewMode === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-3 py-1.5 text-sm ${
                viewMode === 'raw'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Raw
            </button>
          </div>
        </div>
        
        {renderContent()}
      </div>
      
      {/* Schema section - if applicable */}
      {item.schemaStatus === SchemaStatus.COMPLEX && item.schema && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">JSON Schema</h3>
          <pre className="p-4 bg-gray-50 rounded-md border border-gray-200 overflow-auto text-xs font-mono whitespace-pre-wrap">
            {typeof item.schema === 'string'
              ? JSON.stringify(JSON.parse(item.schema), null, 2)
              : JSON.stringify(item.schema, null, 2)
            }
          </pre>
        </div>
      )}
    </div>
  );
};

export default ContextDetails;