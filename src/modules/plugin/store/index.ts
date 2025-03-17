// src/modules/plugin/store/index.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PluginState {
  active: boolean;
}

export interface PluginsStore {
  plugins: Record<string, PluginState>;
  activatePlugin: (pluginId: string) => void;
  deactivatePlugin: (pluginId: string) => void;
}

// Plugins store with persistence
export const usePluginStore = create<PluginsStore>()(
  persist(
    (set) => ({
      plugins: {},

      activatePlugin: (pluginId: string) =>
        set((state) => ({
          plugins: {
            ...state.plugins,
            [pluginId]: { active: true },
          },
        })),

      deactivatePlugin: (pluginId: string) =>
        set((state) => ({
          plugins: {
            ...state.plugins,
            [pluginId]: { active: false },
          },
        })),
    }),
    {
      name: "plugin-store", // Storage key
      partialize: (state) => ({
        plugins: Object.fromEntries(
          Object.entries(state.plugins).map(([id, plugin]) => [
            id,
            { active: plugin.active },
          ])
        ),
      }),
    }
  )
);