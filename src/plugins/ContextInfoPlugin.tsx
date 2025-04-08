/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/ContextInfoPlugin.tsx (wersja poprawiona)
import React from 'react';
import { ContextItem } from '@/store/types';
import { NodePlugin, ValidationResult } from './types'; // Używamy nowego ujednoliconego interfejsu
import { Node } from '@/store/types';

export class ContextInfoPlugin implements NodePlugin {
  id = 'context-info';
  name = 'Informacje o kontekście';
  description = 'Wyświetla podsumowanie aktualnego kontekstu';
  
  transformNode(node: Node): Node {
    // Ten plugin nie modyfikuje węzła
    return node;
  }
  
  validateNodeData(_pluginData?: Record<string, any>): ValidationResult {
    // Dodajemy podkreślnik aby oznaczyć, że parametr nie jest używany
    // Ten plugin nie wymaga walidacji danych
    return { isValid: true };
  }
  
  renderConfigForm(
    _pluginData?: Record<string, any>, 
    _onChange?: (newData: Record<string, any>) => void
  ): React.ReactNode {
    // Dodajemy podkreślniki aby oznaczyć, że parametry nie są używane
    // Ten plugin nie ma konfiguracji
    return (
      <div className="mt-4 p-4 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--muted))]">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Ten plugin nie wymaga konfiguracji. Wyświetla podsumowanie kontekstu.
        </p>
      </div>
    );
  }
  
  renderInputComponent(
    _node: Node, 
    _value: string, 
    _onChange: (value: string) => void
  ): React.ReactNode {
    // Dodajemy podkreślniki aby oznaczyć, że parametry nie są używane
    // Ten plugin nie dostarcza komponentu wejściowego
    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Informacja:</h3>
        <div className="bg-[hsl(var(--muted))] p-4 rounded-md">
          <p className="text-sm">Ten plugin nie wymaga wprowadzania danych.</p>
        </div>
      </div>
    );
  }
  
  static renderContextSummary(contextItems: ContextItem[]) {
    return (
      <div className="context-info-plugin bg-gray-100 p-3 rounded-md mb-4">
        <h3 className="text-sm font-semibold mb-2">Kontekst Scenariusza</h3>
        <div className="space-y-2">
          {contextItems.map(item => (
            <div key={item.id} className="text-xs">
              <span className="font-medium">{item.title}:</span>{' '}
              <span className="truncate block">{item.content}</span>
            </div>
          ))}
          {contextItems.length === 0 && (
            <p className="text-xs text-gray-500">Brak elementów kontekstu</p>
          )}
          <div className="mt-2 text-xs text-gray-600">
            Łącznie elementów: {contextItems.length}
          </div>
        </div>
      </div>
    );
  }
}

// Eksportuj instancję pluginu
export const contextInfoPlugin = new ContextInfoPlugin();