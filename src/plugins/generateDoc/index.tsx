// src/plugins/generateDoc/index.ts
import { MessageRole } from "@/types/common";
import { PluginDefinition, PluginConfig, PluginRuntimeData, LLMMessage } from "../base";
import { ConfigComponent } from "./ConfigComponent";
import { RuntimeComponent } from "./RuntimeComponent";
import { GenerateDocConfig, GenerateDocRuntimeData } from "./types";
import { FileCog } from "lucide-react";

export const GenerateDocPlugin: PluginDefinition = {
  id: "generateDoc",
  name: "Document Generator",
  description: "Plugin for document generation with container specification",
  icon: <FileCog className="h-4 w-4" />,
  ConfigComponent,
  RuntimeComponent,

  validate: async (config: PluginConfig, data?: PluginRuntimeData): Promise<boolean> => {
    const generateDocConfig = config as GenerateDocConfig;
    const generateDocData = data as GenerateDocRuntimeData | undefined;
    
    // Config validation
    if (!generateDocConfig.documentName || !generateDocConfig.containerName) {
      return false;
    }
    
    // Runtime validation - sprawdzamy czy dokument został wygenerowany
    if (data) {
      return generateDocData?.isGenerated || false;
    }
    
    return true;
  },

  generateMessages: (config: PluginConfig, data: PluginRuntimeData): LLMMessage[] => {
    const generateDocConfig = config as GenerateDocConfig;
    const generateDocData = data as GenerateDocRuntimeData;

    const messages: LLMMessage[] = [
      {
        role: "system" as MessageRole,
        content: `Starting document generation:\nDocument: ${generateDocConfig.documentName}\nContainer: ${generateDocConfig.containerName}`,
      }
    ];

    // Dodaj wygenerowaną treść dokumentu jeśli istnieje
    if (generateDocData.generatedContent) {
      messages.push({
        role: "assistant" as MessageRole,
        content: generateDocData.generatedContent
      });
    }

    return messages;
  },
};