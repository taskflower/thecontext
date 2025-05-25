// src/core/hooks/useLocalStore.ts
import { useState, useEffect } from 'react';
import { useEngineStore } from './useEngineStore';

export function useLocalStore<T>(prefix: string) {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    useEngineStore
      .getState()
      .getAll(prefix)
      .then(setItems)
      .catch(console.error);
  }, [prefix]);

  const add = (data: T) => {
    const id = Date.now().toString();
    useEngineStore.getState().addRecord(`${prefix}${id}`, data);
  };

  return { items, add };
}