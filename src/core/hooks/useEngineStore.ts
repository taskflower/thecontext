// ----------------------------------------
// src/core/hooks/useEngineStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { configDB } from "@/db";
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
          const target = keys.reduce((obj: any, k) => {
            if (!obj[k]) obj[k] = {};
            return obj[k];
          }, state.data);
          target[last] = value;
          return { data: { ...state.data } };
        }),
      reset: () => set({ data: {} }),
      getAll: async (prefix: string) => {
        const recs = await configDB.records.where("id").startsWith(prefix).toArray();
        return recs.map((r) => r.data);
      },
      addRecord: async (id: string, data: any) => {
        await configDB.records.put({ id, data, updatedAt: new Date() });
      },
    }),
    { name: "engine-storage", partialize: (state) => ({ data: state.data }) }
  )
);