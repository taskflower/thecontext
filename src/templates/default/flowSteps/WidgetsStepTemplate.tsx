// src/templates/default/flowSteps/WidgetsStepTemplate.tsx
import React, { useEffect, useState, useMemo } from "react";
import { FlowStepProps } from "@/types";
import { useFlowStep, useComponentLoader } from "@/hooks";
import { getValueByPath } from "@/utils"; // Zaimportuj z ujednoliconych utils
import { useAppStore } from "@/useAppStore";

const WidgetsStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
  isFirstNode
}) => {
  const [widgetData, setWidgetData] = useState<Record<string, any>>({});
  const [widgetSchema, setWidgetSchema] = useState<Record<string, any>>({});
  
  // Pobierz dane ze scentralizowanego store
  const { 
    data: { currentWorkspaceId, contexts },
    processTemplate,
    getContextPath
  } = useAppStore();
  
  // Użyj nowego hooka do obsługi nawigacji i przepływu
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

  // Przetwórz wiadomość asystenta
  const processedAssistantMessage = node.assistantMessage
    ? processTemplate(node.assistantMessage)
    : "";

  // Pobieranie kontekstu dla bieżącego workspace
  const context = useMemo(() => 
    currentWorkspaceId ? contexts[currentWorkspaceId] || {} : {},
    [currentWorkspaceId, contexts]
  );

  // Funkcja do parsowania ścieżek danych, obsługująca odwołania między scenariuszami
  const resolveDataPath = (path: string) => {
    if (!path || !context) return null;
    
    // Sprawdź, czy ścieżka zawiera odwołanie do innego scenariusza
    if (path.includes('.')) {
      const segments = path.split('.');
      
      // Jeśli pierwsza część zawiera "scenario-", to jest to odwołanie do innego scenariusza
      if (segments[0].startsWith('scenario-')) {
        const scenarioId = segments[0];
        // Pobierz dane z kontekstu dla tego scenariusza
        const scenarioData = context[scenarioId];
        
        if (!scenarioData) return null;
        
        // Usuń pierwszy segment (scenarioId) i pobierz dane z pozostałej ścieżki
        const remainingPath = segments.slice(1).join('.');
        return getValueByPath(scenarioData, remainingPath);
      }
    }
    
    // Standardowa ścieżka w aktualnym kontekście
    return getContextPath(path);
  };

  // Pobierz schemat widgetów z kontekstu
  useEffect(() => {
    if (!node.attrs?.schemaPath || !context) return;

    const schemaObj = getContextPath(node.attrs.schemaPath);
    if (schemaObj) setWidgetSchema({ widgets: schemaObj });
  }, [node.attrs?.schemaPath, context, getContextPath]);

  // Pobierz dane dla widgetów z kontekstu
  useEffect(() => {
    if (!node.attrs?.dataPaths || !context) return;

    const result: Record<string, any> = {};
    
    Object.entries(node.attrs.dataPaths).forEach(([key, path]) => {
      if (typeof path === 'string') {
        const value = resolveDataPath(path);
        result[key] = value !== undefined ? value : null;
      }
    });
    
    setWidgetData(result);
  }, [node.attrs?.dataPaths, context]);

  // Używamy nowego hooka do ładowania widgetów
  const { component: DataDisplayWidget } = useComponentLoader('widget', 'DataDisplay');
  const { component: MetricsWidget } = useComponentLoader('widget', 'Metrics');
  const { component: StatsWidget } = useComponentLoader('widget', 'Stats');
  const { component: InfoWidget } = useComponentLoader('widget', 'Info');
  const { component: CardListWidget } = useComponentLoader('widget', 'CardList');

  // Mapowanie typów widgetów do komponentów
  const widgetComponents = useMemo(() => ({
    'dataDisplay': DataDisplayWidget,
    'metrics': MetricsWidget,
    'stats': StatsWidget,
    'info': InfoWidget,
    'cardList': CardListWidget,
    // Dodaj mapowanie nazw alternatywnych
    'data-display': DataDisplayWidget,
    'card-list': CardListWidget
  }), [DataDisplayWidget, MetricsWidget, StatsWidget, InfoWidget, CardListWidget]);

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
      const lowerType = type.toLowerCase();
      
      // Spróbuj znaleźć komponent dla danego typu
      let WidgetComponent = widgetComponents[lowerType];
      
      // Próby alternatywnych nazw
      if (!WidgetComponent && lowerType.includes('-')) {
        // Konwersja kebab-case na camelCase
        const camelCaseType = lowerType.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
        WidgetComponent = widgetComponents[camelCaseType];
      }
      
      // Jeśli nadal nie znaleziono, użyj DataDisplayWidget jako fallback
      if (!WidgetComponent) {
        WidgetComponent = widgetComponents['dataDisplay'];
        
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

  // Sprawdź, czy wszystkie niezbędne widgety zostały załadowane
  const areWidgetsReady = Object.values(widgetComponents).some(comp => comp !== null);

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
        {areWidgetsReady ? renderWidgets() : (
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