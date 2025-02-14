// src/plugins/generateDoc/runtimeModules/documentModule.ts
interface Container {
    name: string;
    description: string;
  }
  
  interface Document {
    title: string;
    content: string;
    documentContainerId: string;
    order: number;
    metadata: {
      generatedFrom: string;
      timestamp: string;
    };
  }
  
  interface DocumentModuleProps {
    addDocument: (doc: Document) => void;
    addContainer: (container: Container) => void;
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