// src/store/documentStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";


import { ContainerManager } from "@/utils/utils";
import { DocumentState } from "@/utils/documents/documentsInterfaces";
import { containerActions } from "@/utils/documents/containerActions";
import { documentActions } from "@/utils/documents/documentActions";
import { relationActions } from "@/utils/documents/relationActions";
import { schemaActions } from "@/utils/documents/schemaActions";

// Combine data interface with actions using intersection type
export type DocumentStore = DocumentState &
  ReturnType<typeof containerActions> &
  ReturnType<typeof documentActions> &
  ReturnType<typeof schemaActions> &
  ReturnType<typeof relationActions>;

export const useDocumentStore = create<DocumentStore, [["zustand/persist", unknown]]>(
  persist(
    (set, get) => ({
      // Data
      containers: [],
      relations: [],
      containerManager: new ContainerManager(),
      
      // Actions
      ...containerActions(set, get),
      ...documentActions(set, get),
      ...schemaActions(set, get),
      ...relationActions(set, get),
    }),
    {
      name: "document-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        containers: state.containers,
        relations: state.relations
      })
    }
  )
);