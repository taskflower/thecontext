// src/core/hooks/useEngineStore.ts - TYLKO kontekst w pamięci
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FlowState } from "../types";

export const useEngineStore = create<FlowState>()(
  persist(
    (set, get) => ({
      data: {}, 
      
      get: (path: string) =>
        path.split(".").reduce((obj: any, key) => obj?.[key], get().data),
      
      set: (path: string, value: any) =>
        set((state) => {
          const keys = path.split(".");
          const last = keys.pop()!;
          const target = keys.reduce((obj: any, k) => obj[k] ??= {}, state.data);
          target[last] = value;
          return { data: { ...state.data } };
        }),
      
      reset: () => set({ data: {} }),
    }),
    { 
      name: "engine-storage", 
      partialize: (state) => ({ data: state.data }),
    }
  )
);