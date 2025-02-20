// src/pages/documents/ContainerDocuments.tsx
import { useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import { Settings2, FilePlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { SearchInput } from "@/components/common/SearchInput";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Trans, t } from "@lingui/macro";
import { MarkdownPreview } from "@/components/documents/MarkdownComponents";

export const ContainerDocuments = () => {
  const { containerId } = useParams();
  const adminNavigate = useAdminNavigate();
  const { containers, removeDocument, getContainerDocuments, updateDocument } =
    useDocumentsStore();

  const [filter, setFilter] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<{
    title: string;
    content: string;
  } | null>(null);

  const container = containers.find((c) => c.id === containerId);
  const documents = getContainerDocuments(containerId || "");

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(filter.toLowerCase()) ||
      doc.content.toLowerCase().includes(filter.toLowerCase())
  );

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
          <Button variant="outline" onClick={handleBack}>
            <Trans>Back to Containers</Trans>
          </Button>
           {/* Nowy przycisk do edycji kontenera */}
        <Button variant="outline" onClick={() => adminNavigate(`/documents/${containerId}/edit`)}>
          <Trans>Edit Container</Trans>
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
        <div className="flex items-center gap-2">
          <SearchInput
            value={filter}
            onChange={setFilter}
            placeholder={t`Filter documents...`}
            className="h-8 w-[150px] lg:w-[250px]"
          />
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
              container={container} // Dodaj tę linię
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

      <Dialog
        open={!!selectedDocument}
        onOpenChange={() => setSelectedDocument(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title}</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <MarkdownPreview content={selectedDocument.content} />
          )}
        </DialogContent>
      </Dialog>
    </AdminOutletTemplate>
  );
};
export default ContainerDocuments;
