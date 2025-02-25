// src/utils/utils.ts
import { IContainerDocument, IContainerRelation, IContainer } from "./documents/documentTypes";
import { useProjectStore } from "../store/projectStore";

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export class ContainerManager {
  // Metoda do filtrowania dokumentów na podstawie relacji
  filterDocumentsByRelation(relation: IContainerRelation, containers: IContainer[]): IContainerDocument[] {
    const sourceContainer = containers.find(c => c.id === relation.sourceContainerId);
    const targetContainer = containers.find(c => c.id === relation.targetContainerId);
    
    if (!sourceContainer || !targetContainer) return [];
    
    // Implementacja logiki filtrowania dokumentów na podstawie relacji
    // To jest przykładowa implementacja, można ją dostosować do potrzeb
    return targetContainer.documents.filter(targetDoc => {
      return sourceContainer.documents.some(sourceDoc => {
        const sourceValue = sourceDoc.customFields[relation.sourceField];
        const targetValue = targetDoc.customFields[relation.targetField];
        
        switch (relation.condition) {
          case 'equals':
            return sourceValue === targetValue;
          case 'greater':
            return sourceValue > targetValue;
          case 'less':
            return sourceValue < targetValue;
          case 'contains':
            if (typeof sourceValue === 'string' && typeof targetValue === 'string') {
              return sourceValue.includes(targetValue) || targetValue.includes(sourceValue);
            }
            return false;
          default:
            return false;
        }
      });
    });
  }
  
  // Metoda do pobierania kontenerów na podstawie ID projektu
  getContainersByProjectId(projectId: string, containers: IContainer[]): IContainer[] {
    const { getProjectById } = useProjectStore.getState();
    const project = getProjectById(projectId);
    
    if (!project) return [];
    
    return containers.filter(container => 
      project.containers.includes(container.id)
    );
  }
}