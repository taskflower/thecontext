// src/plugins/pickerDoc/index.ts
import { MessageRole } from "@/types/common";
import {
  PluginDefinition,
  // PluginConfig,
  PluginRuntimeData,
  LLMMessage,
} from "../base";
import { ConfigComponent } from "./ConfigComponent";
import { RuntimeComponent } from "./RuntimeComponent";
import { PickerDocRuntimeData } from "./types";

export const PickerDocPlugin: PluginDefinition = {
  id: "pickerDoc",
  name: "Document Picker",
  description: "Plugin for selecting documents to include in the conversation",

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

    return true; // Config is always valid as we don't have any configuration
  },

  generateMessages: (
    // config: PluginConfig,
    data: PluginRuntimeData
  ): LLMMessage[] => {
    const pickerData = data as PickerDocRuntimeData;

    return pickerData.selectedDocuments.map((doc) => ({
      role: "user" as MessageRole,
      content: doc.content,
    }));
  },
};
