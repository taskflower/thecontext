// src/plugins/webPageAnalyser/ConfigComponent.tsx
import React from "react";
import { PluginConfigProps } from "../base";
import { WebPageAnalyserConfig } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ConfigComponent: React.FC<PluginConfigProps> = ({
  config,
  context,
  onConfigChange,
  onStatusChange,
}) => {
  const analyserConfig = config as WebPageAnalyserConfig;
  console.log("ConfigComponent - current config:", analyserConfig);
  console.log("ConfigComponent - available steps:", context?.availableSteps);

  const validateConfig = (newConfig: WebPageAnalyserConfig) => {
    const isValid =
      !!newConfig.analysisType &&
      !!newConfig.documentName &&
      !!newConfig.containerName &&
      !!newConfig.selectedStepId;
    onStatusChange(isValid);
  };

  const handleAnalysisTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newConfig: WebPageAnalyserConfig = {
      ...analyserConfig,
      analysisType: e.target.value as "markdown" | "links" | "metrics",
    };
    onConfigChange(newConfig);
    validateConfig(newConfig);
  };

  const handleDocumentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfig: WebPageAnalyserConfig = {
      ...analyserConfig,
      documentName: e.target.value,
    };
    onConfigChange(newConfig);
    validateConfig(newConfig);
  };

  const handleContainerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfig: WebPageAnalyserConfig = {
      ...analyserConfig,
      containerName: e.target.value,
    };
    onConfigChange(newConfig);
    validateConfig(newConfig);
  };

  const handleStepSelect = (stepId: string) => {
    const newConfig: WebPageAnalyserConfig = {
      ...analyserConfig,
      selectedStepId: stepId,
    };
    onConfigChange(newConfig);
    validateConfig(newConfig);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Analysis Type</Label>
        <select
          value={analyserConfig.analysisType || "markdown"}
          onChange={handleAnalysisTypeChange}
          className="w-full rounded-md border p-2"
        >
          <option value="markdown">Markdown</option>
          <option value="links">Links</option>
          <option value="metrics">Metrics</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <Label>Document Name</Label>
        <Input
          value={analyserConfig.documentName || ""}
          onChange={handleDocumentNameChange}
          placeholder="Enter document name..."
        />
      </div>
      
      <div className="space-y-2">
        <Label>Container Name</Label>
        <Input
          value={analyserConfig.containerName || ""}
          onChange={handleContainerNameChange}
          placeholder="Enter container name..."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Step</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            <RadioGroup
              value={analyserConfig.selectedStepId}
              onValueChange={handleStepSelect}
            >
              {context?.availableSteps?.map((step) => (
                <div key={step.id} className="flex items-center space-x-2 py-2">
                  <RadioGroupItem value={step.id} id={step.id} />
                  <Label htmlFor={step.id}>
                    {step.name} ({step.pluginId})
                  </Label>
                </div>
              ))}
              {(!context?.availableSteps || context.availableSteps.length === 0) && (
                <div className="text-muted-foreground">No previous steps available</div>
              )}
            </RadioGroup>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};