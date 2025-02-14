// src/plugins/webPageAnalyser/index.tsx

import { MessageRole } from "@/types/common";
import {
  PluginDefinition,
  PluginConfig,
  PluginRuntimeData,
  LLMMessage,
} from "../base";
import { ConfigComponent } from "./ConfigComponent";
import { RuntimeComponent } from "./RuntimeComponent";
import { WebPageAnalyserConfig, WebPageAnalyserRuntimeData } from "./types";
import { Eye } from "lucide-react";

export const WebPageAnalyserPlugin: PluginDefinition = {
  id: "webPageAnalyser",
  name: "WebPage Analyser",
  description:
    "Analizuje stronę internetową w zależności od wybranej opcji (markdown, links, metrics) i zapisuje wynik analizy.",
  icon: <Eye className="h-4 w-4" />,
  ConfigComponent,
  RuntimeComponent,

  validate: async (
    config: PluginConfig,
    data?: PluginRuntimeData
  ): Promise<boolean> => {
    const analyserConfig = config as WebPageAnalyserConfig;
    const analyserData = data as WebPageAnalyserRuntimeData | undefined;
    if (
      !analyserConfig.analysisType ||
      !analyserConfig.documentName ||
      !analyserConfig.containerName
    ) {
      return false;
    }
    // W fazie runtime sprawdzamy czy wynik analizy został uzyskany
    if (data) {
      return !!analyserData?.analysisResult;
    }
    return true;
  },

  generateMessages: (
    config: PluginConfig,
    data: PluginRuntimeData
  ): LLMMessage[] => {
    const analyserConfig = config as WebPageAnalyserConfig;
    const analyserData = data as WebPageAnalyserRuntimeData;
    const messages: LLMMessage[] = [
      {
        role: "system" as MessageRole,
        content: `WebPage Analysis - Type: ${analyserConfig.analysisType}`,
      },
    ];
    if (analyserData.analysisResult) {
      messages.push({
        role: "assistant" as MessageRole,
        content: analyserData.analysisResult,
      });
    }
    return messages;
  },
};
