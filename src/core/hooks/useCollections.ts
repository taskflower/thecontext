// src/core/hooks/useCollections.ts - ENHANCED VERSION with full config support
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useConfig } from "./useConfig";
import { useEngineStore } from "./useEngineStore";
import Dexie from "dexie";

// Simple DB per collection - MOVED OUTSIDE COMPONENT
const dbs = new Map<string, Dexie>();

function getDB(collection: string): Dexie {
  if (!dbs.has(collection)) {
    const db = new Dexie(collection);
    db.version(1).stores({ items: "&id" });
    dbs.set(collection, db);
  }
  return dbs.get(collection)!;
}

interface QueryOptions {
  where?: Array<{ field: string; operator: string; value: any }>;
  populate?: string[];
}

export function useCollections<T = any>(
  collection: string,
  options: QueryOptions = {}
) {
  const { config = "roleTestApp" } = useParams<{ config: string }>();
  const appConfig = useConfig(config, `/src/_configs/${config}/app.json`);
  const { get } = useEngineStore();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ FIX: Use refs to prevent infinite rerenders
  const currentUserRef = useRef(get("currentUser"));
  const actualCollectionRef = useRef<string>("");
  const loadingRef = useRef(false);

  // Update refs when dependencies change
  useEffect(() => {
    currentUserRef.current = get("currentUser");
  }, [get("currentUser")?.id, get("currentUser")?.role]);

  useEffect(() => {
    if (appConfig?.database?.collections) {
      actualCollectionRef.current =
        appConfig.database.collections[collection] || collection;
    }
  }, [appConfig?.database?.collections, collection]);

  // ✅ NEW: Apply role-based filters from config
  const applyRoleFilters = useCallback(
    (records: any[], currentUser: any): any[] => {
      if (!currentUser || !appConfig?.database?.permissions) return records;

      const collectionPermissions = appConfig.database.permissions[collection];
      if (!collectionPermissions) return records;

      const rolePermission = collectionPermissions[currentUser.role];
      if (!rolePermission?.filter) return records;

      const filter = rolePermission.filter;
      let filterValue = filter.value;

      // ✅ NEW: Process {{currentUser.field}} placeholders
      if (filterValue.includes("{{")) {
        filterValue = filterValue.replace(
          /\{\{currentUser\.(\w+)\}\}/g,
          (_: string, field: string) => currentUser[field] || ""
        );
      }

      console.log(
        `🔒 Applying role filter [${currentUser.role}]: ${filter.field} = ${filterValue}`
      );

      return records.filter((record) => record[filter.field] === filterValue);
    },
    [collection, appConfig?.database?.permissions]
  );

  // ✅ NEW: Populate relations
  const populateRelations = useCallback(
    async (records: any[], populateFields: string[]): Promise<any[]> => {
      if (!populateFields.length || !appConfig?.database?.relations)
        return records;

      const relations = appConfig.database.relations;

      for (const relationKey of populateFields) {
        const relationConfig = relations[`${collection}.${relationKey}`];
        if (!relationConfig) {
          console.warn(`Relation not found: ${collection}.${relationKey}`);
          continue;
        }

        const { type, target, foreignKey } = relationConfig;
        const targetCollection =
          appConfig.database.collections[target] || target;
        const targetDB = getDB(targetCollection);

        if (type === "many-to-one") {
          // Get unique foreign IDs
          const foreignIds = [
            ...new Set(records.map((r) => r[foreignKey]).filter(Boolean)),
          ];
          if (!foreignIds.length) continue;

          // Fetch related records
          const relatedRecords = await targetDB.table("items").toArray();
          const relatedMap = new Map(relatedRecords.map((r) => [r.id, r]));

          // Populate records
          records.forEach((record) => {
            if (record[foreignKey]) {
              record[relationKey] = relatedMap.get(record[foreignKey]);
            }
          });

          console.log(
            `🔗 Populated ${relationKey} for ${records.length} records`
          );
        }

        if (type === "one-to-many") {
          const parentIds = records.map((r) => r.id);
          const relatedRecords = await targetDB.table("items").toArray();

          const relatedMap = new Map<string, any[]>();
          relatedRecords
            .filter((r) => parentIds.includes(r[foreignKey]))
            .forEach((record) => {
              const parentId = record[foreignKey];
              if (!relatedMap.has(parentId)) relatedMap.set(parentId, []);
              relatedMap.get(parentId)!.push(record);
            });

          records.forEach((record) => {
            record[relationKey] = relatedMap.get(record.id) || [];
          });

          console.log(
            `🔗 Populated ${relationKey} (one-to-many) for ${records.length} records`
          );
        }
      }

      return records;
    },
    [
      collection,
      appConfig?.database?.relations,
      appConfig?.database?.collections,
    ]
  );

  // ✅ ENHANCED: Load items with full config support
  const loadItems = useCallback(async () => {
    if (loadingRef.current || !appConfig || !actualCollectionRef.current)
      return;

    try {
      loadingRef.current = true;
      setLoading(true);

      const db = getDB(actualCollectionRef.current);
      let allItems = await db.table("items").toArray();

      // Apply additional where filters from options
      if (options.where?.length) {
        options.where.forEach((filter) => {
          allItems = allItems.filter((item) => {
            const value = item[filter.field];
            switch (filter.operator) {
              case "==":
                return value === filter.value;
              case "!=":
                return value !== filter.value;
              case ">":
                return value > filter.value;
              case "<":
                return value < filter.value;
              case ">=":
                return value >= filter.value;
              case "<=":
                return value <= filter.value;
              case "in":
                return filter.value.includes(value);
              default:
                return true;
            }
          });
        });
      }

      // ✅ NEW: Apply role-based filtering from config
      const currentUser = currentUserRef.current;
      if (currentUser) {
        allItems = applyRoleFilters(allItems, currentUser);
      }

      // ✅ NEW: Populate relations if requested
      if (options.populate?.length) {
        allItems = await populateRelations(allItems, options.populate);
      }

      console.log(
        `📋 Loaded ${allItems.length} items from ${actualCollectionRef.current} (${collection})`
      );
      setItems(allItems);
    } catch (error) {
      console.error("Failed to load collection:", error);
      setItems([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [
    collection,
    appConfig,
    options.where,
    options.populate,
    applyRoleFilters,
    populateRelations,
  ]);

  // ✅ ENHANCED: Check permissions before save
  const saveItem = useCallback(
    async (item: any) => {
      if (!actualCollectionRef.current) return;

      const currentUser = currentUserRef.current;
      const db = getDB(actualCollectionRef.current);
      const id = item.id || Date.now().toString();

      // ✅ NEW: Check create permissions
      if (!item.id && currentUser && appConfig?.database?.permissions) {
        const collectionPermissions =
          appConfig.database.permissions[collection];
        const rolePermission = collectionPermissions?.[currentUser.role];

        if (rolePermission && rolePermission.canCreate === false) {
          throw new Error(
            `Role ${currentUser.role} cannot create ${collection}`
          );
        }
      }

      // Auto-populate user fields based on config
      if (currentUser && !item.id) {
        // Auto-populate based on relations
        const relations = appConfig?.database?.relations;
        if (relations) {
          Object.entries(relations).forEach(([relationKey, relationConfig]) => {
            if (
              relationKey.startsWith(`${collection}.`) &&
              relationConfig.foreignKey.includes("Id")
            ) {
              const fieldName = relationConfig.foreignKey;
              if (!item[fieldName] && relationConfig.target === "users") {
                item[fieldName] = currentUser.id;
                console.log(
                  `🔄 Auto-populated ${fieldName} = ${currentUser.id}`
                );
              }
            }
          });
        }

        // Legacy auto-population for tickets
        if (collection === "tickets") {
          item.reporterId = item.reporterId || currentUser.id;
          item.reporterEmail = item.reporterEmail || currentUser.email;
        }
      }

      const record = {
        ...item,
        id,
        createdAt: item.createdAt || new Date(),
        updatedAt: new Date(),
      };

      console.log(`💾 Saving to ${actualCollectionRef.current}:`, record);
      await db.table("items").put(record);
      await loadItems();
      return record;
    },
    [
      collection,
      loadItems,
      appConfig?.database?.permissions,
      appConfig?.database?.relations,
    ]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      if (!actualCollectionRef.current) return;

      const currentUser = currentUserRef.current;

      // ✅ NEW: Check delete permissions
      if (currentUser && appConfig?.database?.permissions) {
        const collectionPermissions =
          appConfig.database.permissions[collection];
        const rolePermission = collectionPermissions?.[currentUser.role];

        if (rolePermission && rolePermission.canDelete === false) {
          throw new Error(
            `Role ${currentUser.role} cannot delete ${collection}`
          );
        }
      }

      const db = getDB(actualCollectionRef.current);
      console.log(`🗑️ Deleting from ${actualCollectionRef.current}:`, id);
      await db.table("items").delete(id);
      await loadItems();
    },
    [collection, loadItems, appConfig?.database?.permissions]
  );

  // Load items when config is ready
  useEffect(() => {
    if (appConfig && !loadingRef.current) {
      loadItems();
    }
  }, [appConfig, loadItems]);

  return {
    items,
    loading,
    saveItem,
    deleteItem,
    refresh: loadItems,
  };
}

// Export both names for compatibility
export const useCollection = useCollections;
