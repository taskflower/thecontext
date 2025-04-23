// src/tpl/minimal/flowSteps/SummaryStepTemplate.tsx
import React, { useEffect, useState } from "react";
import { FlowStepProps } from "@/types";
import { useContextStore } from "@/hooks/useContextStore";
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";

const SummaryStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode
}) => {
  const [summaryData, setSummaryData] = useState<Record<string, any>>({});
  const [summaryFields, setSummaryFields] = useState<any[]>([]);
  
  const processTemplate = useContextStore((state) => state.processTemplate);
  const currWrkspId = useWorkspaceStore((state) => state.currentWorkspaceId);
  const getContextValue = useContextStore((state) => state.getValueByContextPath);

  const contextSchemas = useContextStore(
    (state) => state.contexts[currWrkspId || ""]?.schemas?.summary
  );

  const processedAssistantMessage = node.assistantMessage
    ? processTemplate(node.assistantMessage)
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
    if (!node.attrs?.dataPaths) {
      return;
    }

    const data: Record<string, any> = {};
    Object.entries(node.attrs.dataPaths).forEach(([key, path]) => {
      if (typeof path === 'string') {
        const value = getContextValue(path);
        if (value !== undefined) {
          data[key] = value;
        }
      }
    });

    setSummaryData(data);
  }, [node.attrs?.dataPaths, getContextValue]);

  // Handle proceeding to next step
  const handleProceed = () => {
    onSubmit(summaryData);
  };

  // Format value for display
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
      return <pre className="text-sm bg-gray-50 p-2 rounded">{JSON.stringify(value, null, 2)}</pre>;
    }
    return String(value);
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
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Podsumowanie</h3>

        {/* Display data paths */}
        {node.attrs?.dataPaths && Object.entries(node.attrs.dataPaths).length > 0 && (
          <div className="space-y-4">
            {Object.entries(summaryData).map(([key, value]) => (
              <div key={key} className="border-b pb-3 last:border-b-0">
                <div className="font-medium text-gray-700 mb-1">{key}</div>
                <div className="pl-2">{formatValue(value)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Display schema fields */}
        {summaryFields.length > 0 && !node.attrs?.dataPaths && (
          <div className="space-y-4">
            {summaryFields.map((field) => (
              <div key={field.name} className="border-b pb-3 last:border-b-0">
                <div className="font-medium text-gray-700 mb-1">{field.name}</div>
                <div className="text-sm text-gray-500">{field.description}</div>
                {summaryData[field.name] && (
                  <div className="pl-2 mt-1">{formatValue(summaryData[field.name])}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <button 
          type="button"
          onClick={onPrevious}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Wstecz
        </button>
        
        <button 
          onClick={handleProceed}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isLastNode ? 'Zakończ' : 'Dalej'}
        </button>
      </div>
    </div>
  );
};

export default SummaryStepTemplate;