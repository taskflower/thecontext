import { PluginResult, PluginState } from "./types";

export interface PluginsState {
  plugins: Record<string, PluginState>;
  queue: string[];
  processing: boolean;
  history: PluginResult[];
}

export const initialPluginsState: PluginsState = {
  plugins: {},
  queue: [],
  processing: false,
  history: []
};