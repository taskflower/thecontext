// src/modules/indexedDB/components/ContextDBViewer.tsx
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { ContextType } from '../../context/types';
import IndexedDBViewer from './IndexedDBViewer';

interface ContextDBViewerProps {
  contextTitle: string;
}

const ContextDBViewer: React.FC<ContextDBViewerProps> = ({ contextTitle }) => {
  const getContextItemByTitle = useAppStore((state) => state.getContextItemByTitle);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const contextItem = getContextItemByTitle(contextTitle);
    
    if (!contextItem) {
      setError(`Context item "${contextTitle}" not found`);
      return;
    }
    
    if (contextItem.type !== ContextType.INDEXED_DB) {
      setError(`Context item "${contextTitle}" is not an IndexedDB context (type: ${contextItem.type})`);
      return;
    }
    
    if (!contextItem.content) {
      setError(`Context item "${contextTitle}" does not specify a collection name`);
      return;
    }
    
    setIsValid(true);
    setError(null);
  }, [contextTitle, getContextItemByTitle]);

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-500">
        <h3 className="font-bold mb-2">Configuration Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!isValid) {
    return null;
  }

  return <IndexedDBViewer collectionName={contextTitle} isContextTitle={true} />;
};

export default ContextDBViewer;