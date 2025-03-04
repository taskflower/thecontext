// src/pages/stepsPlugins/llmGenerator/LLMGeneratorViewer.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ViewerProps } from "../types";
import { ConversationItem } from "@/types";
import { useDataStore } from "@/store";
import { useStepStore } from "@/store/stepStore";

export function LLMGeneratorViewer({ step, onComplete }: ViewerProps) {
  const [userInput, setUserInput] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);

  const { getTaskSteps } = useStepStore();
  const { addDocItem } = useDataStore();

  // Extract context from previous steps if needed
  const gatherContext = () => {
    const taskSteps = getTaskSteps(step.taskId);
    let context = "";

    // Find previous steps that might have relevant data
    const previousSteps = taskSteps.filter(
      (s) =>
        s.order < step.order &&
        s.result &&
        (s.type === "llm-generator" ||
          s.type === "data-collector" ||
          s.type === "document-editor")
    );

    previousSteps.forEach((prevStep) => {
      if (prevStep.result?.content) {
        context += `${prevStep.title}: ${prevStep.result.content}\n\n`;
      } else if (prevStep.result?.formData) {
        context += `${prevStep.title}: ${JSON.stringify(
          prevStep.result.formData
        )}\n\n`;
      }
    });

    return context;
  };

  const handleGenerate = async () => {
    if (!userInput.trim() && !step.config.userPrompt) return;

    setLoading(true);
    setError(null);

    try {
      // In a real app, this would call your LLM API
      // For this example, we'll simulate a response

      // Gather context from previous steps
      const context = gatherContext();

      // Create the system prompt
      const systemPrompt =
        step.config.systemPrompt ||
        "You are a helpful assistant that generates high quality content based on user requirements.";

      // Create the full user prompt
      const fullUserPrompt = step.config.userPrompt
        ? `${step.config.userPrompt}\n\n${userInput}`
        : userInput;

      // Add context if available
      const promptWithContext = context
        ? `${fullUserPrompt}\n\nContext from previous steps:\n${context}`
        : fullUserPrompt;

      // Add to conversation
      const newConversation: ConversationItem[] = [
        ...conversation,
        { role: "user", content: promptWithContext },
      ];

      // Simulate LLM processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate mock response based on input
      const mockResponse = `# Generated Content for "${userInput}"\n\n## Introduction\nThis is a comprehensive analysis and content based on your request about "${userInput}". I've incorporated the context from previous steps to ensure relevance.\n\n## Main Points\n1. First key point about ${userInput}\n2. Second key point with supporting details\n3. Third key point with analysis\n\n## Recommendations\nBased on the analysis, here are some strategic recommendations:\n- Strategic recommendation 1\n- Strategic recommendation 2\n- Strategic recommendation 3\n\n## Conclusion\nThis concludes the analysis of ${userInput}. The findings suggest several actionable steps that can be implemented immediately.`;

      // Add to conversation
      newConversation.push({ role: "assistant", content: mockResponse });
      setConversation(newConversation);
      setGeneratedContent(mockResponse);

      // Create document if configured
      if (step.config.saveAsDocument) {
        const docItem = {
          id: `doc-${Date.now()}`,
          title: `Generated: ${userInput.substring(0, 50)}...`,
          content: mockResponse,
          metaKeys: [step.title, "AI Generated", "Content"],
          schema: {},
          folderId: "root", // This could be configured
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        addDocItem(docItem);
      }

      // Complete the step
      onComplete(
        {
          content: mockResponse,
          prompt: fullUserPrompt,
          timestamp: new Date().toISOString(),
        },
        newConversation
      );
    } catch (err) {
      setError("Failed to generate content. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{step.config.title || "Generate Content"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {step.config.userPrompt && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm">{step.config.userPrompt}</p>
            </div>
          )}

          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter your specific requirements or details..."
            className="min-h-32"
            disabled={loading}
          />

          {error && <p className="text-destructive text-sm">{error}</p>}

          {generatedContent && (
            <div className="p-4 border rounded-md mt-4">
              <h3 className="text-sm font-medium mb-2">Generated Content:</h3>
              <div className="max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">
                  {generatedContent}
                </pre>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {loading ? "Generating..." : "Generate Content"}
        </Button>
      </CardFooter>
    </Card>
  );
}
