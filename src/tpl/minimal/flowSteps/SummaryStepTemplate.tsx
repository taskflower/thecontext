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

  // Format value for display
  const formatValue = (value: any) => {
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside">
          {value.map((item, index) => (
            <li key={index} className="text-muted-foreground">{String(item)}</li>
          ))}
        </ul>
      );
    } else if (typeof value === 'object' && value !== null) {
      return <pre className="text-sm bg-muted p-2 rounded">{JSON.stringify(value, null, 2)}</pre>;
    }
    return String(value);
  };

  return (
    <div className="my-4">
      <div className="plugin-wrapper border-0">
        <div className="plugin-content">
          {/* Assistant message */}
          {processedAssistantMessage && (
            <div className="bg-primary/5 p-4 rounded-lg mb-6">
              <p className="text-primary">{processedAssistantMessage}</p>
            </div>
          )}

          {/* Debugging info if no fields */}
          {summaryFields.length === 0 && !node.attrs?.dataPaths && (
            <div className="bg-warning/10 p-4 rounded-lg mb-6">
              <p className="text-warning">Nie znaleziono schematu podsumowania. Sprawdź konfigurację.</p>
              <pre className="mt-2 text-xs">
                Schema path: {node.attrs?.schemaPath}
                Workspace ID: {currWrkspId}
                Available schemas: {JSON.stringify(Object.keys(contextSchemas || {}))}
              </pre>
            </div>
          )}

          {/* Summary display */}
          <div className="bg-background border border-border rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4">Podsumowanie</h3>

            {/* Display data paths */}
            {node.attrs?.dataPaths && Object.entries(node.attrs.dataPaths).length > 0 && (
              <div className="space-y-4">
                {Object.entries(summaryData).map(([key, value]) => (
                  <div key={key} className="border-b pb-3 last:border-b-0">
                    <div className="font-medium text-foreground mb-1">{key}</div>
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
                    <div className="font-medium text-foreground mb-1">{field.name}</div>
                    <div className="text-sm text-muted-foreground">{field.description}</div>
                    {summaryData[field.name] && (
                      <div className="pl-2 mt-1">{formatValue(summaryData[field.name])}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            <button 
              onClick={onSubmit}
              className="px-5 py-3 rounded-md transition-colors text-base font-medium w-full bg-primary text-primary-foreground hover:bg-primary/90"
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