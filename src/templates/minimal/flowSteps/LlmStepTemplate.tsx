// src/templates/minimal/flowSteps/LlmStepTemplate.tsx
import React, { useEffect } from "react";
import { FlowStepProps } from "../../baseTemplate";
import { useLlmWithZod } from "@/hooks/useLLM";
import { useAppStore } from "@/lib/store";

const LlmStepTemplate: React.FC<FlowStepProps> = ({ node, onSubmit }) => {
  const { sendMessage, isLoading, error, responseData, processedAssistantMessage } =
    useLlmWithZod({
      assistantMessage: node.assistantMessage || "",
      systemMessage: node.attrs.includeSystemMessage ? useAppStore.getState().getCurrentScenario().systemMessage : "",
      initialUserMessage: node.attrs.initialUserMessage,
      schemaPath: node.attrs.schemaPath,
      contextPath: node.contextPath,
      autoStart: true,
      onDataSaved: (data) => {
        onSubmit(data);
      },
    });

  useEffect(() => {
    if (node.attrs.autoStart) sendMessage(node.attrs.initialUserMessage || "");
  }, []);

  return (
    <div className="p-4">
      {isLoading && <p>Ładowanie...</p>}
      {error && <p className="text-red-500">Błąd: {error}</p>}
      {responseData && <pre className="bg-gray-50 p-4 rounded">{JSON.stringify(responseData, null, 2)}</pre>}
      {!isLoading && !responseData && (
        <p className="italic">Oczekiwanie na wynik LLM...</p>
      )}
    </div>
  );
};

export default LlmStepTemplate;
