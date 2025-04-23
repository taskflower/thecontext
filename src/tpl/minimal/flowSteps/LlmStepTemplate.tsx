// src/templates/minimal/flowSteps/LlmStepTemplate.tsx
import React from "react";
import { FlowStepProps } from "@/types";
import { useLLM } from "@/hooks/useLLM";

const LlmStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
}) => {
  const {
    sendMessage,
    isLoading,
    error,
    responseData,
    processedAssistantMessage,
  } = useLLM({
    assistantMessage: node.assistantMessage || "",
    initialUserMessage: node.attrs?.initialUserMessage || "",
    schemaPath: node.attrs?.schemaPath || "",
    autoStart: true,
    onDataSaved: (data) => {
      onSubmit(data);
    },
  });

  return (
    <div className="my-4">
      <div className="plugin-wrapper border-0">
        <div className="plugin-content">
          {processedAssistantMessage && (
            <div className="bg-primary/5 p-4 rounded-lg mb-6">
              <p className="text-primary">{processedAssistantMessage}</p>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 p-4 rounded-lg">
              <p className="text-destructive">Wystąpił błąd: {error}</p>
            </div>
          )}

          {responseData && (
            <div className="bg-background border rounded-lg p-4 mt-6">
              <h3 className="text-lg font-semibold mb-4">Wyniki analizy</h3>
              <div className="space-y-3">
                {Object.entries(responseData).map(([key, value]) => (
                  <div key={key} className="border-b pb-3 last:border-b-0">
                    <span className="font-medium">{key}:</span>
                    {Array.isArray(value) ? (
                      <ul className="list-disc list-inside mt-2">
                        {(value as string[]).map((item, index) => (
                          <li key={index} className="text-muted-foreground">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="ml-2 text-muted-foreground">
                        {typeof value === "object"
                          ? JSON.stringify(value, null, 2)
                          : String(value)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {responseData && (
            <div className="mt-6">
              <button
                onClick={() => onSubmit(responseData)}
                className="px-5 py-3 rounded-md transition-colors text-base font-medium w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLastNode ? "Zakończ" : "Dalej"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LlmStepTemplate;