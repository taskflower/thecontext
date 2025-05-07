import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { get as getPath, set as setPath } from "lodash";

interface FlowState {
  currentNodeIndex: number;
  setCurrentNodeIndex: (index: number) => void;
  data: Record<string, any>;
  get: (path: string) => any;
  set: (path: string, value: any) => void;
  reset: () => void;
}

export const useFlowStore = create<FlowState>()(
  devtools(
    (set, get) => ({
      currentNodeIndex: 0,
      data: {},
      setCurrentNodeIndex: (index) => set({ currentNodeIndex: index }),
      get: (path) => getPath(get().data, path),
      set: (path, value) => {
        set((state) => {
          const newData = { ...state.data };
          setPath(newData, path, value);
          return { data: newData };
        });
      },
      reset: () => set({ currentNodeIndex: 0, data: {} }),
    }),
    { name: "flow-store" }
  )
);

// Hook dla komponentów szablonów
export const useFlow = () => {
  const { get, set } = useFlowStore();
  return { get, set };
};
