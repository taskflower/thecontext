// src/core/engine.ts - Poprawione eksporty
export { useComponent } from "./hooks/useComponent";
export { getAvailableThemes } from "./hooks/getAvailableThemes";
export { useEngineStore } from "./hooks/useEngineStore"; // TYLKO kontekst
export { useLlmEngine } from "./hooks/useLlmEngine";
export { useConfig } from "./hooks/useConfig"; // TYLKO konfiguracja
export { useCollections } from "./hooks/useCollections"; // TYLKO kolekcje
export { useWorkspaceSchema } from "./hooks/useWorkspaceSchema";
export type * from "./types";