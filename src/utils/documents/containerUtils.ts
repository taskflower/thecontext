// src/utils/documents/containerUtils.ts
import { DocumentContainer, AddContainerInput } from "@/types/document";
import { DocumentRelation } from "@/types/relation";
import { Errors } from "../errors";

export const isContainerNameUnique = (
  containers: DocumentContainer[],
  name: string,
  excludeId?: string
): boolean => {
  return !containers.some(
    container => container.id !== excludeId && container.name.toLowerCase() === name.toLowerCase()
  );
};

export const createContainer = (container: AddContainerInput): DocumentContainer => {
  return {
    ...container,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
};

export const canDeleteContainer = (
  containerId: string,
  relations: DocumentRelation[]
): boolean => {
  return !relations.some(
    rel => rel.sourceContainerId === containerId || rel.targetContainerId === containerId
  );
};

export const validateContainer = (
  container: AddContainerInput,
  existingContainers: DocumentContainer[]
): void => {
  if (!container.name.trim()) {
    throw Errors.CONTAINER_NAME_REQUIRED();
  }

  if (!isContainerNameUnique(existingContainers, container.name)) {
    throw Errors.CONTAINER_EXISTS(container.name);
  }
};