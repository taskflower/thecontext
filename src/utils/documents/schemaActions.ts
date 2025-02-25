// src/utils/documents/schemaActions.ts
import { IDocumentSchema } from "./documentTypes";
import { SetState, GetState } from "./documentsInterfaces";
import { generateId } from "../utils";

export interface SchemaActions {
  addSchema: (containerId: string, schema: Omit<IDocumentSchema, "id">) => string;
  updateSchema: (containerId: string, schemaId: string, updates: Partial<IDocumentSchema>) => void;
  removeSchema: (containerId: string, schemaId: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const schemaActions = (set: SetState, get: GetState): SchemaActions => ({
  addSchema: (containerId: string, schema: Omit<IDocumentSchema, "id">) => {
    const schemaId = generateId();
    set((state) => ({
      ...state,
      containers: state.containers.map((container) => 
        container.id === containerId
          ? {
              ...container,
              schemas: [
                ...container.schemas,
                {
                  id: schemaId,
                  name: schema.name,
                  fields: schema.fields || []
                }
              ]
            }
          : container
      )
    }));
    return schemaId;
  },
  
  updateSchema: (containerId: string, schemaId: string, updates: Partial<IDocumentSchema>) => 
    set((state) => ({
      ...state,
      containers: state.containers.map((container) => 
        container.id === containerId
          ? {
              ...container,
              schemas: container.schemas.map((schema) => 
                schema.id === schemaId ? { ...schema, ...updates } : schema
              )
            }
          : container
      )
    })),
  
  removeSchema: (containerId: string, schemaId: string) => 
    set((state) => ({
      ...state,
      containers: state.containers.map((container) => 
        container.id === containerId
          ? {
              ...container,
              schemas: container.schemas.filter((schema) => schema.id !== schemaId),
              documents: container.documents.map(doc => 
                doc.schemaId === schemaId 
                  ? { ...doc, schemaId: container.schemas[0]?.id || 'default' }
                  : doc
              )
            }
          : container
      )
    })),
});