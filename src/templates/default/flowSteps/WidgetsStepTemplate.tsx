// Modyfikacja w WidgetsStepTemplate.tsx
import React, { useEffect, useState, useMemo } from "react";
import { FlowStepProps } from "@/types";
import { useContextStore, useFlowStep, useWorkspaceStore } from "@/hooks";

const WidgetsStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
  isFirstNode
}) => {
  const [widgetComponents, setWidgetComponents] = useState<Record<string, React.ComponentType<any>>>({});
  const [widgetData, setWidgetData] = useState<Record<string, any>>({});
  const [widgetSchema, setWidgetSchema] = useState<Record<string, any>>({});
  
  const contextStore = useContextStore();
  const currWrkspId = useWorkspaceStore((state) => state.currentWorkspaceId);
  
  // Hook do obsługi nawigacji i przepływu
  const {
    handlePrevious,
    handleComplete
  } = useFlowStep({
    node,
    isFirstNode,
    isLastNode,
    onSubmit,
    onPrevious
  });

  const processedAssistantMessage = node.assistantMessage
    ? contextStore.processTemplate 
      ? contextStore.processTemplate(node.assistantMessage)
      : node.assistantMessage
    : "";

  // Dynamicznie ładuj komponenty widgetów
  useEffect(() => {
    const loadWidgetComponents = async () => {
      try {
        // Używamy import.meta.glob do dynamicznego ładowania wszystkich widgetów
        const modules = import.meta.glob('../widgets/*.tsx');
        const components: Record<string, React.ComponentType<any>> = {};
        
        // Dla każdego modułu, załaduj komponent i przypisz go do typu widgetu
        for (const path in modules) {
          const widgetName = path.split('/').pop()?.replace('.tsx', '') || '';
          // Przekształć nazwy plików na typy widgetów (np. DataDisplayWidget -> dataDisplay)
          const widgetType = widgetName.replace('Widget', '').toLowerCase();
          
          try {
            const module = await modules[path]();
            if (module.default) {
              components[widgetType] = module.default;
              
              // Dodaj też mapowanie dla oryginalnej nazwy pliku (bez .tsx) jako fallback
              components[widgetName] = module.default;
            }
          } catch (error) {
            console.error(`Błąd ładowania widgetu ${widgetName}:`, error);
          }
        }
        
        setWidgetComponents(components);
      } catch (error) {
        console.error("Błąd ładowania komponentów widgetów:", error);
      }
    };

    loadWidgetComponents();
  }, []);

  // Funkcja do parsowania ścieżek danych, obsługująca odwołania między scenariuszami
  const resolveDataPath = (path: string) => {
    if (!path || !contextStore.contexts || !currWrkspId) return null;
    
    // Sprawdź czy ścieżka zawiera odwołanie do innego scenariusza
    if (path.includes('.')) {
      const segments = path.split('.');
      
      // Jeśli pierwsza część zawiera "scenario-", to jest to odwołanie do innego scenariusza
      if (segments[0].startsWith('scenario-')) {
        const scenarioId = segments[0];
        // Pobierz dane z kontekstu dla tego scenariusza
        const scenarioData = contextStore.contexts[currWrkspId][scenarioId];
        
        if (!scenarioData) return null;
        
        // Usuń pierwszy segment (scenarioId) i pobierz dane z pozostałej ścieżki
        const remainingPath = segments.slice(1).join('.');
        return contextUtils.getValueByPath(scenarioData, remainingPath);
      }
    }
    
    // Standardowa ścieżka w aktualnym kontekście
    return contextStore.getContextPath(path);
  };

  // Pobierz schemat widgetów z kontekstu
  useEffect(() => {
    if (!node.attrs?.schemaPath || !contextStore.contexts || !currWrkspId) return;

    const schemaObj = contextStore.getContextPath(node.attrs.schemaPath);
    if (schemaObj) setWidgetSchema({ widgets: schemaObj });
  }, [node.attrs?.schemaPath, contextStore.contexts, currWrkspId, contextStore.getContextPath]);

  // Pobierz dane dla widgetów z kontekstu
  useEffect(() => {
    if (!node.attrs?.dataPaths || !contextStore.contexts || !currWrkspId) return;

    const result: Record<string, any> = {};
    
    Object.entries(node.attrs.dataPaths).forEach(([key, path]) => {
      if (typeof path === 'string') {
        const value = resolveDataPath(path);
        result[key] = value !== undefined ? value : null;
      }
    });
    
    setWidgetData(result);
  }, [node.attrs?.dataPaths, contextStore.contexts, currWrkspId]);

  // Renderuj widgety na podstawie schematu
  const renderWidgets = () => {
    if (!widgetSchema.widgets || !Array.isArray(widgetSchema.widgets)) {
      return (
        <div className="py-6 px-4 bg-yellow-50 border border-yellow-100 rounded-lg">
          <p className="text-yellow-700 text-sm">Brak skonfigurowanych widgetów do wyświetlenia.</p>
        </div>
      );
    }

    return widgetSchema.widgets.map((widget: any, index: number) => {
      const { type, title, dataPath, dataPaths } = widget;
      
      // Pobierz dane dla tego widgetu
      const data = dataPath ? resolveDataPath(dataPath) : null;
      const multiData = dataPaths ? 
        Object.entries(dataPaths).reduce((acc, [key, path]) => {
          acc[key] = resolveDataPath(path as string);
          return acc;
        }, {} as Record<string, any>) : null;
      
      // W przypadku tytułu, renderuj prosty nagłówek
      if (type === 'title') {
        return (
          <div key={index} className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          </div>
        );
      }
      
      // Dla innych typów, znajdź odpowiedni komponent
      // Spróbuj znaleźć komponent dla danego typu
      let WidgetComponent = widgetComponents[type.toLowerCase()];
      
      // Jeśli nie znaleziono, spróbuj z różnymi wariantami nazwy
      if (!WidgetComponent && type.includes('-')) {
        // Konwersja kebab-case na camelCase
        const camelCaseType = type.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        WidgetComponent = widgetComponents[camelCaseType];
      }
      
      if (!WidgetComponent && !type.toLowerCase().endsWith('widget')) {
        // Spróbuj dodać "Widget" na końcu
        WidgetComponent = widgetComponents[`${type.toLowerCase()}Widget`];
      }
      
      // Jeśli nadal nie znaleziono, użyj DataDisplayWidget jako fallback
      if (!WidgetComponent) {
        WidgetComponent = widgetComponents['dataDisplay'] || widgetComponents['DataDisplayWidget'];
        
        if (!WidgetComponent) {
          console.warn(`Nie znaleziono komponentu dla typu '${type}'`);
          return (
            <div key={index} className="mb-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-700">Nieznany typ widgetu: {type}</p>
            </div>
          );
        }
      }
      
      // Przygotuj props dla komponentu
      const widgetProps = {
        ...widget,
        title,
        data: data || multiData || widget.data || {},
      };
      
      return (
        <div key={index} className="mb-6">
          <WidgetComponent {...widgetProps} />
        </div>
      );
    });
  };

  return (
    <div>
      {/* Wiadomość asystenta */}
      {processedAssistantMessage && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-700">{processedAssistantMessage}</p>
        </div>
      )}

      {/* Widgety */}
      <div className="space-y-6">
        {Object.keys(widgetComponents).length > 0 ? renderWidgets() : (
          <div className="py-6 px-4 bg-gray-50 border border-gray-100 rounded-lg">
            <p className="text-gray-700 text-sm">Ładowanie widgetów...</p>
          </div>
        )}
      </div>

      {/* Przyciski nawigacji */}
      <div className="flex gap-3 mt-8 pb-4">
        <button 
          onClick={handlePrevious}
          className="px-5 py-2.5 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
        >
          {isFirstNode ? "Anuluj" : "Wstecz"}
        </button>
        
        <button 
          onClick={() => handleComplete(widgetData)}
          className="px-5 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-sm"
        >
          {isLastNode ? 'Zakończ' : 'Dalej'}
        </button>
      </div>
    </div>
  );
};

export default WidgetsStepTemplate;