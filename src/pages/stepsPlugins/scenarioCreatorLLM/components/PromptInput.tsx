/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreatorLLM/components/PromptInput.tsx
import { Alert, Button, Textarea } from "@/components/ui";
import { useState } from "react";

interface PromptInputProps {
  initialPrompt: string;
  onSubmit: (prompt: string) => void;
  isDisabled: boolean;
  isDomainCustom: boolean;
  domainContext: string;
}

export function PromptInput({
  initialPrompt,
  onSubmit,
  isDisabled,
  isDomainCustom,
  domainContext,
}: PromptInputProps) {
  const [prompt, setPrompt] = useState<string>(initialPrompt);

  const handleSubmit = () => {
    onSubmit(prompt);
  };

  // Mapa domen na przyjazne nazwy
  const domainNames: Record<string, string> = {
    marketing: "Marketing",
    software: "Software Development",
    productdev: "Product Development",
    research: "Research",
    education: "Education",
    custom: "Custom",
  };

  return (
    <div className="space-y-4">
      {/* Wyświetl informację o kontekście domeny */}
      <Alert className="bg-blue-50">
        <div className="text-sm">
          <span className="font-medium">Domain context: </span>
          {domainNames[domainContext] || domainContext}
          {isDomainCustom && " (using custom system prompt)"}
        </div>
      </Alert>
      <div className="space-y-2">
        <label className="text-sm font-medium">Prompt for LLM</label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what type of scenarios you want to generate"
          disabled={isDisabled}
          className="min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground">
          The prompt will be sent to the LLM to generate scenarios, tasks, and
          steps
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isDisabled}>
          Generate with LLM
        </Button>
      </div>
    </div>
  );
}
