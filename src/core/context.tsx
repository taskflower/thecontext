// src/core/context.tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { get as getPath, set as setPath } from 'lodash';

interface FlowState {
  data: Record<string, any>;
  get: (path: string) => any;
  set: (path: string, value: any) => void;
  logReset: () => void;
}

// Używamy middleware persist aby zachować dane między nawigacjami
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
          '[FlowStore] reset() was called - funkcja tylko loguje, nie czyści kontekstu'
        );
      }
    }),
    {
      name: 'flow-storage', // nazwa pod którą dane będą przechowywane w localStorage
      partialize: (state) => ({ data: state.data }), // zapisujemy tylko dane, nie funkcje
    }
  )
);

// Hook dla komponentów szablonów - wrapper nad useFlowStore
export const useFlow = () => {
  const { get, set } = useFlowStore();
  return { get, set };
};