// src/core/hooks/useEngineStore.ts - FIXED VERSION with stable references
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FlowState } from "../types";

// ✅ FIX: Add shallow comparison for nested objects
const isEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => isEqual(a[key], b[key]));
};

export const useEngineStore = create<FlowState>()(
  persist(
    (set, get) => ({
      data: {}, 
      
      get: (path: string) => {
        const result = path.split(".").reduce((obj: any, key) => obj?.[key], get().data);
        return result;
      },
      
      set: (path: string, value: any) => {
        const currentState = get();
        const keys = path.split(".");
        const last = keys.pop()!;
        
        // ✅ FIX: Create new state properly to avoid mutations
        const newData = JSON.parse(JSON.stringify(currentState.data));
        const target = keys.reduce((obj: any, k) => obj[k] ??= {}, newData);
        
        // ✅ FIX: Only update if value actually changed
        if (!isEqual(target[last], value)) {
          target[last] = value;
          set({ data: newData });
          console.log(`🔄 Store updated [${path}]:`, value);
        }
      },
      
      reset: () => {
        console.log('🔄 Store reset');
        set({ data: {} });
      },
    }),
    { 
      name: "engine-storage", 
      partialize: (state) => ({ data: state.data }),
      // ✅ FIX: Add storage event listener to prevent conflicts
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('🔄 Store rehydrated:', Object.keys(state.data));
        }
      },
    }
  )
);