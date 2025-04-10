// src/components/ContextDebugger.tsx
// Ten komponent może być umieszczony w różnych miejscach aplikacji,
// aby monitorować stan kontekstu i pomagać w debugowaniu

import React, { useState } from 'react';
import { useContextStore } from '../lib/contextStore';
import { useAppStore } from '../lib/store';

interface ContextDebuggerProps {
  showTitle?: boolean;
  collapsed?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'full-width';
}

export const ContextDebugger: React.FC<ContextDebuggerProps> = ({
  showTitle = true,
  collapsed = true,
  position = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(!collapsed);
  const context = useContextStore(state => state.context);
  const activeWorkspaceId = useContextStore(state => state.activeWorkspaceId);
  const contexts = useContextStore(state => state.contexts);
  
  const { getCurrentWorkspace, getCurrentScenario } = useAppStore();
  const currentWorkspace = getCurrentWorkspace();
  const currentScenario = getCurrentScenario();

  // Funkcja pomocnicza formatująca obiekt do wyświetlenia
  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return 'Błąd serializacji danych';
    }
  };

  // Sprawdzenie czy kontekst został poprawnie zainicjalizowany
  const isContextInitialized = !!context && Object.keys(context).length > 0;
  
  // Sprawdzenie czy kontekst dla aktywnego workspace'a istnieje
  const workspaceHasContext = activeWorkspaceId && !!contexts[activeWorkspaceId];

  // Pozycjonowanie komponentu w zależności od wybranej opcji
  let positionClasses = '';
  switch (position) {
    case 'bottom-right':
      positionClasses = 'bottom-4 right-4';
      break;
    case 'bottom-left':
      positionClasses = 'bottom-4 left-4';
      break;
    case 'top-right':
      positionClasses = 'top-4 right-4';
      break;
    case 'top-left':
      positionClasses = 'top-4 left-4';
      break;
    case 'full-width':
      positionClasses = 'bottom-0 left-0 right-0';
      break;
  }

  if (position === 'full-width') {
    return (
      <div className={`fixed ${positionClasses} z-50 bg-gray-900 text-white p-4`}>
        <div className="flex justify-between items-center mb-2">
          {showTitle && <h3 className="text-lg font-semibold">Debugger Kontekstu</h3>}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-300 hover:text-white"
          >
            {isOpen ? 'Zwiń' : 'Rozwiń'}
          </button>
        </div>
        
        {isOpen && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">Aktywny Workspace:</h4>
              <div className="bg-gray-800 p-2 rounded text-xs font-mono overflow-auto max-h-40">
                {activeWorkspaceId || 'Brak'}
              </div>
              
              <h4 className="text-sm font-semibold mt-3 mb-1">Aktualny Workspace:</h4>
              <div className="bg-gray-800 p-2 rounded text-xs font-mono overflow-auto max-h-40">
                {currentWorkspace ? formatJson({
                  id: currentWorkspace.id,
                  name: currentWorkspace.name,
                  hasInitialContext: !!currentWorkspace.initialContext
                }) : 'Brak'}
              </div>
              
              <h4 className="text-sm font-semibold mt-3 mb-1">Aktualny Scenariusz:</h4>
              <div className="bg-gray-800 p-2 rounded text-xs font-mono overflow-auto max-h-40">
                {currentScenario ? formatJson({
                  id: currentScenario.id,
                  name: currentScenario.name,
                  nodesCount: currentScenario.nodes?.length || 0
                }) : 'Brak'}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-1">
                Aktualny Kontekst:
                <span className={`ml-2 text-xs font-normal ${isContextInitialized ? 'text-green-400' : 'text-red-400'}`}>
                  {isContextInitialized ? 'Zainicjalizowany' : 'Niezainicjalizowany'}
                </span>
              </h4>
              <div className="bg-gray-800 p-2 rounded text-xs font-mono overflow-auto max-h-40">
                {formatJson(context)}
              </div>
              
              <h4 className="text-sm font-semibold mt-3 mb-1">
                Kontekst dla Workspace:
                <span className={`ml-2 text-xs font-normal ${workspaceHasContext ? 'text-green-400' : 'text-red-400'}`}>
                  {workspaceHasContext ? 'Istnieje' : 'Brak'}
                </span>
              </h4>
              <div className="bg-gray-800 p-2 rounded text-xs font-mono overflow-auto max-h-40">
                {activeWorkspaceId && contexts[activeWorkspaceId] 
                  ? formatJson(contexts[activeWorkspaceId])
                  : 'Brak kontekstu dla aktywnego workspace'}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses} z-50`}>
      <div className="bg-gray-900 text-white rounded-lg shadow-lg overflow-hidden max-w-md">
        <div className="p-3 bg-gray-800 flex justify-between items-center">
          {showTitle && <h3 className="text-sm font-semibold">Debugger Kontekstu</h3>}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-300 hover:text-white bg-gray-700 p-1 rounded"
          >
            {isOpen ? '−' : '+'}
          </button>
        </div>
        
        {isOpen && (
          <div className="p-4">
            <div className="mb-3">
              <div className="flex justify-between">
                <h4 className="text-xs font-semibold mb-1">Workspace ID:</h4>
                <span className={`text-xs ${activeWorkspaceId ? 'text-green-400' : 'text-red-400'}`}>
                  {activeWorkspaceId || 'Brak'}
                </span>
              </div>
              
              <div className="flex justify-between mt-1">
                <h4 className="text-xs font-semibold">Kontekst:</h4>
                <span className={`text-xs ${isContextInitialized ? 'text-green-400' : 'text-red-400'}`}>
                  {isContextInitialized ? 'Zainicjalizowany' : 'Niezainicjalizowany'}
                </span>
              </div>
            </div>
            
            <h4 className="text-xs font-semibold mb-1">Zawartość kontekstu:</h4>
            <pre className="bg-gray-800 p-2 rounded text-xs font-mono overflow-auto max-h-40">
              {formatJson(context)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextDebugger;