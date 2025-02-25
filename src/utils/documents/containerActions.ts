// src/utils/documents/containerActions.ts
import { IContainer } from "./documentTypes";
import { SetState, GetState } from "./documentsInterfaces";
import { generateId } from "../utils";

export interface ContainerActions {
  addContainer: (name: string) => string;
  updateContainer: (id: string, updates: Partial<IContainer>) => void;
  removeContainer: (id: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const containerActions = (set: SetState, get: GetState): ContainerActions => ({
  addContainer: (name: string) => {
    const id = generateId();
    set((state) => ({
      ...state,
      containers: [
        ...state.containers,
        {
          id,
          name,
          documents: [],
          schemas: [],
          customFields: {}
        }
      ]
    }));
    return id;
  },
  
  updateContainer: (id: string, updates: Partial<IContainer>) => 
    set((state) => ({
      ...state,
      containers: state.containers.map((container) => 
        container.id === id ? { ...container, ...updates } : container
      )
    })),
  
  removeContainer: (id: string) => 
    set((state) => ({
      ...state,
      containers: state.containers.filter((container) => container.id !== id),
      relations: state.relations.filter(
        (relation) => 
          relation.sourceContainerId !== id && relation.targetContainerId !== id
      )
    })),
});