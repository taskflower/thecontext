/**
 * Context Manager Component
 * Main UI for managing context items
 */
import React, { useState, useEffect } from 'react';
import { useContextStore } from '../contextStore';
import { 
  ContextItem, 
  ContextContentType, 
  ContextVisibility, 
  SchemaStatus,
  ContextFilterParams,
  CreateContextItemParams 
} from '../types';
import ContextList from './ContextList';
import ContextEditor from './ContextEditor';
import ContextDetails from './ContextDetails';
import ContextFilters from './ContextFilters';

interface ContextManagerProps {
  workspaceId: string;
  className?: string;
}

const ContextManager: React.FC<ContextManagerProps> = ({ 
  workspaceId,
  className = '' 
}) => {
  // Local state
  const [view, setView] = useState<'list' | 'editor' | 'details'>('list');
  const [filters, setFilters] = useState<ContextFilterParams>({ workspaceId });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Global context store
  const { 
    state, 
    filterItems, 
    createItem, 
    setCurrentItem,
    getItem 
  } = useContextStore();
  
  const { currentItemId } = state;
  
  // Effect to update filters when workspaceId changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, workspaceId }));
  }, [workspaceId]);
  
  // Get filtered context items
  const contextItems = filterItems({ 
    ...filters, 
    query: searchQuery 
  });
  
  // Get current context item
  const currentItem = currentItemId ? getItem(currentItemId) : null;
  
  // Handle creating a new context item
  const handleCreateNew = () => {
    // Reset current selection
    setCurrentItem(null);
    // Switch to editor view
    setView('editor');
  };
  
  // Handle saving a new context item
  const handleSaveNew = (params: CreateContextItemParams) => {
    createItem({
      ...params,
      workspaceId
    });
    
    // Switch back to list view
    setView('list');
  };
  
  // Handle selecting a context item
  const handleSelectItem = (item: ContextItem) => {
    setCurrentItem(item.id);
    setView('details');
  };
  
  // Handle editing a context item
  const handleEditItem = (item: ContextItem) => {
    setCurrentItem(item.id);
    setView('editor');
  };
  
  // Handle canceling edit/create
  const handleCancel = () => {
    setView('list');
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ContextFilterParams>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };
  
  // Render view content based on current view
  const renderViewContent = () => {
    switch (view) {
      case 'editor':
        return (
          <ContextEditor 
            workspaceId={workspaceId}
            item={currentItem}
            onSave={handleSaveNew}
            onCancel={handleCancel}
          />
        );
      
      case 'details':
        return currentItem ? (
          <ContextDetails 
            item={currentItem}
            onEdit={() => handleEditItem(currentItem)}
            onBack={() => setView('list')}
          />
        ) : (
          <div className="p-6 text-center text-gray-500">
            No context item selected
          </div>
        );
      
      case 'list':
      default:
        return (
          <>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Context Items</h2>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                New Context Item
              </button>
            </div>
            
            <ContextFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              searchQuery={searchQuery}
            />
            
            <ContextList 
              items={contextItems}
              onSelect={handleSelectItem}
              onEdit={handleEditItem}
            />
          </>
        );
    }
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {renderViewContent()}
    </div>
  );
};

export default ContextManager;