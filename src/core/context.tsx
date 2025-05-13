// src/core/context.tsx
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getPath, setPath } from ".";

interface FlowState {
  data: Record<string, any>;
  get: (path: string) => any;
  set: (path: string, value: any) => void;
  reset: () => void;
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
      reset: () => {
        set({ data: {} });
      },
    }),
    {
      name: "flow-storage",
      partialize: (state) => ({ data: state.data }),
    }
  )
);

export const useFlow = () => {
  const { get, set, reset } = useFlowStore();
  return { get, set, reset };
};