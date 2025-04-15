import React, { useState } from "react";
import { useAppStore } from "@/lib/store";

const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  
  const { 
    getCurrentScenario, 
    getContext
  } = useAppStore();

  const currentScenario = getCurrentScenario();
  
  // Get flow steps from current scenario
  const flowSteps = currentScenario?.nodes || [];

  // Extract context data for visualization using central function
  const getContextValue = (path: string) => {
    if (!path || path === 'unknown') return null;
    // Wywołujemy getContext bez parametrów, a potem nawigujemy po ścieżce ręcznie
    const context = getContext();
    
    if (!context) return null;
    
    const parts = path.split('.');
    let current = context;
    
    for (const part of parts) {
      if (!current || typeof current !== 'object') return null;
      current = current[part];
    }
    
    return current;
  };

  // Get step schema information
  const getStepSchema = (step: any) => {
    if (!step) return null;
    
    // Najpierw sprawdź czy to jest krok LLM na podstawie templateId
    if (step.templateId === 'llm-query' && step.attrs?.llmSchemaPath) {
      const schemaPath = step.attrs.llmSchemaPath;
      let fullPath = schemaPath;
      
      // Jeśli ścieżka nie zaczyna się od 'llmSchemas.', dodaj prefix
      if (!schemaPath.startsWith('llmSchemas.')) {
        fullPath = `llmSchemas.${schemaPath}`;
      }
      
      // Spróbuj pobrać schemat
      const schema = getContextValue(fullPath);
      
      if (schema) {
        console.log(`[DebugPanel] Found LLM schema for path: ${fullPath}`, schema);
      } else {
        console.warn(`[DebugPanel] LLM schema not found for path: ${fullPath}`);
        
        // Sprawdź, czy schemat jest bezpośrednio w ścieżce (bez prefiksu)
        const directSchema = getContextValue(schemaPath);
        if (directSchema) {
          console.log(`[DebugPanel] Found LLM schema directly at: ${schemaPath}`);
          return {
            type: 'llm',
            path: schemaPath,
            schema: directSchema
          };
        }
      }
      
      return {
        type: 'llm',
        path: schemaPath,
        schema: schema
      };
    }
    
    // Dla formularzy (sprawdź templateId lub typ)
    if ((step.templateId === 'form-step' || step.type === 'form') && step.attrs?.formSchemaPath) {
      const schemaPath = step.attrs.formSchemaPath;
      let fullPath = schemaPath;
      
      // Jeśli ścieżka nie zaczyna się od 'formSchemas.', dodaj prefix
      if (!schemaPath.startsWith('formSchemas.')) {
        fullPath = `formSchemas.${schemaPath}`;
      }
      
      // Spróbuj pobrać schemat
      const schema = getContextValue(fullPath);
      
      if (schema) {
        console.log(`[DebugPanel] Found form schema for path: ${fullPath}`, schema);
      } else {
        console.warn(`[DebugPanel] Form schema not found for path: ${fullPath}`);
        
        // Sprawdź, czy schemat jest bezpośrednio w ścieżce (bez prefiksu)
        const directSchema = getContextValue(schemaPath);
        if (directSchema) {
          console.log(`[DebugPanel] Found form schema directly at: ${schemaPath}`);
          return {
            type: 'form',
            path: schemaPath,
            schema: directSchema
          };
        }
      }
      
      return {
        type: 'form',
        path: schemaPath,
        schema: schema
      };
    }
    
    // Sprawdź wszystkie możliwe przypadki, jeśli zwykłe warunki nie pasują
    console.log(`[DebugPanel] Inspecting step for schemas:`, step);
    
    // Sprawdź, czy jest to krok LLM który nie używa standardowej ścieżki llmSchemaPath
    if (step.templateId === 'llm-query' || step.label?.includes('AI') || step.label?.includes('Analiza')) {
      console.log(`[DebugPanel] Detected potential LLM step without explicit schema path`);
      
      // Sprawdź, czy możemy znaleźć schemat na podstawie contextPath
      const contextPath = step.contextPath;
      if (contextPath) {
        // Sprawdź najpierw schemat o tej samej nazwie co ścieżka kontekstu
        const potentialSchemaPath = `llmSchemas.${contextPath.split('.').pop()}`;
        const schema = getContextValue(potentialSchemaPath);
        
        if (schema) {
          console.log(`[DebugPanel] Found matching LLM schema at: ${potentialSchemaPath}`);
          return {
            type: 'llm',
            path: potentialSchemaPath,
            schema: schema
          };
        }
        
        // Przeszukaj wszystkie dostępne schematy LLM
        const allLlmSchemas = getContextValue('llmSchemas');
        if (allLlmSchemas && typeof allLlmSchemas === 'object') {
          console.log(`[DebugPanel] Checking all available LLM schemas`);
          
          for (const [schemaName, schemaValue] of Object.entries(allLlmSchemas)) {
            // Sprawdź, czy nazwa schematu jest zawarta w ścieżce kontekstu
            if (contextPath.toLowerCase().includes(schemaName.toLowerCase())) {
              console.log(`[DebugPanel] Found potential matching LLM schema: ${schemaName}`);
              return {
                type: 'llm',
                path: `llmSchemas.${schemaName}`,
                schema: schemaValue
              };
            }
          }
        }
      }
    }
    
    return null;
  };

  // Get step metadata if available
  const getStepMetadata = (step: any) => {
    return step.metadata || {};
  };

  // Get step description based on type and metadata
  const getStepDescription = (step: any) => {
    // First try to get description from metadata
    const metadata = getStepMetadata(step);
    if (metadata.description) {
      return metadata.description;
    }
    
    // Sprawdź po templateId
    if (step.templateId) {
      switch (step.templateId) {
        case 'form-step':
          return "Pobiera dane od użytkownika poprzez formularz i zapisuje je w kontekście";
        case 'llm-query':
          return "Wysyła zapytanie do modelu AI i strukturyzuje odpowiedź zgodnie ze schematem";
        case 'fb-api-integration':
          return "Integruje się z Facebook Marketing API";
        case 'fb-campaign-preview':
          return "Wyświetla podgląd kampanii Facebook";
        case 'fb-campaign-stats':
          return "Pokazuje statystyki kampanii Facebook";
        case 'fb-campaign-summary':
          return "Tworzy podsumowanie kampanii Facebook";
      }
    }
    
    // Sprawdź po etykiecie
    if (step.label) {
      const label = step.label.toLowerCase();
      if (label.includes('analiza') && label.includes('ai')) {
        return "Analizuje dane przy użyciu sztucznej inteligencji według określonego schematu";
      }
      if (label.includes('form') || label.includes('formularz')) {
        return "Zbiera dane od użytkownika";
      }
      if (label.includes('podgląd')) {
        return "Wyświetla podgląd danych";
      }
      if (label.includes('podsumowanie') || label.includes('summary')) {
        return "Generuje podsumowanie danych";
      }
    }
    
    // Fallback to type-based description
    const stepType = step.type || 'default';
    switch (stepType) {
      case 'form': 
        return "Pobiera dane od użytkownika poprzez formularz i zapisuje je w kontekście";
      case 'llm': 
        return "Wysyła zapytanie do modelu AI i strukturyzuje odpowiedź zgodnie ze schematem";
      case 'api': 
        return "Integruje się z zewnętrznym API";
      case 'preview': 
        return "Wyświetla podgląd danych z kontekstu";
      case 'summary': 
        return "Tworzy podsumowanie danych z kontekstu";
      default: 
        return "Przetwarza dane w kontekście";
    }
  };

  // Get type label based on step type
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'form': return 'Formularz';
      case 'llm': return 'AI Model';
      case 'api': return 'API';
      case 'preview': return 'Podgląd';
      case 'summary': return 'Podsumowanie';
      default: return 'Element';
    }
  };

  // Get step icon based on type
  const getStepIcon = (type: string) => {
    switch (type) {
      case 'form': return '📝';
      case 'llm': return '🤖';
      case 'api': return '🔌';
      case 'preview': return '👁️';
      case 'summary': return '📊';
      default: return '📄';
    }
  };

  // Render a schema (form or LLM)
  const renderSchema = (schemaInfo: any) => {
    if (!schemaInfo || !schemaInfo.schema) {
      // Check if we might have a schema path but couldn't resolve it
      if (schemaInfo && schemaInfo.path) {
        return (
          <div className="text-sm text-red-500 italic">
            <span className="font-bold">Błąd:</span> Schemat nie znaleziony pod ścieżką: {schemaInfo.path}
          </div>
        );
      }
      
      return (
        <div className="text-sm text-gray-500 italic">Brak schematu</div>
      );
    }
    
    const { type, path, schema } = schemaInfo;
    
    if (type === 'form' && Array.isArray(schema)) {
      return (
        <div className="bg-white border border-gray-200 rounded p-2 text-xs">
          <div className="flex justify-between items-center mb-1">
            <div className="font-medium">Pola formularza:</div>
            <div className="text-xs text-blue-500">{path}</div>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-1 text-left">Nazwa</th>
                <th className="p-1 text-left">Typ</th>
                <th className="p-1 text-left">Wymagane</th>
              </tr>
            </thead>
            <tbody>
              {schema.map((field: any, idx: number) => (
                <tr key={idx} className="border-t border-gray-100">
                  <td className="p-1">{field.name}</td>
                  <td className="p-1">{field.type || 'text'}</td>
                  <td className="p-1">{field.required ? '✓' : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    if (type === 'llm') {
      return (
        <div className="bg-white border border-gray-200 rounded p-2 text-xs">
          <div className="flex justify-between items-center mb-1">
            <div className="font-medium">Schemat AI:</div>
            <div className="text-xs text-blue-500">{path}</div>
          </div>
          <pre className="bg-gray-50 p-2 rounded overflow-x-auto text-[10px]">
            {JSON.stringify(schema, null, 2)}
          </pre>
        </div>
      );
    }
    
    return (
      <div className="text-sm text-gray-500 italic">Nieznany typ schematu</div>
    );
  };

  // Render step's output data
  const renderOutput = (step: any) => {
    const contextPath = step.contextPath;
    if (!contextPath) return (
      <div className="text-sm text-gray-500 italic">Brak ścieżki kontekstu dla danych wyjściowych</div>
    );
    
    const data = getContextValue(contextPath);
    if (!data) return (
      <div className="text-sm text-gray-500 italic">Brak danych wyjściowych pod ścieżką {contextPath}</div>
    );
    
    // Sprawdź, czy dane są puste (pusty obiekt)
    const isEmpty = typeof data === 'object' && Object.keys(data).length === 0;
    if (isEmpty) {
      return (
        <div className="text-sm text-orange-500 italic">
          Ścieżka {contextPath} istnieje, ale nie zawiera jeszcze danych wyjściowych
        </div>
      );
    }
    
    // Renderuj dane w zależności od typu kroku
    if (step.templateId === 'llm-query') {
      return (
        <div className="bg-white border border-gray-200 rounded p-2 text-xs">
          <div className="flex justify-between items-center mb-1">
            <div className="font-medium">Dane wyjściowe AI:</div>
            <div className="text-xs text-blue-500">{contextPath}</div>
          </div>
          <pre className="bg-purple-50 p-2 rounded overflow-x-auto max-h-[200px] text-[10px]">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    }
    
    if (step.templateId === 'form-step') {
      return (
        <div className="bg-white border border-gray-200 rounded p-2 text-xs">
          <div className="flex justify-between items-center mb-1">
            <div className="font-medium">Dane z formularza:</div>
            <div className="text-xs text-blue-500">{contextPath}</div>
          </div>
          <pre className="bg-green-50 p-2 rounded overflow-x-auto max-h-[200px] text-[10px]">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    }
    
    // Domyślny sposób renderowania dla innych typów kroków
    return (
      <div className="bg-white border border-gray-200 rounded p-2 text-xs">
        <div className="flex justify-between items-center mb-1">
          <div className="font-medium">Dane wyjściowe:</div>
          <div className="text-xs text-blue-500">{contextPath}</div>
        </div>
        <pre className="bg-gray-50 p-2 rounded overflow-x-auto max-h-[200px] text-[10px]">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };


  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-row items-end space-x-4">
      {/* Szczegóły kroku - dodatkowe okno */}
      {isOpen && selectedStep !== null && (
        <div className="bg-white shadow-lg border border-gray-300 rounded-lg p-4 mb-2 w-[500px] max-h-[calc(100vh-100px)] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">
              {flowSteps[selectedStep]?.label || `Krok ${selectedStep + 1}`}
            </h3>
            <button 
              onClick={() => setSelectedStep(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          
          {/* Szczegóły wybranego kroku */}
          <div className="space-y-4">
            <div>
              <div className="text-xs font-medium mb-1">Dane wejściowe (schemat):</div>
              {renderSchema(getStepSchema(flowSteps[selectedStep]))}
            </div>
            
            <div>
              <div className="text-xs font-medium mb-1">Dane wyjściowe:</div>
              {renderOutput(flowSteps[selectedStep])}
            </div>
            
            {flowSteps[selectedStep]?.assistantMessage && (
              <div>
                <div className="text-xs font-medium mb-1">Wiadomość:</div>
                <div className="bg-gray-50 p-2 rounded text-xs italic">
                  {flowSteps[selectedStep].assistantMessage}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Główne okno debugera */}
      {isOpen && (
        <div className="bg-white shadow-lg border border-gray-300 rounded-lg p-4 mb-2 w-[400px] max-h-[calc(100vh-100px)] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Debuger szablonu</h3>
            {currentScenario && (
              <div className="text-sm bg-blue-100 px-2 py-1 rounded">
                {currentScenario.name || currentScenario.id}
              </div>
            )}
          </div>
          
          {/* Information box */}
          <div className="mb-4 text-sm p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="font-medium mb-1">Informacje o szablonie:</div>
            <p>
              Ten debuger pokazuje przepływ danych między krokami szablonu.
              Kliknij na dowolny krok, aby zobaczyć szczegóły w oknie obok.
            </p>
          </div>
          
          {/* Special information about schemas */}
          <div className="mb-4 text-sm p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="font-medium mb-1">Schemat danych:</div>
            <p>
              Każdy krok operuje na strukturze danych określonej przez schematy.
              Formularze: <code>formSchemas.*</code>, 
              AI: <code>llmSchemas.*</code>
            </p>
          </div>
          
          {/* Flow steps visualization - uproszczone karty bez rozwijanej zawartości */}
          <div className="relative">
            {flowSteps.length === 0 ? (
              <div className="text-center p-4 text-gray-500">
                Brak kroków w tym szablonie
              </div>
            ) : (
              <div>
                {flowSteps.map((step, index) => {
                  const isActive = selectedStep === index;
                  const stepType = step.type || 'default';
                  const icon = getStepIcon(stepType);
                  
                  return (
                    <React.Fragment key={index}>
                      <div 
                        className={`
                          border ${isActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'} 
                          rounded-lg p-3 mb-2 cursor-pointer hover:bg-gray-50
                        `}
                        onClick={() => setSelectedStep(index)}
                      >
                        <div className="flex items-center mb-1">
                          <div className="text-xl mr-2">{icon}</div>
                          <div className="font-medium">{step.label || `Krok ${index + 1}`}</div>
                          <div className="ml-auto text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                            {getTypeLabel(stepType)}
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-600">
                          {getStepDescription(step)}
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-1">
                          Ścieżka: <code className="bg-gray-100 px-1 rounded font-mono">{step.contextPath || 'brak'}</code>
                        </div>
                      </div>
                      
                      {index < flowSteps.length - 1 && (
                        <div className="flex justify-center items-center h-6 mb-2">
                          <div className="w-0.5 h-full bg-gray-300"></div>
                          <div className="absolute bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">
                            <span className="transform rotate-90">→</span>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="font-medium mb-2 text-sm">Legenda:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center">
                <span className="mr-1">📝</span>
                <span>Formularz</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">🤖</span>
                <span>AI Model</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">🔌</span>
                <span>API</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">📊</span>
                <span>Wizualizacja</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setSelectedStep(null);
          }
        }}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md shadow-md text-sm flex items-center"
      >
        {isOpen ? "Zamknij debuger" : "Debuger szablonu"}
      </button>
    </div>
  );
};

export default DebugPanel;