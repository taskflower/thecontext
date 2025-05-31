// ========================================
// src/modules/edv2/shared/types.ts
// ========================================
export interface AIGeneratorConfig {
    type: 'nodes' | 'widgets' | 'schema' | 'flow';
    placeholder: string;
    buttonText: string;
    systemMessage: string;
    schema: any;
    jsonSchema: any;
  }
  
  export interface ItemListProps<T> {
    items: T[];
    onAdd: (item: T) => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, updates: Partial<T>) => void;
    onMove?: (index: number, direction: 'up' | 'down') => void;
    renderItem: (item: T, index: number) => React.ReactNode;
    addButtonText: string;
    emptyMessage: string;
    emptyIcon: string;
  }