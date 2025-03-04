/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/llmResponse/LLMResponseViewer.tsx
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { ViewerProps } from "../types";
import { useDataStore } from "@/store";
import { ConversationItem } from "@/types";

export function LLMResponseViewer({ step, onComplete }: ViewerProps) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(step.result?.response || null);
  const [error, setError] = useState<string | null>(null);

  const {
    promptTemplate = "Generate {{type}} about {{topic}}",
    mockResponse = false,
    responseSampleType = "json",
    responseSample = '{\n  "title": "Sample Response",\n  "content": "This is a sample response"\n}',
  } = step.config || {};

  // Helper to extract variables from task data
  const extractPromptVariables = () => {
    const matches = promptTemplate.match(/\{\{(\w+)\}\}/g) || [];
    const variables = matches.map((match: string) => match.slice(2, -2));

    const taskData =
      useDataStore.getState().tasks.find((t) => t.id === step.taskId)?.data ||
      {};

    let finalPrompt = promptTemplate;
    variables.forEach((variable: string) => {
      const value = taskData[variable] || `[${variable}]`;
      finalPrompt = finalPrompt.replace(`{{${variable}}}`, value);
    });

    return finalPrompt;
  };

  // Generate or fetch LLM response
  const generateResponse = async () => {
    setLoading(true);
    setError(null);

    try {
      // Extract the prompt from template and variables
      const prompt = extractPromptVariables();

      if (mockResponse) {
        // Mock response for testing/development
        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          const mockData = responseSample
            ? JSON.parse(responseSample)
            : { content: "Mock response" };
          setResponse(mockData);
        } catch {
          // If JSON parsing fails, use the raw string
          setResponse({ content: responseSample });
        }
      } else {
        // In a real implementation, this would call an actual LLM API
        // For now, just simulate a response
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setResponse({
          title: "Simulated LLM Response",
          content: `This is a simulated response to: "${prompt}"`,
        });
      }
    } catch (err) {
      setError(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate conversation data to store
  const generateConversationData = (): ConversationItem[] => {
    const prompt = extractPromptVariables();
    const conversationData: ConversationItem[] = [
      {
        role: "user",
        content: prompt,
      },
    ];

    if (response) {
      const content =
        typeof response === "string"
          ? response
          : response.content || JSON.stringify(response, null, 2);

      conversationData.push({
        role: "assistant",
        content,
      });
    }

    return conversationData;
  };

  // Generate on first load if there's no response
  useEffect(() => {
    if (!response && !loading && !error) {
      generateResponse();
    }
  }, [response]);

  // Handle completion
  const handleComplete = () => {
    if (!response) return;

    onComplete(
      {
        response,
        timestamp: new Date().toISOString(),
        prompt: extractPromptVariables(),
      },
      generateConversationData()
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{step.title || "LLM Response"}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {step.description || "AI-generated content"}
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-md">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-center text-muted-foreground">
              Generating response...
            </p>
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        ) : response ? (
          <div className="border rounded-md p-4 bg-muted/50">
            {responseSampleType === "json" ? (
              // Display as formatted JSON
              <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[400px]">
                {JSON.stringify(response, null, 2)}
              </pre>
            ) : (
              // Display as text
              <div className="prose prose-sm max-w-none">
                {typeof response === "string"
                  ? response
                  : response.content || JSON.stringify(response)}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            No response generated yet
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={generateResponse} disabled={loading}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Regenerate
        </Button>

        <Button onClick={handleComplete} disabled={loading || !response}>
          Complete
        </Button>
      </CardFooter>
    </Card>
  );
}
