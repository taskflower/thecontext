/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Generic entity slice creator
 * This file provides a factory for creating state slices for different entity types
 */
import { StateCreator } from "zustand";
import { Draft } from "immer";
import { BaseEntity, EntityType, EntityPayload } from "../models/core";

/**
 * Generic CRUD actions for entities
 */
export interface EntityActions<T extends BaseEntity> {
  // Read operations
  getAll: () => T[];
  getById: (id: string) => T | undefined;
  getByIds: (ids: string[]) => T[];
  
  // Create operations
  create: (payload: EntityPayload<T>) => T;
  
  // Update operations
  update: (id: string, payload: Partial<EntityPayload<T>>) => boolean;
  
  // Delete operations
  delete: (id: string) => boolean;
  
  // Selection
  select: (id: string) => void;
}

/**
 * Options for entity slice creation
 */
export interface EntitySliceOptions<T extends BaseEntity> {
  entityType: EntityType;
  parentType?: EntityType;
  getParentId?: (state: any) => string;
  getCollection: (state: any) => T[];
}

/**
 * Generic function to create an entity slice with CRUD operations
 */
export function createEntitySlice<T extends BaseEntity, S extends object>(
  options: EntitySliceOptions<T>
): StateCreator<S, [["zustand/immer", never]], [], EntityActions<T>> {
  
  return (set, get) => ({
    /**
     * Get all entities of this type
     */
    getAll: () => {
      const collection = options.getCollection(get());
      return collection || [];
    },
    
    /**
     * Get entity by ID
     */
    getById: (id: string) => {
      const collection = options.getCollection(get());
      return collection?.find(item => item.id === id);
    },
    
    /**
     * Get entities by multiple IDs
     */
    getByIds: (ids: string[]) => {
      const collection = options.getCollection(get());
      return collection?.filter(item => ids.includes(item.id)) || [];
    },
    
    /**
     * Create a new entity
     */
    create: (payload: EntityPayload<T>) => {
      let newEntity: T;
      
      set((state: Draft<S>) => {
        // Create new entity with all required fields
        newEntity = {
          id: `${options.entityType}-${Date.now()}`,
          type: options.entityType,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ...payload,
        } as T;
        
        // Get the appropriate collection
        const collection = options.getCollection(state);
        
        // Add to collection
        if (Array.isArray(collection)) {
          collection.push(newEntity);
        }
        
        // Update state version if available
        if ('version' in state) {
          (state as any).version++;
        }
      });
      
      return newEntity!;
    },
    
    /**
     * Update an existing entity
     */
    update: (id: string, payload: Partial<EntityPayload<T>>) => {
      let success = false;
      
      set((state: Draft<S>) => {
        const collection = options.getCollection(state);
        const index = collection?.findIndex(item => item.id === id);
        
        if (collection && index !== undefined && index !== -1) {
          // Update entity with new values and update timestamp
          Object.assign(collection[index], {
            ...payload,
            updatedAt: Date.now()
          });
          
          // Update state version if available
          if ('version' in state) {
            (state as any).version++;
          }
          
          success = true;
        }
      });
      
      return success;
    },
    
    /**
     * Delete an entity by ID
     */
    delete: (id: string) => {
      let success = false;
      
      set((state: Draft<S>) => {
        const collection = options.getCollection(state);
        const index = collection?.findIndex(item => item.id === id);
        
        if (collection && index !== undefined && index !== -1) {
          // Remove entity from collection
          collection.splice(index, 1);
          
          // Update state version if available
          if ('version' in state) {
            (state as any).version++;
          }
          
          success = true;
        }
      });
      
      return success;
    },
    
    /**
     * Select an entity
     */
    select: (id: string) => {
      set((state: Draft<S>) => {
        // If state has a selected field, update it
        if ('selected' in state) {
          const selectedState = (state as any).selected;
          
          // Update selected entity based on type
          if (selectedState && options.entityType in selectedState) {
            selectedState[options.entityType] = id;
          }
          
          // Update state version if available
          if ('version' in state) {
            (state as any).version++;
          }
        }
      });
    }
  });
}

/**
 * Higher-order function to create nested entity slices
 * This handles parent-child relationships automatically
 */
export function createNestedEntitySlice<
  T extends BaseEntity & { [parentIdField: string]: string },
  S extends object
>(
  entityType: EntityType,
  parentType: EntityType,
  parentIdField: string,
  getParentCollection: (state: any) => any[],
  getSelectedParentId: (state: any) => string
): StateCreator<S, [["zustand/immer", never]], [], EntityActions<T>> {
  return (set, get) => {
    // Create basic entity slice
    const baseSlice = createEntitySlice<T, S>({
      entityType,
      parentType,
      getParentId: getSelectedParentId,
      getCollection: (state) => {
        const parentId = getSelectedParentId(state);
        const parents = getParentCollection(state);
        const parent = parents?.find(p => p.id === parentId);
        return parent?.[`${entityType}s`] || [];
      }
    });
    
    // Extend with nested entity behavior
    return {
      // Spread all baseSlice methods
      ...baseSlice,
      
      // Override create to handle parent relationship
      create: (payload: EntityPayload<T>) => {
        console.log(`Creating nested entity of type ${entityType} with payload:`, payload);
        
        try {
          const parentId = getSelectedParentId(get());
          console.log(`Parent ID (${parentType}) for new ${entityType}:`, parentId);
          
          if (!parentId) {
            console.error(`No parent ID (${parentType}) available for creating ${entityType}`);
            throw new Error(`No parent ID available for creating ${entityType}`);
          }
          
          const extendedPayload = {
            ...payload,
            [parentIdField]: parentId
          } as EntityPayload<T>;
          
          console.log(`Extended payload for ${entityType}:`, extendedPayload);
          
          // Fallback implementation in case baseSlice.create is undefined
          if (typeof baseSlice.create !== 'function') {
            console.error(`baseSlice.create is not a function for ${entityType}`, baseSlice);
            
            // Direct implementation if the baseSlice.create isn't available
            let newEntity: T;
            
            set((state: Draft<S>) => {
              // Create new entity with all required fields
              newEntity = {
                id: `${entityType}-${Date.now()}`,
                type: entityType,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                [parentIdField]: parentId,
                ...payload,
              } as T;
              
              // Get the parent entity
              const parents = getParentCollection(state);
              const parent = parents?.find(p => p.id === parentId);
              
              if (!parent) {
                console.error(`Parent of type ${parentType} with ID ${parentId} not found`);
                throw new Error(`Parent not found`);
              }
              
              // Create or get the collection
              const collectionName = `${entityType}s`;
              if (!parent[collectionName]) {
                parent[collectionName] = [];
              }
              
              // Add to collection
              parent[collectionName].push(newEntity);
              
              // Update state version if available
              if ('version' in state) {
                (state as any).version++;
              }
            });
            
            return newEntity!;
          }
          
          // Use the base implementation if available
          return baseSlice.create(extendedPayload);
        } catch (error) {
          console.error(`Error creating ${entityType}:`, error);
          throw error;
        }
      }
    };
  };
}