// src/core/hooks/useEngineStore.ts
import { configDB } from '@/db';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';


interface FlowState {
  data: Record<string, any>;
  get: (path: string) => any;
  set: (path: string, value: any) => void;
  reset: () => void;
  getAll: (prefix: string) => Promise<any[]>;
  addRecord: (id: string, data: any) => Promise<void>;
}

export const useEngineStore = create<FlowState>()(
  persist(
    (set, get) => ({
      data: {},
      get: path =>
        path.split('.').reduce((obj: any, key) => obj?.[key], get().data),
      set: (path, value) =>
        set(state => {
          const keys = path.split('.');
          const last = keys.pop()!;
          const target = keys.reduce((obj: any, k) => {
            if (!obj[k]) obj[k] = {};
            return obj[k];
          }, state.data);
          target[last] = value;
          return { data: { ...state.data } };
        }),
      reset: () => set({ data: {} }),
      getAll: async prefix => {
        const recs = await configDB.records
          .where('id')
          .startsWith(prefix)
          .toArray();
        return recs.map(r => r.data);
      },
      addRecord: async (id, data) => {
        await configDB.records.put({ id, data, updatedAt: new Date() });
      },
    }),
    { name: 'engine-storage', partialize: state => ({ data: state.data }) }
  )
);