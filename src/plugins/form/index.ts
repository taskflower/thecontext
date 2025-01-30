// src/plugins/form/index.ts
import { MessageRole } from "@/types/common";
import { PluginDefinition, PluginConfig, PluginRuntimeData, LLMMessage } from "../base";
import { ConfigComponent } from "./ConfigComponent";
import { RuntimeComponent } from "./RuntimeComponent";
import { FormConfig, FormRuntimeData } from "./types";

export const FormPlugin: PluginDefinition = {
  id: "form",
  name: "Form Input",
  description: "Simple form input plugin",

  ConfigComponent,
  RuntimeComponent,

  validate: async (config: PluginConfig, data?: PluginRuntimeData): Promise<boolean> => {
    const formConfig = config as FormConfig;
    const formData = data as FormRuntimeData | undefined;

    // Validating configuration
    if (!formData) {
      return !!formConfig.question;
    }
    
    // Validating runtime data
    if (!formData.answer) return false;
    if (formConfig.required && !formData.isConfirmed) return false;
    if (formConfig.minLength && formData.answer.length < formConfig.minLength) return false;
    return true;
  },

  generateMessages: (config: PluginConfig, data: PluginRuntimeData): LLMMessage[] => {
    const formConfig = config as FormConfig;
    const formData = data as FormRuntimeData;

    return [
      {
        role: "user" as MessageRole,
        content: formConfig.question || 'No question provided',
      },
      {
        role: "assistant" as MessageRole,
        content: formData.answer || 'No answer provided',
      },
    ];
    
  },
};