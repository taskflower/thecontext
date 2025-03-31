/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/indexedDB/components/IndexedDBViewer.tsx
import React, { useState } from 'react';
import { useIndexedDB } from '../useIndexedDB';
import { Loader, RefreshCw, Plus, Trash2, Save, X, Edit } from 'lucide-react';


interface IndexedDBViewerProps {
  collectionName: string;
  isContextTitle?: boolean;
}

const IndexedDBViewer: React.FC<IndexedDBViewerProps> = ({
  collectionName,
  isContextTitle = false,
}) => {
  const { data, isLoading, error, operations } = useIndexedDB(collectionName, isContextTitle);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItemData, setNewItemData] = useState<string>('{}');

  const handleRefresh = () => {
    operations.refresh();
  };

  const handleAddItem = async () => {
    try {
      const itemData = JSON.parse(newItemData);
      await operations.add(itemData);
      setNewItemData('{}');
      setIsAdding(false);
    } catch (err) {
      console.error('Error adding item:', err);
      alert(`Error adding item: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    
    try {
      const key = editingItem.id;
      await operations.update(editingItem, key);
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating item:', err);
      alert(`Error updating item: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDeleteItem = async (key: string | number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await operations.remove(key);
      } catch (err) {
        console.error('Error deleting item:', err);
        alert(`Error deleting item: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  };

  const handleClearCollection = async () => {
    if (confirm('Are you sure you want to clear the entire collection?')) {
      try {
        await operations.clear();
      } catch (err) {
        console.error('Error clearing collection:', err);
        alert(`Error clearing collection: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem({ ...item });
  };

  const handleEditChange = (field: string, value: any) => {
    if (!editingItem) return;
    
    setEditingItem((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (error) {
    // Importuj komponent obsługi błędów
    const ErrorRecovery = React.lazy(() => import('./ErrorRecovery'));
    
    return (
      <React.Suspense fallback={
        <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-500">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error.message}</p>
          <div className="mt-2 flex items-center">
            <Loader className="h-4 w-4 mr-1 animate-spin" /> Loading error recovery...
          </div>
        </div>
      }>
        <ErrorRecovery 
          error={error} 
          collectionName={collectionName}
          onRetry={handleRefresh}
        />
      </React.Suspense>
    );
  }

  return (
    <div className="bg-background border border-border rounded-md shadow-sm">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="font-medium text-base">
          Collection: <span className="font-bold">{isContextTitle ? data.length > 0 ? collectionName : '...' : collectionName}</span>
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Add Item"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={handleClearCollection}
            className="w-8 h-8 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
            title="Clear Collection"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading data...</span>
        </div>
      ) : (
        <div className="p-4">
          {isAdding && (
            <div className="mb-4 p-3 border border-border rounded-md bg-muted/30">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Add New Item</h4>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mb-2">
                <textarea
                  value={newItemData}
                  onChange={(e) => setNewItemData(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono text-sm"
                  rows={5}
                  placeholder="Enter JSON data"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleAddItem}
                  className="flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm"
                >
                  <Save className="h-4 w-4 mr-1" /> Save
                </button>
              </div>
            </div>
          )}

          {data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No items in this collection</p>
              <button
                onClick={() => setIsAdding(true)}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Add your first item
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((item: any, index) => (
                <div key={item.id || index} className="border border-border rounded-md p-3">
                  {editingItem && editingItem.id === item.id ? (
                    // Edit mode
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Edit Item</h4>
                        <button 
                          onClick={() => setEditingItem(null)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(editingItem).map(([key, value]) => (
                          <div key={key}>
                            <label className="block text-xs font-medium mb-1">{key}</label>
                            {key === 'id' ? (
                              <input
                                type="text"
                                value={String(value)}
                                disabled
                                className="w-full px-2 py-1 border border-border rounded-md bg-muted text-muted-foreground"
                              />
                            ) : (
                              <input
                                type="text"
                                value={typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                onChange={(e) => handleEditChange(key, e.target.value)}
                                className="w-full px-2 py-1 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary/30"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={handleUpdateItem}
                          className="flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm"
                        >
                          <Save className="h-4 w-4 mr-1" /> Update
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div>
                      <div className="flex justify-between">
                        <div className="text-xs text-muted-foreground">
                          ID: {item.id || 'N/A'}
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-muted-foreground hover:text-foreground"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-destructive hover:text-destructive/80"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <pre className="mt-2 text-xs font-mono bg-muted/30 p-2 rounded-md overflow-x-auto">
                        {JSON.stringify(item, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IndexedDBViewer;