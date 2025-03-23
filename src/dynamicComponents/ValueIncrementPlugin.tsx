// src/dynamicComponents/ValueIncrementPlugin.tsx
import React, { useState } from 'react';
import { PluginComponentProps } from '../modules/plugins/types';
import { useAppStore } from '@/modules/store';

interface ValueIncrementData {
  buttonText: string;
  incrementBy: number;
}

const defaultData: ValueIncrementData = {
  buttonText: 'Zwiększ wartość',
  incrementBy: 1
};

const ValueIncrementPlugin: React.FC<PluginComponentProps> = ({ data, appContext }) => {
  // Połącz dane domyślne z dostarczonymi opcjami
  const options: ValueIncrementData = {
    ...defaultData,
    ...(data as ValueIncrementData)
  };
  
  // Śledzenie lokalnej wartości (będzie używana tylko do wyświetlania)
  const [localValue, setLocalValue] = useState<number | null>(null);
  
  // Pobierz aktualny węzeł bezpośrednio z appContext
  const node = appContext.currentNode;
  
  // Jeśli nie mamy węzła, pokaż komunikat błędu
  if (!node) {
    return (
      <div className="p-4">
        <div className="w-full p-4 text-center bg-red-100 text-red-800 rounded-md">
          Brak dostępu do danych węzła.
        </div>
      </div>
    );
  }
  
  // Wartość do wyświetlenia - używamy lokalnej wartości jeśli jest dostępna, w przeciwnym razie wartość z węzła
  const displayValue = localValue !== null ? localValue : node.value;
  
  const handleIncrementClick = () => {
    // Zwiększamy lokalną wartość do wyświetlenia
    const newValue = Number(displayValue) + options.incrementBy;
    setLocalValue(newValue);
    
    // Wyświetlamy komunikat dla użytkownika
    alert(`Wartość zwiększona do: ${newValue}. 
    
W trybie podglądu kroku nie możemy bezpośrednio zaktualizować wartości węzła w store'ze, ale w pełnej aplikacji ta zmiana zostałaby zapisana.`);
    
    // Możesz też spróbować zaktualizować wartość w store (ale prawdopodobnie nie zadziała w kontekście kroku)
    try {
      // Pobieramy ID węzła
      const nodeId = node.id;
      // Pobieramy referencję do store
      const store = useAppStore.getState();
      
      console.log("Próba aktualizacji węzła:", {
        nodeId,
        newValue,
        currentSelection: store.selected
      });
      
      // To prawdopodobnie nie zadziała w kontekście kroku, ale możemy spróbować
      if (store.updateNodePosition) {
        // Jeśli mamy updateNodePosition, prawdopodobnie możemy dodać własną funkcję
        console.log("Dostępne metody w store:", Object.keys(store));
      }
    } catch (error) {
      console.error("Nie udało się zaktualizować wartości węzła:", error);
    }
  };
  
  return (
    <div className="p-4">
      <div className="w-full flex flex-col items-center justify-center gap-3 p-4 rounded-md bg-background border border-border">
        <div className="text-sm font-medium">{node.label}</div>
        <div className="text-sm text-center">
          Aktualna wartość: <strong>{displayValue}</strong>
        </div>
        
        <button
          onClick={handleIncrementClick}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {options.buttonText}
        </button>
        
        <div className="mt-4 text-xs text-muted-foreground border-t border-border pt-2 w-full">
          <div className="font-semibold mb-1">Informacje o węźle:</div>
          <div>ID: {node.id}</div>
          <div>Label: {node.label}</div>
          <div>Oryginalna wartość: {node.value}</div>
        </div>
      </div>
    </div>
  );
};

// Dodaj schemat opcji dla edytora pluginu
ValueIncrementPlugin.optionsSchema = {
  buttonText: {
    type: 'string',
    label: 'Tekst przycisku',
    default: defaultData.buttonText,
    description: 'Tekst wyświetlany na przycisku'
  },
  incrementBy: {
    type: 'number',
    label: 'Zwiększ o',
    default: defaultData.incrementBy,
    description: 'O ile zwiększyć wartość węzła'
  }
};

export default ValueIncrementPlugin;