// src/templates/default/flowSteps/SummaryStepTemplate.tsx
import React, { useEffect, useState } from "react";
import { FlowStepProps } from "@/types";
import { useContextStore } from "@/hooks/useContextStore";
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";
import { useNavigate, useParams } from "react-router-dom"; // Dodajemy import

const SummaryStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode
}) => {
  const [summaryData, setSummaryData] = useState<Record<string, any>>({});
  const [summaryFields, setSummaryFields] = useState<any[]>([]);
  
  const contextStore = useContextStore();
  const currWrkspId = useWorkspaceStore((state) => state.currentWorkspaceId);
  const navigate = useNavigate(); // Dodajemy hook nawigacji
  const { application, workspace } = useParams(); // Dodajemy hook parametrów

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

  // Format value for display based on schema
  const formatValue = (value: any) => {
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside">
          {value.map((item, index) => (
            <li key={index} className="text-gray-700">{String(item)}</li>
          ))}
        </ul>
      );
    } else if (typeof value === 'object' && value !== null) {
      return (
        <div className="space-y-2">
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey} className="ml-4">
              <span className="font-medium text-gray-700">{subKey}:</span> {" "}
              <span className="text-gray-700">
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

  // Zmodyfikowana funkcja handleSubmit z dodaną nawigacją
  const handleSubmit = () => {
    // Najpierw przekazujemy dane do rodzica
    onSubmit(summaryData);
    
    // Jeśli to ostatni krok, nawigujemy z powrotem do listy scenariuszy
    if (isLastNode) {
      if (application && workspace) {
        navigate(`/app/${application}/${workspace}`);
      } else if (workspace) {
        navigate(`/${workspace}`);
      } else {
        navigate('/'); // Domyślnie nawigujemy do strony głównej
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Assistant message */}
      {processedAssistantMessage && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-blue-800">{processedAssistantMessage}</p>
        </div>
      )}

      {/* Debugging info if no fields */}
      {summaryFields.length === 0 && !node.attrs?.dataPaths && (
        <div className="bg-yellow-100 p-4 rounded-lg mb-6">
          <p className="text-yellow-800">Nie znaleziono schematu podsumowania. Sprawdź konfigurację.</p>
          <pre className="mt-2 text-xs">
            Schema path: {node.attrs?.schemaPath}
            Workspace ID: {currWrkspId}
            Available schemas: {JSON.stringify(Object.keys(contextSchemas || {}))}
          </pre>
        </div>
      )}

      {/* Summary display */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Podsumowanie</h3>

        {/* Display data paths based on schema */}
        {node.attrs?.dataPaths && Object.entries(node.attrs.dataPaths).length > 0 && (
          <div className="space-y-4">
            {Object.entries(summaryData).map(([key, value]) => (
              <div key={key} className="border-b pb-3 last:border-b-0">
                <div className="font-medium text-lg mb-2">{key}</div>
                <div className="ml-2">
                  {Array.isArray(value) ? (
                    <ul className="list-disc list-inside pl-2">
                      {(value as any[]).map((item, index) => (
                        <li key={index} className="text-gray-700 mb-1">
                          {typeof item === 'object' 
                            ? Object.entries(item).map(([itemKey, itemValue]) => (
                                <div key={itemKey} className="ml-4">
                                  <strong>{itemKey}:</strong> {String(itemValue)}
                                </div>
                              ))
                            : String(item)
                          }
                        </li>
                      ))}
                    </ul>
                  ) : typeof value === 'object' && value !== null ? (
                    <div className="space-y-2 pl-2">
                      {Object.entries(value).map(([subKey, subValue]) => (
                        <div key={subKey} className="mb-2">
                          <span className="font-medium text-gray-800">{subKey}:</span> {" "}
                          <span className="text-gray-700">
                            {typeof subValue === "object" && subValue !== null
                              ? Array.isArray(subValue)
                                ? (
                                  <ul className="list-disc list-inside ml-4">
                                    {(subValue as any[]).map((item, idx) => (
                                      <li key={idx} className="text-gray-700">{String(item)}</li>
                                    ))}
                                  </ul>
                                )
                                : JSON.stringify(subValue)
                              : String(subValue)
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-700">{String(value)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Display schema fields with better formatting */}
        {summaryFields.length > 0 && !node.attrs?.dataPaths && (
          <div className="space-y-4">
            {summaryFields.map((field) => (
              <div key={field.name} className="border-b pb-3 last:border-b-0">
                <div className="font-medium text-lg mb-1">{field.name}</div>
                <div className="text-sm text-gray-600 mb-2">{field.description}</div>
                {summaryData[field.name] && (
                  <div className="ml-2 mt-1">{formatValue(summaryData[field.name])}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button 
          onClick={onPrevious}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Wstecz
        </button>
        
        <button 
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isLastNode ? 'Zakończ' : 'Dalej'}
        </button>
      </div>
    </div>
  );
};

export default SummaryStepTemplate;