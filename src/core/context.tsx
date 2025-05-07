// src/core/context.tsx
import { create } from 'zustand';
import { get as getPath, set as setPath } from 'lodash';

interface FlowState {
  data: Record<string, any>;
  get: (path: string) => any;
  set: (path: string, value: any) => void;
  // W przyszłości: metoda do selektywnego resetowania fragmentów kontekstu
  logReset: () => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
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
      '[FlowStore] reset() was called - rozważyć implementację selektywnego czyszczenia kontekstu'
    );
  }
}));

// Hook dla komponentów szablonów - wrapper nad useFlowStore (get/set)
export const useFlow = () => {
  const { get, set } = useFlowStore();
  return { get, set };
};