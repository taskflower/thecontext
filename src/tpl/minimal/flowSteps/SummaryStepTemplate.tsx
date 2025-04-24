// src/tpl/minimal/flowSteps/SummaryStepTemplate.tsx
import React, { useEffect, useState } from "react";
import { FlowStepProps } from "@/types";
import { useContextStore } from "@/hooks/useContextStore";
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";
import { useNavigate, useParams } from "react-router-dom";

const SummaryStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
  isFirstNode
}) => {
  const [summaryData, setSummaryData] = useState<Record<string, any>>({});
  const [summaryFields, setSummaryFields] = useState<any[]>([]);
  
  const contextStore = useContextStore();
  const currWrkspId = useWorkspaceStore((state) => state.currentWorkspaceId);
  const navigate = useNavigate();
  const { application, workspace } = useParams();

  const contextSchemas = contextStore.contexts && currWrkspId 
    ? contextStore.contexts[currWrkspId]?.schemas?.summary 
    : null;

  const processedAssistantMessage = node.assistantMessage
    ? contextStore.processTemplate 
      ? contextStore.processTemplate(node.assistantMessage)
      : node.assistantMessage
    : "";

  // Load summary fields based on schema path
  useEffect(() => {
    if (!contextSchemas || !node.attrs?.schemaPath) {
      console.warn("No schema or schema path found for summary");
      setSummaryFields([]);
      return;
    }

    const schemaKey = node.attrs.schemaPath.replace(/^schemas\.summary\./, "");
    const fields = contextSchemas[schemaKey];

    if (fields) {
      // Convert the schema object to array of fields for rendering
      const fieldArray = Object.entries(fields).map(([key, description]) => ({
        name: key,
        description: description
      }));
      setSummaryFields(fieldArray);
    } else {
      console.warn("No fields found for summary schema:", schemaKey);
      setSummaryFields([]);
    }
  }, [contextSchemas, node.attrs?.schemaPath]);

  // Load data from context paths
  useEffect(() => {
    if (!node.attrs?.dataPaths || !contextStore.contexts || !currWrkspId) {
      return;
    }

    const data: Record<string, any> = {};
    const context = contextStore.contexts[currWrkspId];
    
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
        
        if (value !== undefined) {
          data[key] = value;
        }
      }
    });

    setSummaryData(data);
  }, [node.attrs?.dataPaths, contextStore.contexts, currWrkspId]);

  // Handle back navigation based on whether it's the first node
  const handlePrevious = () => {
    if (isFirstNode) {
      // Navigate back to scenarios list
      if (application && workspace) {
        navigate(`/app/${application}/${workspace}`);
      } else if (workspace) {
        navigate(`/${workspace}`);
      } else {
        navigate('/');
      }
    } else {
      // Use provided onPrevious handler
      onPrevious();
    }
  };

  // Handle flow completion
  const handleComplete = () => {
    // Call onSubmit to save any data
    onSubmit(summaryData);
    
    // If this is the last node (which it typically would be for summary), 
    // navigate back to scenarios
    if (isLastNode) {
      if (application && workspace) {
        navigate(`/app/${application}/${workspace}`);
      } else if (workspace) {
        navigate(`/${workspace}`);
      }
    }
  };

  // Format value for display based on schema
  const formatValue = (value: any) => {
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside">
          {value.map((item, index) => (
            <li key={index} className="text-gray-600">{String(item)}</li>
          ))}
        </ul>
      );
    } else if (typeof value === 'object' && value !== null) {
      return (
        <div className="space-y-2">
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey}>
              <span className="font-medium text-gray-800">{subKey}:</span> {" "}
              <span className="text-gray-600">
                {typeof subValue === "object"
                  ? JSON.stringify(subValue)
                  : String(subValue)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return String(value);
  };

  return (
    <div className="my-4">
      <div className="border-0">
        <div className="w-full">
          {/* Assistant message */}
          {processedAssistantMessage && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-gray-800">{processedAssistantMessage}</p>
            </div>
          )}

          {/* Debugging info if no fields */}
          {summaryFields.length === 0 && !node.attrs?.dataPaths && (
            <div className="bg-yellow-50 p-4 rounded-lg mb-6">
              <p className="text-yellow-700">Nie znaleziono schematu podsumowania. Sprawdź konfigurację.</p>
              <pre className="mt-2 text-xs">
                Schema path: {node.attrs?.schemaPath}
                Workspace ID: {currWrkspId}
                Available schemas: {JSON.stringify(Object.keys(contextSchemas || {}))}
              </pre>
            </div>
          )}

          {/* Summary display */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Podsumowanie</h3>

            {/* Display data paths */}
            {node.attrs?.dataPaths && Object.entries(node.attrs.dataPaths).length > 0 && (
              <div className="space-y-4">
                {Object.entries(summaryData).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <div className="font-medium text-gray-900 mb-1">{key}</div>
                    <div className="pl-2">{formatValue(value)}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Wyświetlanie danych z responseData dla kroku LLM */}
            {node.contextPath && node.contextPath.includes('generate-report') && (
              <div className="space-y-4">
                {summaryData && Object.entries(summaryData).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <div className="font-medium text-gray-900 mb-1">{key}</div>
                    <div className="pl-2">
                      {Array.isArray(value) ? (
                        <ul className="list-disc list-inside">
                          {(value as string[]).map((item, index) => (
                            <li key={index} className="text-gray-600">{item}</li>
                          ))}
                        </ul>
                      ) : typeof value === 'object' && value !== null ? (
                        <div className="space-y-2">
                          {Object.entries(value).map(([subKey, subValue]) => (
                            <div key={subKey} className="ml-2">
                              <span className="font-medium text-gray-700">{subKey}:</span> {" "}
                              <span className="text-gray-600">
                                {typeof subValue === "object"
                                  ? JSON.stringify(subValue)
                                  : String(subValue)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-600">{String(value)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Display schema fields */}
            {summaryFields.length > 0 && !node.attrs?.dataPaths && (
              <div className="space-y-4">
                {summaryFields.map((field) => (
                  <div key={field.name} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <div className="font-medium text-gray-900 mb-1">{field.name}</div>
                    <div className="text-sm text-gray-500">{field.description}</div>
                    {summaryData[field.name] && (
                      <div className="pl-2 mt-1">{formatValue(summaryData[field.name])}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            {/* Back button */}
            <button 
              onClick={handlePrevious}
              className="px-5 py-3 rounded-md transition-colors text-base font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              {isFirstNode ? "Anuluj" : "Wstecz"}
            </button>
            
            {/* Complete button */}
            <button 
              onClick={handleComplete}
              className="px-5 py-3 rounded-md transition-colors text-base font-medium flex-grow bg-gray-900 text-white hover:bg-gray-800"
            >
              {isLastNode ? 'Zakończ' : 'Dalej'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryStepTemplate;