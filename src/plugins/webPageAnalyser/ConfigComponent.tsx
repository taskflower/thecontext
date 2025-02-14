// src/plugins/webPageAnalyser/ConfigComponent.tsx
import React from "react";
import { PluginConfigProps } from "../base";
import { WebPageAnalyserConfig } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const ConfigComponent: React.FC<PluginConfigProps> = ({
  config,
  onConfigChange,
  onStatusChange,
}) => {
  const analyserConfig = config as WebPageAnalyserConfig;

  const validateConfig = (newConfig: WebPageAnalyserConfig) => {
    const isValid =
      !!newConfig.analysisType &&
      !!newConfig.documentName &&
      !!newConfig.containerName;
    onStatusChange(isValid);
  };

  const handleAnalysisTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Analysis Type</Label>
        <select
          value={analyserConfig.analysisType || "markdown"}
          onChange={handleAnalysisTypeChange}
          className="input"
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
    </div>
  );
};
