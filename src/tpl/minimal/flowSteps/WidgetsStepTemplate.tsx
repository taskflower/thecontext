// src/tpl/minimal/flowSteps/WidgetsStepTemplate.tsx
import React, { useEffect, useState } from "react";
import { FlowStepProps } from "@/types";
import { useContextStore } from "@/hooks/useContextStore";
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";
import { useNavigate, useParams } from "react-router-dom";

// Simple widget components
const TitleWidget = ({ title, data }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
  </div>
);

const CardListWidget = ({ title, data, path }) => (
  <div className="mb-6">
    <h3 className="text-lg font-medium text-gray-700 mb-3">{title}</h3>
    {Array.isArray(data) ? (
      <div className="bg-gray-50 rounded-lg border border-gray-100">
        <ul className="divide-y divide-gray-200">
          {data.map((item, idx) => (
            <li key={idx} className="p-4">
              {typeof item === 'object' ? JSON.stringify(item) : String(item)}
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-gray-500 italic">
        Brak danych do wyświetlenia
      </div>
    )}
  </div>
);

const ValueWidget = ({ title, data, path }) => (
  <div className="mb-6">
    <h3 className="text-lg font-medium text-gray-700 mb-2">{title}</h3>
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
      {data !== undefined && data !== null ? 
        <span className="text-gray-800 font-medium">{String(data)}</span> : 
        <span className="text-gray-500 italic">Brak danych</span>
      }
    </div>
  </div>
);

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
  const navigate = useNavigate();
  const { application, workspace } = useParams();

  const processedAssistantMessage = node.assistantMessage
    ? contextStore.processTemplate 
      ? contextStore.processTemplate(node.assistantMessage)
      : node.assistantMessage
    : "";

  // Fetch widget schema
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

  // Fetch data from context
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

  // Navigation handlers
  const handlePrevious = () => {
    if (isFirstNode) {
      if (application && workspace) {
        navigate(`/app/${application}/${workspace}`);
      } else if (workspace) {
        navigate(`/${workspace}`);
      } else {
        navigate('/');
      }
    } else {
      onPrevious();
    }
  };

  const handleComplete = () => {
    onSubmit(widgetData);
    
    if (isLastNode) {
      if (application && workspace) {
        navigate(`/app/${application}/${workspace}`);
      } else if (workspace) {
        navigate(`/${workspace}`);
      }
    }
  };

  // Render widgets based on schema
  const renderWidgets = () => {
    if (!widgetSchema.widgets || !Array.isArray(widgetSchema.widgets)) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-gray-500">Brak widgetów do wyświetlenia</p>
        </div>
      );
    }

    return widgetSchema.widgets.map((widget, index) => {
      const { type, title, dataPath } = widget;
      
      // Find data for this widget
      let data = null;
      if (dataPath) {
        const [contextKey, fieldKey] = dataPath.split('.');
        if (widgetData[contextKey] && fieldKey) {
          data = widgetData[contextKey][fieldKey];
        } else {
          data = widgetData[dataPath];
        }
      }
      
      // Render appropriate widget based on type
      switch (type) {
        case 'title':
          return <TitleWidget key={index} title={title} data={data} />;
        case 'cardList':
          return <CardListWidget key={index} title={title} data={data} path={dataPath} />;
        case 'value':
          return <ValueWidget key={index} title={title} data={data} path={dataPath} />;
        default:
          return null;
      }
    });
  };

  return (
    <div className="my-6">
      {processedAssistantMessage && (
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 mb-6">
          <p className="text-gray-700 leading-relaxed">{processedAssistantMessage}</p>
        </div>
      )}

      <div className="mb-6">
        {renderWidgets()}
      </div>

      <div className="flex gap-3 mt-8">
        <button 
          onClick={handlePrevious}
          className="px-5 py-2.5 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
        >
          {isFirstNode ? "Anuluj" : "Wstecz"}
        </button>
        
        <button 
          onClick={handleComplete}
          className="px-5 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-sm"
        >
          {isLastNode ? 'Zakończ' : 'Dalej'}
        </button>
      </div>
    </div>
  );
};

export default WidgetsStepTemplate;