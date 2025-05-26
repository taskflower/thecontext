// ========================================
// src/modules/edv2/shared/ItemList.tsx
// ========================================
import type { ItemListProps } from './types';

export function ItemList<T>({
  items,
  onAdd,
  onRemove,
  onUpdate,
  onMove,
  renderItem,
  addButtonText,
  emptyMessage,
  emptyIcon
}: ItemListProps<T>) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="border rounded p-3">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              {renderItem(item, index)}
            </div>
            <div className="flex gap-1 ml-2">
              {onMove && (
                <>
                  <button
                    onClick={() => onMove(index, 'up')}
                    disabled={index === 0}
                    className="text-xs text-zinc-600 hover:text-zinc-800 disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => onMove(index, 'down')}
                    disabled={index === items.length - 1}
                    className="text-xs text-zinc-600 hover:text-zinc-800 disabled:opacity-50"
                  >
                    ↓
                  </button>
                </>
              )}
              <button
                onClick={() => onRemove(index)}
                className="text-red-600 text-xs"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {items.length === 0 && (
        <div className="text-center py-4 text-zinc-500">
          <div className="text-lg mb-1">{emptyIcon}</div>
          <div className="text-sm">{emptyMessage}</div>
        </div>
      )}
    </div>
  );
}