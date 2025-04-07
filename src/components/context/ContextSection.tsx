// components/context/ContextSection.tsx
import React from 'react';
import { EmptyState } from '../theme';
import useStore from '@/store';


const ContextSection: React.FC = () => {
  const contextItems = useStore(state => state.contextItems);
  const editContext = useStore(state => state.editContext);
  
  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold">Kontekst</h3>
        <button 
          onClick={editContext}
          className="text-xs text-blue-500 hover:text-blue-700"
        >Edytuj</button>
      </div>
      <div className="max-h-52 overflow-y-auto">
        {contextItems.length > 0 ? (
          <div className="space-y-1">
            {contextItems.map(item => (
              <div key={item.id} className="text-sm bg-white p-2 rounded shadow-sm">
                <span className="font-medium">{item.title}:</span>{' '}
                <span className="text-xs overflow-hidden overflow-ellipsis whitespace-nowrap">{item.content}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="Brak elementów kontekstu" />
        )}
      </div>
    </div>
  );
};

export default ContextSection;

