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


  /* TODO - popraw interfejsy aby pozwalały na pusty config i data */
  validate: async (
    _config?: PluginConfig,
    _data?: PluginRuntimeData
  ): Promise<boolean> => {
    console.log('Skip valifator',_config,_data);
    return true;
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

    // Add document content messages if they exist
    if (pickerData?.selectedDocuments?.length) {
      messages.push(
        ...pickerData.selectedDocuments.map((doc) => ({
          role: "user" as MessageRole,
          content: doc.content,
        }))
      );
    }

    return messages;
  },
};