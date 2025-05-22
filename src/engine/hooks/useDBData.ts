// src/engine/hooks/useDBData.ts
import { useCallback } from "react";
import { useDB } from "@/provideDB/simpleDBProvider";
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

  const addItem = useCallback(async (item: Omit<T, 'id'>) => {
    const collectionName = getCollectionName();
    return await db.save(collectionName, item);
  }, [db, getCollectionName]);

  const updateItem = useCallback(async (id: string, updates: Partial<T>) => {
    const collectionName = getCollectionName();
    const existing = await db.getById(collectionName, id);
    if (!existing) throw new Error(`Item ${id} not found`);
    
    await db.save(collectionName, { ...existing, ...updates }, id);
  }, [db, getCollectionName]);

  const getItem = useCallback(async (id: string): Promise<T | null> => {
    const collectionName = getCollectionName();
    return await db.getById(collectionName, id);
  }, [db, getCollectionName]);

  const getAllItems = useCallback(async (): Promise<T[]> => {
    const collectionName = getCollectionName();
    return await db.getAll(collectionName);
  }, [db, getCollectionName]);

  const deleteItem = useCallback(async (id: string) => {
    const collectionName = getCollectionName();
    await db.delete(collectionName, id);
  }, [db, getCollectionName]);

  return {
    addItem,
    updateItem,
    getItem,
    getAllItems,
    deleteItem
  };
};