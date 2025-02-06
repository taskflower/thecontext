import { MessageRole } from "@/types/common";
import {
  PluginDefinition,
  PluginConfig,
  PluginRuntimeData,
  LLMMessage,
} from "../base";
import { ConfigComponent } from "./ConfigComponent";
import { RuntimeComponent } from "./RuntimeComponent";
import { FormConfig, FormRuntimeData } from "./types";
import { TextCursorInput } from "lucide-react";

export const FormPlugin: PluginDefinition = {
  id: "form",
  name: "Form Input",
  description: "Simple form input plugin",
  icon: <TextCursorInput className="h-4 w-4" />,
  ConfigComponent,
  RuntimeComponent,

  validate: async (
    config: PluginConfig,
    data?: PluginRuntimeData
  ): Promise<boolean> => {
    const formConfig = config as FormConfig;
    const formData = data as FormRuntimeData | undefined;
    if (!formData) {
      return !!formConfig.question;
    }
    if (!formData.answer) return false;
    if (formConfig.required && !formData.isConfirmed) return false;
    if (formConfig.minLength && formData.answer.length < formConfig.minLength)
      return false;
    return true;
  },

  generateMessages: (
    config: PluginConfig,
    data: PluginRuntimeData
  ): LLMMessage[] => {
    const formConfig = config as FormConfig;
    const formData = data as FormRuntimeData;
    
    const messages: LLMMessage[] = [];

    // Only add system message if it exists
    if (formConfig.systemLLMMessage) {
      messages.push({
        role: "system" as MessageRole,
        content: formConfig.systemLLMMessage,
      });
    }

    // Add question and answer messages
    messages.push(
      {
        role: "assistant" as MessageRole,
        content: formConfig.question || "No question provided",
      },
      {
        role: "user" as MessageRole,
        content: formData.answer || "No answer provided",
      }
    );

    return messages;
  },
};