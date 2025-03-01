/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { ViewerProps } from "../../types";
import { Header } from "./Header";
import { LoadingIndicator } from "./LoadingIndicator";
import { ActionButtons } from "./ActionButtons";
import { ContentDisplay } from "./ContentDisplay";
import { SubmitButton } from "./SubmitButton";
import { useDataStore } from "@/store";
import llmService from "@/services/promptFactory/llmService";
import { buildPromptMessages } from "@/services/promptFactory/promptBuilder";
import { ResponseExecutor } from "@/services/promptFactory/responseExecutor";
import { LLMMessage } from "@/services/promptFactory/types";

export function ContentGenerator({ step, onComplete }: ViewerProps) {
  const [content, setContent] = useState(step.result?.content || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addDocItem } = useDataStore();

  const config = step.config || {};

  const title = config.title || step.title || "AI-Generated Content";
  const description = config.description || step.description;
  const outputFormat = config.outputFormat || "markdown";
  const allowRetry = config.allowRetry ?? true;
  const storeAsDocument = config.storeAsDocument ?? true;
  const responseAction = config.responseAction || { type: "direct" };

  const generateVariables = () => {
    const now = new Date();
    return {
      taskId: step.taskId || "",
      stepId: step.id || "",
      projectName: "Current Project",
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString(),
      topic: config.topic || "AI and automation",
      // Dodaj tu inne zmienne kontekstowe
    };
  };

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if LLM service is initialized
      const isAuthenticated = await llmService.isAuthenticated();
      if (!isAuthenticated) {
        throw new Error(
          "Authentication required. Please log in to use AI features."
        );
      }

      // Prepare the prompt config
      const promptConfig = {
        systemPrompt:
          config.systemPrompt ||
          "You are a helpful assistant specializing in creating professional content.",
        userPromptTemplate:
          config.promptTemplate ||
          "Generate content about the following topic: {{topic}}",
        model: config.model,
        modelOptions: {
          max_tokens: config.maxTokens || 1000,
        },
      };

      // Generate variables to be used in the prompt
      const variables = generateVariables();

      // Build the messages using promptFactory
      const messages = buildPromptMessages(
        promptConfig,
        variables
      ) as LLMMessage[];

      // Send request to LLM service
      const apiResponse = await llmService.sendRequest(messages);

      // Obsługa odpowiedzi w zależności od skonfigurowanej akcji
      if (responseAction.type === "direct") {
        // Standardowa obsługa - wyciągnięcie treści z odpowiedzi
        let responseContent: string;

        if (typeof apiResponse === "object") {
          if (apiResponse.content) {
            responseContent = apiResponse.content;
          } else if ((apiResponse as any).data?.message?.content) {
            responseContent = (apiResponse as any).data.message.content;
          } else if ((apiResponse as any).message?.content) {
            responseContent = (apiResponse as any).message.content;
          } else {
            console.error("Nieobsługiwany format odpowiedzi:", apiResponse);
            throw new Error("Otrzymano nieobsługiwany format odpowiedzi z API");
          }
        } else if (typeof apiResponse === "string") {
          responseContent = apiResponse;
        } else {
          throw new Error("Nieoczekiwany format odpowiedzi z API");
        }

        // Update content
        setContent(responseContent);
      } else if (
        responseAction.type === "create_entities" ||
        responseAction.type === "custom"
      ) {
        // Użyj ResponseExecutor do przetworzenia odpowiedzi
        const executionContext = {
          taskId: step.taskId || "",
          stepId: step.id || "",
          projectId: (step as any).projectId || "",
        };

        const success = await ResponseExecutor.executeResponse(
          executionContext,
          apiResponse,
          responseAction
        );

        if (success) {
          setContent(
            "Content generated and processed successfully. Entities have been created based on the AI response."
          );
        } else {
          throw new Error(
            "Failed to process the response with the configured action."
          );
        }
      }
    } catch (err: any) {
      console.error("Error generating content:", err);
      setError(err.message || "Failed to generate content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.${
      outputFormat === "markdown"
        ? "md"
        : outputFormat === "html"
        ? "html"
        : "txt"
    }`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveAsDocument = () => {
    if (!content) return;

    const currentTime = new Date().toISOString();
    const docItem = {
      id: `doc-${Date.now()}`,
      title: `${title} - ${new Date().toLocaleDateString()}`,
      content,
      metaKeys: ["ai-generated", step.taskId || "", outputFormat],
      schema: {},
      folderId: "root",
      createdAt: currentTime,
      updatedAt: currentTime,
    };

    addDocItem(docItem);
  };

  const handleSubmit = () => {
    if (!content) return;

    if (storeAsDocument) {
      saveAsDocument();
    }

    onComplete({
      content,
      format: outputFormat,
      generatedAt: new Date().toISOString(),
      charCount: content.length,
    });
  };

  useEffect(() => {
    if (!step.result && !content) {
      generateContent();
    }
  }, []);

  return (
    <div className="space-y-4">
      <Header title={title} description={description} />

      <LoadingIndicator isLoading={isLoading} />

      {!isLoading && (
        <ActionButtons
          allowRetry={allowRetry}
          storeAsDocument={storeAsDocument}
          isLoading={isLoading}
          generateContent={generateContent}
          handleCopy={handleCopy}
          handleDownload={handleDownload}
          saveAsDocument={saveAsDocument}
        />
      )}

      <ContentDisplay
        content={content}
        setContent={setContent}
        isLoading={isLoading}
        error={error}
      />

      <SubmitButton
        isLoading={isLoading}
        content={content}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
