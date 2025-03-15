// components/ui/ItemList.tsx
import React, { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { EmptyState } from './EmptyState';

// Użycie TypeScript generic (T) do obsługi różnych typów elementów
interface ItemListProps<T extends { id: string }> {
  items: T[];
  selected: string;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  renderItem: (item: T) => ReactNode;
}

export const ItemList = <T extends { id: string }>({ 
  items, selected, onClick, onDelete, renderItem 
}: ItemListProps<T>) => (
  <div className="overflow-auto h-[180px]">
    <div className="space-y-1">
      {items.map(item => (
        <div 
          key={item.id}
          className={`flex items-center px-2 py-1.5 rounded-sm text-xs cursor-pointer ${
            item.id === selected ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
          }`}
        >
          <div className="flex-1 truncate" onClick={() => onClick(item.id)}>
            {renderItem(item)}
          </div>
          <button 
            className="p-1 opacity-70 hover:opacity-100 hover:text-red-500"
            onClick={e => {
              e.stopPropagation();
              onDelete(item.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ))}
      {items.length === 0 && <EmptyState />}
    </div>
  </div>
);