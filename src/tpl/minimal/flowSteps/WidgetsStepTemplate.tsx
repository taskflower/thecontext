// src/tpl/minimal/flowSteps/WidgetsStepTemplate.tsx
import React, { useEffect, useState } from "react";
import { FlowStepProps } from "@/types";
import { useContextStore } from "@/hooks/useContextStore";
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";
import { useFlowStep } from "@/hooks/useFlowStep";

import DataDisplayWidget from "../widgets/DataDisplayWidget";
import InfoWidget from "../widgets/InfoWidget";
import StatsWidget from "../widgets/StatsWidget";

const WidgetsStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
  isFirstNode
}) => {
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

  // Pobierz schemat widgetów z kontekstu
  useEffect(() => {
    if (!node.attrs?.schemaPath || !contextStore.contexts || !currWrkspId) return;

    const context = contextStore.contexts[currWrkspId];
    const schemaPathParts = node.attrs.schemaPath.split('.');
    let schemaObj = context;
    
    for (const part of schemaPathParts) {
      if (schemaObj && typeof schemaObj === 'object' && part in schemaObj) {
        schemaObj = schemaObj[part];
      } else {
        schemaObj = null;
        break;
      }
    }
    
    if (schemaObj) setWidgetSchema(schemaObj);
  }, [node.attrs?.schemaPath, contextStore.contexts, currWrkspId]);

  // Pobierz dane dla widgetów z kontekstu
  useEffect(() => {
    if (!node.attrs?.dataPaths || !contextStore.contexts || !currWrkspId) return;

    const context = contextStore.contexts[currWrkspId];
    const result: Record<string, any> = {};
    
    Object.entries(node.attrs.dataPaths).forEach(([key, path]) => {
      if (typeof path === 'string') {
        const pathParts = path.split('.');
        let value = context;
        
        for (const part of pathParts) {
          if (value && typeof value === 'object' && part in value) {
            value = value[part];
          } else {
            value = undefined;
            break;
          }
        }
        
        result[key] = value !== undefined ? value : null;
      }
    });
    
    setWidgetData(result);
  }, [node.attrs?.dataPaths, contextStore.contexts, currWrkspId]);

  // Pobierz wartość z danych na podstawie ścieżki dataPath
  const getValueFromDataPath = (dataPath: string) => {
    if (!dataPath) return null;
    
    // Sprawdź, czy ścieżka zawiera kropkę (wskazuje na zagnieżdżoną wartość)
    if (dataPath.includes('.')) {
      const [contextKey, fieldKey] = dataPath.split('.');
      return widgetData[contextKey] && widgetData[contextKey][fieldKey] 
        ? widgetData[contextKey][fieldKey] 
        : null;
    }
    
    // Jeśli nie, pobierz bezpośrednio z widgetData
    return widgetData[dataPath] || null;
  };

  // Pobierz dane z wielu ścieżek (dla widgetów z wieloma dataPath)
  const getMultipleValuesFromDataPaths = (dataPaths: Record<string, string>) => {
    const result: Record<string, any> = {};
    
    Object.entries(dataPaths).forEach(([key, path]) => {
      result[key] = getValueFromDataPath(path);
    });
    
    return result;
  };

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
      const data = dataPath ? getValueFromDataPath(dataPath) : null;
      const multiData = dataPaths ? getMultipleValuesFromDataPaths(dataPaths) : null;
      
      // Renderuj odpowiedni widget na podstawie typu
      switch (type) {
        case 'title':
          return (
            <div key={index} className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
            </div>
          );
        
        case 'cardList':
          // Obsługa listy kart
          if (!Array.isArray(data)) return null;
          
          return (
            <div key={index} className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">{title}</h3>
              <DataDisplayWidget
                title={title}
                data={data}
                type="list"
              />
            </div>
          );
        
        case 'value':
          // Obsługa pojedynczych wartości
          return (
            <div key={index} className="mb-6">
              <DataDisplayWidget
                title={title}
                data={{ [title]: data }}
                type="keyValue"
              />
            </div>
          );
          
        case 'stats':
          // Jeśli typ to 'stats', użyj StatsWidget
          if (multiData) {
            // Jeśli mamy dane z wielu ścieżek
            return (
              <div key={index} className="mb-6">
                <StatsWidget
                  title={title}
                  description={widget.description}
                  stats={Object.entries(multiData).map(([key, value]) => ({
                    label: key,
                    value: value as any
                  }))}
                />
              </div>
            );
          } else if (typeof data !== 'object' || data === null) {
            // Jeśli dane są proste (nie obiekt)
            return (
              <div key={index} className="mb-6">
                <StatsWidget
                  title={title}
                  stats={[{
                    label: title,
                    value: data as any
                  }]}
                />
              </div>
            );
          } else {
            // Jeśli dane są obiektem
            return (
              <div key={index} className="mb-6">
                <StatsWidget
                  title={title}
                  stats={Object.entries(data).map(([key, value]) => ({
                    label: key,
                    value: value as any
                  }))}
                />
              </div>
            );
          }
          
        case 'info':
          // Jeśli typ to 'info', użyj InfoWidget
          return (
            <div key={index} className="mb-6">
              <InfoWidget
                title={title}
                content={data}
                variant={widget.variant || 'default'}
              />
            </div>
          );
          
        default:
          // Domyślnie, jeśli typ nie jest rozpoznany, wyświetl dane jako obiekt
          return (
            <div key={index} className="mb-6">
              <DataDisplayWidget
                title={title}
                data={data || multiData}
                type={Array.isArray(data) ? "list" : "object"}
              />
            </div>
          );
      }
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
        {renderWidgets()}
      </div>

      {/* Przyciski nawigacji - uproszczone */}
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