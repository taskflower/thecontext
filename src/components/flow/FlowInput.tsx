// src/components/flow/FlowInput.tsx
import React from 'react';
import { Node } from '@/store/types';
import { pluginRegistry } from '@/plugins';

interface FlowInputProps {
  node: Node;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Dynamiczny komponent wejściowy dla widoku Flow
 * Renderuje odpowiedni typ wejścia w zależności od typu pluginu węzła
 */
const FlowInput: React.FC<FlowInputProps> = ({ node, value, onChange }) => {
  // Jeśli węzeł ma typ pluginu, użyj odpowiedniego komponentu wejściowego
  if (node.pluginType) {
    const plugin = pluginRegistry.getPlugin(node.pluginType);
    
    if (plugin) {
      return (
        <>
          {plugin.renderInputComponent(node, value, onChange)}
        </>
      );
    }
  }

  // Standardowe pole tekstowe dla węzłów bez pluginu
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-2">Odpowiedź:</h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Wpisz swoją odpowiedź..."
        className="w-full p-3 border border-[hsl(var(--input))] rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        rows={4}
      />

      {node.contextKey && (
        <div className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
          Odpowiedź zapisana w:{" "}
          <code className="bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded text-xs">
            {node.contextKey}
          </code>
          {node.contextJsonPath && (
            <span>
              {" "}
              (ścieżka:{" "}
              <code className="bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded text-xs">
                {node.contextJsonPath}
              </code>
              )
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FlowInput;