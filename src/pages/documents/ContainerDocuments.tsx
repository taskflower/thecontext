// ContainerDocuments.tsx
import {
  DocumentPreviewDialog,
  DocumentSearch,
  DocumentTable,
} from "@/components/documents";
import { Button, Card, CardContent } from "@/components/ui";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { useDocumentsStore } from "@/store/documentsStore";
import { Trans } from "@lingui/macro";
import { FilePlus, Settings2 } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useDocumentFilter } from "@/utils/documents/hooks";
import ContainerDropdown from "@/components/documents/container/ContainerDropdown";

export const ContainerDocuments = () => {
  const { containerId } = useParams();
  const adminNavigate = useAdminNavigate();
  const { containers, removeDocument, getContainerDocuments, updateDocument } =
    useDocumentsStore();

  const container = containers.find((c) => c.id === containerId);
  const documents = getContainerDocuments(containerId || "");

  const { filter, setFilter, filteredDocuments } = useDocumentFilter(documents);
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

  // Przykładowa funkcja usuwająca container, którą możesz dostosować do swoich potrzeb
  const handleDeleteContainer = (id: string) => {
    // np. wywołanie metody usuwającej container z magazynu
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
          {/* Zastępujemy przycisk "Edit Container" komponentem ContainerDropdown */}
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
        <div className="flex items-center gap-2">
          <DocumentSearch value={filter} onChange={setFilter} />
          <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 lg:flex"
          >
            <Settings2 className="mr-2 h-4 w-4" />
            <Trans>View</Trans>
          </Button>
        </div>
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
