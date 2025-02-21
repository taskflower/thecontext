// src/plugins/webPageAnalyser/runtimeModules/documentModule.ts
import { AddContainerInput, AddDocumentInput } from "@/types/document";

interface DocumentModuleProps {
  addDocument: (doc: AddDocumentInput) => void;
  addContainer: (container: AddContainerInput) => void;
  getContainers?: () => { id: string; name: string }[];
  getDocuments?: () => { title: string }[];
}

export const documentModule = {
  saveDocument: (
    props: DocumentModuleProps,
    documentName: string,
    containerName: string,
    content: string
  ) => {
    let containerId: string;

    // Sprawdzamy czy kontener już istnieje
    const containers = props.getContainers?.() || [];
    const existingContainer = containers.find(
      c => c.name.toLowerCase() === containerName.toLowerCase()
    );

    if (existingContainer) {
      // Jeśli kontener istnieje, używamy jego ID
      containerId = existingContainer.id;
    } else {
      // Jeśli nie istnieje, tworzymy nowy
      props.addContainer({
        name: containerName,
        description: `Container for ${documentName}`
      });
      // Sprawdzamy ponownie listę kontenerów, aby pobrać ID nowo utworzonego
      const updatedContainers = props.getContainers?.() || [];
      const newContainer = updatedContainers.find(
        c => c.name.toLowerCase() === containerName.toLowerCase()
      );
      containerId = newContainer?.id || Date.now().toString();
    }

    // Sprawdzamy czy nazwa dokumentu jest unikalna
    let finalDocumentName = documentName;
    const documents = props.getDocuments?.() || [];
    const similarDocs = documents.filter(doc => 
      doc.title.startsWith(documentName)
    );
    
    if (similarDocs.length > 0) {
      const suffixes = similarDocs.map(doc => {
        const regex = new RegExp(`^${documentName}(\\s(\\d+))?$`);
        const match = doc.title.match(regex);
        if (match && match[2]) {
          return parseInt(match[2], 10);
        } else if (match) {
          return 1;
        }
        return 0;
      });
      const nextSuffix = Math.max(...suffixes) + 1;
      finalDocumentName = `${documentName} ${nextSuffix}`;
    }

    const newDocument: AddDocumentInput = {
      title: finalDocumentName,
      content: content,
      documentContainerId: containerId,
      order: 0,
      generatedFrom: "plugin",
      timestamp: new Date().toISOString()
    };

    props.addDocument(newDocument);
    return newDocument;
  }
};