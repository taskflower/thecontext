// src/engine/hooks/useDBData.ts
import { useCallback } from "react";
import { useDB } from "@/provideDB/dbProvider.tsx";
import { useAppNavigation } from "./useAppNavigation";
import { useConfig } from "../core";
import { AppConfig } from "../types";

export const useDBData = <T = any>(collection: string) => {
  const { config } = useAppNavigation();
  const { config: appConfig } = useConfig<AppConfig>(`/src/configs/${config}/app.json`);
  const db = useDB();

  // Get actual collection name from app config
  const getCollectionName = useCallback(() => {
    return appConfig?.database?.collections?.[collection] || collection;
  }, [appConfig, collection]);

  // Helper to wait for DB readiness
  const waitForDB = useCallback(async () => {
    if (!db.ready) {
      // Wait up to 5 seconds for DB to be ready
      let attempts = 0;
      while (!db.ready && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      if (!db.ready) {
        throw new Error('Database initialization timeout');
      }
    }
  }, [db.ready]);

  const addItem = useCallback(async (item: Omit<T, 'id'>) => {
    await waitForDB();
    const collectionName = getCollectionName();
    return await db.save(collectionName, item);
  }, [db, getCollectionName, waitForDB]);

  const updateItem = useCallback(async (id: string, updates: Partial<T>) => {
    await waitForDB();
    const collectionName = getCollectionName();
    const existing = await db.getById(collectionName, id);
    if (!existing) throw new Error(`Item ${id} not found`);
    
    await db.save(collectionName, { ...existing, ...updates }, id);
  }, [db, getCollectionName, waitForDB]);

  const getItem = useCallback(async (id: string): Promise<T | null> => {
    await waitForDB();
    const collectionName = getCollectionName();
    return await db.getById(collectionName, id);
  }, [db, getCollectionName, waitForDB]);

  const getAllItems = useCallback(async (): Promise<T[]> => {
    await waitForDB();
    const collectionName = getCollectionName();
    return await db.getAll(collectionName);
  }, [db, getCollectionName, waitForDB]);

  const deleteItem = useCallback(async (id: string) => {
    await waitForDB();
    const collectionName = getCollectionName();
    await db.delete(collectionName, id);
  }, [db, getCollectionName, waitForDB]);

  return {
    addItem,
    updateItem,
    getItem,
    getAllItems,
    deleteItem,
    ready: db.ready
  };
};