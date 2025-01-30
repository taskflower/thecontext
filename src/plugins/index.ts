// src/plugins/index.ts
import { PluginMap } from "./base";
import { FormPlugin } from "./form";
import { GenerateDocPlugin } from "./generateDoc";

export const plugins: PluginMap = {
  form: FormPlugin,
  generateDoc: GenerateDocPlugin,
};

// Eksportujemy wszystkie potrzebne typy z base
export type {
  PluginDefinition,
  PluginMap,
  PluginConfig,
  PluginRuntimeData,
  PluginConfigProps,
  PluginRuntimeProps,
  PluginStepContext,
  LLMMessage,
} from "./base";

// Eksportujemy typy z poszczególnych pluginów
export type { FormConfig, FormRuntimeData } from "./form/types";
export type { GenerateDocConfig, GenerateDocRuntimeData } from "./generateDoc/types";

// Eksportujemy same pluginy dla łatwiejszego importowania
export { FormPlugin, GenerateDocPlugin };