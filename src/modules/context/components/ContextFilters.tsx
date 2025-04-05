/**
 * Context Filters Component
 * Controls for filtering and searching context items
 */
import React, { useState } from 'react';
import { 
  ContextFilterParams, 
  ContextContentType, 
  ContextVisibility, 
  SchemaStatus 
} from '../types';

interface ContextFiltersProps {
  filters: ContextFilterParams;
  onFilterChange: (filters: Partial<ContextFilterParams>) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  className?: string;
}

const ContextFilters: React.FC<ContextFiltersProps> = ({
  filters,
  onFilterChange,
  onSearch,
  searchQuery,
  className = ''
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };
  
  // Handle content type filter
  const handleContentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === 'all' 
      ? undefined 
      : e.target.value as ContextContentType;
    
    onFilterChange({ contentType: value });
  };
  
  // Handle visibility filter
  const handleVisibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === 'all' 
      ? undefined 
      : e.target.value as ContextVisibility;
    
    onFilterChange({ visibility: value });
  };
  
  // Handle schema status filter
  const handleSchemaStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === 'all' 
      ? undefined 
      : e.target.value as SchemaStatus;
    
    onFilterChange({ schemaStatus: value });
  };
  
  // Handle clearing all filters
  const handleClearFilters = () => {
    onFilterChange({
      contentType: undefined,
      visibility: undefined,
      schemaStatus: undefined,
      tags: undefined
    });
    
    onSearch('');
  };
  
  // Toggle advanced filters
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Search bar */}
        <div className="flex-grow relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search context items..."
            className="w-full p-2 pl-10 border border-gray-300 rounded-md"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        
        {/* Content type filter */}
        <div className="w-full md:w-48">
          <select
            value={filters.contentType || 'all'}
            onChange={handleContentTypeChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Content Types</option>
            <option value={ContextContentType.TEXT}>Plain Text</option>
            <option value={ContextContentType.JSON}>JSON</option>
            <option value={ContextContentType.MARKDOWN}>Markdown</option>
            <option value={ContextContentType.HTML}>HTML</option>
            <option value={ContextContentType.XML}>XML</option>
            <option value={ContextContentType.YAML}>YAML</option>
            <option value={ContextContentType.CSV}>CSV</option>
          </select>
        </div>
        
        {/* Visibility filter */}
        <div className="w-full md:w-48">
          <select
            value={filters.visibility || 'all'}
            onChange={handleVisibilityChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Visibilities</option>
            <option value={ContextVisibility.PRIVATE}>Private</option>
            <option value={ContextVisibility.WORKSPACE}>Workspace</option>
            <option value={ContextVisibility.PUBLIC}>Public</option>
          </select>
        </div>
      </div>
      
      {/* Advanced filters toggle */}
      <div className="flex justify-between items-center mb-2">
        <button
          type="button"
          onClick={toggleAdvancedFilters}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 mr-1 transition-transform ${
              showAdvancedFilters ? 'rotate-180' : ''
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
        </button>
        
        {/* Clear filters button */}
        <button
          type="button"
          onClick={handleClearFilters}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Clear Filters
        </button>
      </div>
      
      {/* Advanced filters */}
      {showAdvancedFilters && (
        <div className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Schema status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schema Status
              </label>
              <select
                value={filters.schemaStatus || 'all'}
                onChange={handleSchemaStatusChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Schema Types</option>
                <option value={SchemaStatus.NONE}>No Schema</option>
                <option value={SchemaStatus.SIMPLE}>Simple Validation</option>
                <option value={SchemaStatus.COMPLEX}>JSON Schema</option>
              </select>
            </div>
            
            {/* Tags filter (placeholder - would need a more complex implementation) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                placeholder="Filter by tags (TODO: implement)"
                className="w-full p-2 border border-gray-300 rounded-md opacity-50 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Tag filtering will be implemented in a future update
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextFilters;