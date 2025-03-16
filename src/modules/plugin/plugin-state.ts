import { PluginResult, PluginState } from "./types";


// Stan Zustand dla pluginów
export interface PluginsState {
  // Pluginy i ich stan
  plugins: Record<string, PluginState>;
  
  // Kolejka pluginów do wykonania
  queue: string[];
  
  // Czy przetwarzanie jest w toku
  processing: boolean;
  
  // Historia wykonań
  history: PluginResult[];
}

// Stan początkowy
export const initialPluginsState: PluginsState = {
  plugins: {},
  queue: [],
  processing: false,
  history: []
};