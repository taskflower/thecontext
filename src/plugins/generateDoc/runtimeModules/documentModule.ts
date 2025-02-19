import { AddContainerInput, AddDocumentInput } from "@/types/document";

// src/plugins/generateDoc/runtimeModules/documentModule.ts

  interface DocumentModuleProps {
    addDocument: (doc: AddDocumentInput) => void;
    addContainer: (container: AddContainerInput) => void;
  }
  
  export const documentModule = {
    saveDocument: (
      props: DocumentModuleProps,
      documentName: string,
      containerName: string,
      content: string
    ) => {
      const containerId = Date.now().toString();
      
      if (containerName) {
        const newContainer = {
          name: containerName,
          description: `Container for ${documentName}`,
        };
        props.addContainer(newContainer);
      }
  
      const newDocument = {
        title: documentName,
        content: content,
        documentContainerId: containerId,
        order: 0,
        metadata: {
          generatedFrom: 'plugin',
          timestamp: new Date().toISOString(),
        }
      };
  
      props.addDocument(newDocument);
      return newDocument;
    }
  };