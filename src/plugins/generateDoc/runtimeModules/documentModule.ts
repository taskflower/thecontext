// src/plugins/generateDoc/runtimeModules/documentModule.ts

import { AddContainerInput, AddDocumentInput } from "@/types/document";

interface DocumentModuleProps {
  addDocument: (doc: AddDocumentInput) => void;
  addContainer: (container: AddContainerInput) => void;
  // Opcjonalnie: funkcje pomocnicze do pobierania istniejących kontenerów i dokumentów
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
    // Ustalenie docelowego kontenera
    let containerId: string;
    if (containerName) {
      const existingContainer = props.getContainers
        ? props.getContainers().find(
            c => c.name.toLowerCase() === containerName.toLowerCase()
          )
        : undefined;
      if (existingContainer) {
        containerId = existingContainer.id;
      } else {
        const newContainer: AddContainerInput = {
          name: containerName,
          description: `Container for ${documentName}`
        };
        props.addContainer(newContainer);
        // Założenie: metoda addContainer utworzy nowy kontener z generowanym id.
        // Jeśli nie mamy zwrotnej wartości, możemy ponownie pobrać listę kontenerów.
        if (props.getContainers) {
          const created = props.getContainers().find(
            c => c.name.toLowerCase() === containerName.toLowerCase()
          );
          if (!created) {
            throw new Error("Nie udało się utworzyć kontenera");
          }
          containerId = created.id;
        } else {
          // Jeśli nie mamy metody pobierającej, przyjmujemy, że id zostało wygenerowane w addContainer
          containerId = Date.now().toString();
        }
      }
    } else {
      throw new Error("Podaj nazwę kontenera");
    }

    // Ustalenie unikalnej nazwy dokumentu
    let finalDocumentName = documentName;
    if (props.getDocuments) {
      const similarDocs = props
        .getDocuments()
        .filter(doc => doc.title.startsWith(documentName));
      if (similarDocs.length > 0) {
        // Wyciągamy numery sufiksów, np. "Dokument 1", "Dokument 2" itd.
        const suffixes = similarDocs.map(doc => {
          const match = doc.title.match(new RegExp(`^${documentName}(\\s(\\d+))?$`));
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
    }

    // Tworzenie dokumentu
    const newDocument: AddDocumentInput = {
      title: finalDocumentName,
      content: content,
      documentContainerId: containerId,
      order: 0,
      generatedFrom: 'plugin',
      timestamp: new Date().toISOString(),
    };

    props.addDocument(newDocument);
    return newDocument;
  }
};
