// src/plugins/webPageAnalyser/types.ts
export interface WebPageAnalyserConfig {
  analysisType: "markdown" | "links" | "metrics";
  documentName: string;
  containerName: string;
  selectedStepId?: string;
  availableSteps?: Array<{
    id: string;
    name: string;
    pluginId: string;
  }>; // Lista dostępnych kroków z template'u
}

export interface WebPageAnalyserRuntimeData {
  analysisResult?: string;
  messages?: Array<{ role: string; content: string }>;
}