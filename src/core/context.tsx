// src/core/context.tsx
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { get as getPath, set as setPath } from "lodash";

interface FlowState {
  data: Record<string, any>;
  get: (path: string) => any;
  set: (path: string, value: any) => void;
  logReset: () => void;
}

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      data: {},
      get: (path) => getPath(get().data, path),
      set: (path, value) => {
        set((state) => {
          const newData = { ...state.data };
          setPath(newData, path, value);
          return { data: newData };
        });
      },
      logReset: () => {
        console.warn(
          "[FlowStore] reset() was called - funkcja tylko loguje, nie czyści kontekstu"
        );
      },
    }),
    {
      name: "flow-storage",
      partialize: (state) => ({ data: state.data }), 
    }
  )
);

export const useFlow = () => {
  const { get, set } = useFlowStore();
  return { get, set };
};
