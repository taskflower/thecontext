// src/utils/documents/relationActions.ts
import { IContainerDocument, IContainerRelation } from "./documentTypes";
import { SetState, GetState } from "./documentsInterfaces";
import { generateId } from "../utils";

export interface RelationActions {
  addRelation: (relation: Omit<IContainerRelation, "id">) => string;
  updateRelation: (id: string, updates: Partial<IContainerRelation>) => void;
  removeRelation: (id: string) => void;
  getDocumentsByRelation: (relationId: string) => IContainerDocument[];
}

export const relationActions = (set: SetState, get: GetState): RelationActions => ({
  addRelation: (relation: Omit<IContainerRelation, "id">) => {
    const id = generateId();
    set((state) => ({
      ...state,
      relations: [
        ...state.relations,
        {
          id,
          sourceContainerId: relation.sourceContainerId,
          targetContainerId: relation.targetContainerId,
          sourceField: relation.sourceField,
          targetField: relation.targetField,
          condition: relation.condition
        }
      ]
    }));
    return id;
  },
  
  updateRelation: (id: string, updates: Partial<IContainerRelation>) => 
    set((state) => ({
      ...state,
      relations: state.relations.map((relation) => 
        relation.id === id ? { ...relation, ...updates } : relation
      )
    })),
  
  removeRelation: (id: string) => 
    set((state) => ({
      ...state,
      relations: state.relations.filter((relation) => relation.id !== id)
    })),
  
  getDocumentsByRelation: (relationId: string) => {
    const { relations, containers, containerManager } = get();
    const relation = relations.find(r => r.id === relationId);
    if (!relation) return [];
    
    return containerManager.filterDocumentsByRelation(relation, containers);
  }
});