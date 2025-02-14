// src/plugins/webPageAnalyser/types.ts
export interface WebPageAnalyserConfig {
    analysisType: "markdown" | "links" | "metrics";
    documentName: string;
    containerName: string;
  }
  
  export interface WebPageAnalyserRuntimeData {
    selectedDomain?: string;
    analysisResult?: string;
    messages?: Array<{ role: string; content: string }>;
  }