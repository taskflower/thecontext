// ContainerDocuments.tsx
import {
  DocumentPreviewDialog,
  DocumentTable,
} from "@/components/documents";
import { Button, Card, CardContent } from "@/components/ui";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { useDocumentsStore } from "@/store/documentsStore";
import { Trans } from "@lingui/macro";
import { FilePlus } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useDocumentFilter } from "@/utils/documents/hooks";
import ContainerDropdown from "@/components/documents/container/ContainerDropdown";
import DocumentFilters from "@/components/documents/relations/DocumentFilters";


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

  const container = containers.find((c) => c.id === containerId);
  const documents = getContainerDocuments(containerId || "");

  const { filter, setFilter, filteredDocuments: baseFilteredDocuments } =
    useDocumentFilter(documents);

  // Dodajemy stan dla filtra relacji
  const [selectedRelationFilter, setSelectedRelationFilter] = useState<string | null>(null);

  // Filtrowanie dokumentów wg relacji (jeśli filtr został ustawiony)
  const filteredDocuments = selectedRelationFilter
    ? baseFilteredDocuments.filter((doc) => {
        const matchingRelation = relations.find(
          (rel) =>
            rel.configId === selectedRelationFilter &&
            (rel.sourceDocumentId === doc.id || rel.targetDocumentId === doc.id)
        );
        return !!matchingRelation;
      })
    : baseFilteredDocuments;

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
    const currentIndex = documents.findIndex((d) => d.id === docId);
    if (direction === "up" && currentIndex > 0) {
      const prevDoc = documents[currentIndex - 1];
      updateDocument(docId, { order: prevDoc.order });
      updateDocument(prevDoc.id, { order: documents[currentIndex].order });
    } else if (direction === "down" && currentIndex < documents.length - 1) {
      const nextDoc = documents[currentIndex + 1];
      updateDocument(docId, { order: nextDoc.order });
      updateDocument(nextDoc.id, { order: documents[currentIndex].order });
    }
  };

  // Przykładowa funkcja usuwająca container
  const handleDeleteContainer = (id: string) => {
    console.log("Usuwam container o id:", id);
  };

  return (
    <AdminOutletTemplate
      title={<Trans>{container.name}</Trans>}
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
          <ContainerDropdown containerId={container.id} onDelete={handleDeleteContainer} />
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
          selectedRelationFilter={selectedRelationFilter}
          setSelectedRelationFilter={setSelectedRelationFilter}
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
      <DocumentPreviewDialog
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </AdminOutletTemplate>
  );
};

export default ContainerDocuments;
