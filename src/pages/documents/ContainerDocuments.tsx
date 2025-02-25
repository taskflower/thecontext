// ContainerDocuments.tsx
import {
  ContainerDropdown,
  DocumentFilters,
  DocumentPreviewDialog,
  DocumentTable,
} from "@/components/documents";
import { Button, Card, CardContent } from "@/components/ui";

import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { useDocumentsStore } from "@/store/documentsStore";
import { Trans } from "@lingui/macro";
import { FilePlus, Folder } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useAdminNavigate, useDocumentFiltering } from "@/hooks";

export const ContainerDocuments = () => {
  const { containerId } = useParams();
  const adminNavigate = useAdminNavigate();
  const {
    containers,
    removeDocument,
    getContainerDocuments,
    updateDocument,
    relationConfigs,
    relations,
  } = useDocumentsStore();

  // Hook wywoływany zawsze – nawet jeśli containerId nie istnieje, documents będzie pustą tablicą
  const documents = containerId ? getContainerDocuments(containerId) : [];
  const { filter, setFilter, filteredDocuments } = useDocumentFiltering({
    documents,
    relationFilter: null, // Możesz ustawić filtr relacji, jeśli jest potrzebny
    relations,
  });

  const container = containers.find((c) => c.id === containerId);
  const [selectedDocument, setSelectedDocument] = useState<{
    title: string;
    content: string;
  } | null>(null);

  if (!container) {
    return (
      <div>
        <Trans>Container not found</Trans>
      </div>
    );
  }

  const handleBack = () => adminNavigate("/documents");

  const handleMoveDocument = (docId: string, direction: "up" | "down") => {
    const docs = getContainerDocuments(container.id);
    const currentIndex = docs.findIndex((d) => d.id === docId);
    if (direction === "up" && currentIndex > 0) {
      const prevDoc = docs[currentIndex - 1];
      updateDocument(docId, { order: prevDoc.order });
      updateDocument(prevDoc.id, { order: docs[currentIndex].order });
    } else if (direction === "down" && currentIndex < docs.length - 1) {
      const nextDoc = docs[currentIndex + 1];
      updateDocument(docId, { order: nextDoc.order });
      updateDocument(nextDoc.id, { order: docs[currentIndex].order });
    }
  };

  const handleDeleteContainer = (id: string) => {
    console.log("Usuwam container o id:", id);
  };

  return (
    <AdminOutletTemplate
    title={<span><Folder className="inline h-5 w-5 mr-2" /> {container.name}</span>}
      description={
        container.description ? (
          <Trans>{container.description}</Trans>
        ) : (
          <Trans>This container has no description</Trans>
        )
      }
      actions={
        <>
          <Button size="sm" variant="outline" onClick={handleBack}>
            <Trans>Back to Containers</Trans>
          </Button>
         
          <Button
            className="gap-2"
            onClick={() =>
              adminNavigate(`/documents/${containerId}/document/new`)
            }
          >
            <FilePlus className="h-4 w-4" />
            <Trans>New Document</Trans>
          </Button>
        
        </>
      }
    >
     
      <div className="space-y-4">
        
        <DocumentFilters
          filter={filter}
          onFilterChange={setFilter}
          selectedRelationFilter={null} // Jeśli potrzebujesz, dodaj logikę dla filtra relacji
          setSelectedRelationFilter={() => {}}
          relationConfigs={relationConfigs}
        />
        
        <Card>
          <CardContent className="p-0">
            <DocumentTable
              documents={filteredDocuments}
              container={container}
              onPreview={setSelectedDocument}
              onEdit={(id) =>
                adminNavigate(`/documents/${containerId}/document/${id}/edit`)
              }
              onMove={handleMoveDocument}
              onDelete={removeDocument}
            />
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end">
      <ContainerDropdown
            containerId={container.id}
            onDelete={handleDeleteContainer}
          />
      </div>
      
      <DocumentPreviewDialog
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </AdminOutletTemplate>
  );
};

export default ContainerDocuments;
