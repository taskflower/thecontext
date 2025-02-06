// src/plugins/pickerDoc/index.tsx
import { MessageRole } from "@/types/common";
import {
  PluginDefinition,
  PluginConfig,
  PluginRuntimeData,
  LLMMessage,
} from "../base";
import { ConfigComponent } from "./ConfigComponent";
import { RuntimeComponent } from "./RuntimeComponent";
import { PickerDocConfig, PickerDocRuntimeData } from "./types";
import { FileUp } from "lucide-react";

export const PickerDocPlugin: PluginDefinition = {
  id: "pickerDoc",
  name: "Document Picker",
  description: "Plugin for selecting documents to include in the conversation",
  icon: <FileUp className="h-4 w-4" />,
  ConfigComponent,
  RuntimeComponent,

  validate: async (
    // config: PluginConfig,
    data?: PluginRuntimeData
  ): Promise<boolean> => {
    const pickerData = data as PickerDocRuntimeData | undefined;

    if (data) {
      return (pickerData?.selectedDocuments?.length || 0) > 0;
    }

    return true; // Config is always valid
  },

  generateMessages: (
    config: PluginConfig,
    data: PluginRuntimeData
  ): LLMMessage[] => {
    const pickerConfig = config as PickerDocConfig;
    const pickerData = data as PickerDocRuntimeData;
    const messages: LLMMessage[] = [];

    // Add system message if it exists
    if (pickerConfig.systemLLMMessage) {
      messages.push({
        role: "system" as MessageRole,
        content: pickerConfig.systemLLMMessage,
      });
    }

    // Add document content messages
    messages.push(
      ...pickerData.selectedDocuments.map((doc) => ({
        role: "user" as MessageRole,
        content: doc.content,
      }))
    );

    return messages;
  },
};