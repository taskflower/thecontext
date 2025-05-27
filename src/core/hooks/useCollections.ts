// src/core/hooks/useCollections.ts - TYLKO kolekcje aplikacji
import { useState, useEffect } from "react";
import { configDB } from '@/db';

export function useCollections<T = any>(collection: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    try {
      const records = await configDB.records
        .where("id")
        .startsWith(`${collection}:`)
        .toArray();
      
      setItems(records.map(r => ({
        id: r.id?.replace(`${collection}:`, "") ?? "",
        ...r.data
      })));
    } catch (error) {
      console.error("Failed to load collection:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveItem = async (item: T) => {
    const id = (item as any).id || Date.now().toString();
    await configDB.records.put({
      id: `${collection}:${id}`,
      data: { ...item, id },
      updatedAt: new Date()
    });
    await loadItems();
  };

  const deleteItem = async (id: string) => {
    await configDB.records.delete(`${collection}:${id}`);
    await loadItems();
  };

  useEffect(() => { loadItems(); }, [collection]);

  return { items, loading, saveItem, deleteItem, refresh: loadItems };
}