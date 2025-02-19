import { AddContainerInput, AddDocumentInput } from "@/types/document";

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
    const newContainer: AddContainerInput = {
      name: containerName,
      description: `Container for ${documentName}`
    };
    props.addContainer(newContainer);

    const newDocument: AddDocumentInput = {
      title: documentName,
      content: content,
      documentContainerId: containerName,
      order: 0,
      customFields: {
        generatedFrom: 'WebPageAnalyser',
        timestamp: new Date().toISOString()
      }
    };

    props.addDocument(newDocument);
    return newDocument;
  }
};