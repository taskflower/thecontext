// src/dynamicComponents/ExamplePlugin.tsx

import React from 'react';
import { PluginComponentProps } from '../modules/plugins/types';

// Definicja interfejsu dla danych pluginu
interface ExamplePluginData {
  message?: string;
  count?: number;
  options?: string[];
}

const ExamplePlugin: React.FC<PluginComponentProps<ExamplePluginData>> = ({ data, appContext }) => {
  // Bezpieczny dostęp do danych z typowaniem
  const { message = "Domyślna wiadomość", count = 0, options = [] } = data || {};
  
  // Dane kontekstowe aplikacji są teraz typowane
  const { currentWorkspace, currentScenario, currentNode } = appContext;
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Example Plugin</h3>
        <p className="text-muted-foreground">
          Przykładowa implementacja pluginu z właściwym typowaniem.
        </p>
      </div>
      
      <div className="bg-muted/10 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Dane pluginu:</h4>
        <div className="space-y-2">
          <p><span className="font-mono">message:</span> {message}</p>
          <p><span className="font-mono">count:</span> {count}</p>
          {options.length > 0 && (
            <div>
              <p className="font-mono mb-1">options:</p>
              <ul className="list-disc list-inside pl-2">
                {options.map((option, index) => (
                  <li key={index}>{option}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-muted/10 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Kontekst aplikacji:</h4>
        <div className="space-y-1 text-sm">
          <p>Workspace: {currentWorkspace?.title || "Brak"}</p>
          <p>Scenario: {currentScenario?.name || "Brak"}</p>
          <p>Selected Node: {currentNode?.label || "Brak"}</p>
        </div>
      </div>
    </div>
  );
};

export default ExamplePlugin;