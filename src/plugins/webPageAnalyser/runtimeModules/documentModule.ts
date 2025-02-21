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
    // Używamy getContainers i getDocuments lub domyślnie pustych tablic
    const containers = props.getContainers ? props.getContainers() : [];
    const documents = props.getDocuments ? props.getDocuments() : [];

    // Szukanie istniejącego kontenera
    let containerId: string;
    const existingContainer = containers.find(
      (c) => c.name.toLowerCase() === containerName.toLowerCase()
    );
    if (existingContainer) {
      containerId = existingContainer.id;
    } else {
      const newContainer: AddContainerInput = {
        name: containerName,
        description: `Container for ${documentName}`,
      };
      props.addContainer(newContainer);
      // Zakładamy, że nowy kontener otrzyma id wygenerowane przez addContainer
      containerId = Date.now().toString();
    }

    // Ustalanie unikalnej nazwy dokumentu
    let finalDocumentName = documentName;
    const similarDocs = documents.filter((doc) =>
      doc.title.startsWith(documentName)
    );
    if (similarDocs.length > 0) {
      const suffixes = similarDocs.map((doc) => {
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
      timestamp: new Date().toISOString(),
    };

    props.addDocument(newDocument);
    return newDocument;
  },
};
