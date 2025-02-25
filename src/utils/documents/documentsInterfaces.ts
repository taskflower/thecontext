// src/utils/documents/documentsInterfaces.ts
import { IContainer, IContainerRelation } from "./documentTypes";
import { ContainerManager } from "../utils";

export interface DocumentState {
  containers: IContainer[];
  relations: IContainerRelation[];
  containerManager: ContainerManager;
}

export type SetState = (fn: (state: DocumentState) => DocumentState) => void;
export type GetState = () => DocumentState;

export function initializeDocumentState(): DocumentState {
  return {
    containers: [],
    relations: [],
    containerManager: new ContainerManager()
  };
}