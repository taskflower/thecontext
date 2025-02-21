// AllDocuments.tsx
import {
  DocumentPreviewDialog,
  DocumentTable,
  RelatedDocuments,
} from "@/components/documents";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Card, CardContent } from "@/components/ui";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { useDocumentsStore } from "@/store/documentsStore";
import { Trans } from "@lingui/macro";
import { useState } from "react";
import { Document } from "@/types/document";
import { useDocumentFilter } from "@/utils/documents/hooks";
import DocumentFilters from "@/components/documents/relations/DocumentFilters";


export const AllDocuments = () => {
  const adminNavigate = useAdminNavigate();
  const { documents, containers, removeDocument, relationConfigs, relations } = useDocumentsStore();

  const { filter, setFilter, filteredDocuments: baseFilteredDocuments } = useDocumentFilter(documents);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedRelatedDocument, setSelectedRelatedDocument] = useState<Document | null>(null);
  const [selectedRelationFilter, setSelectedRelationFilter] = useState<string | null>(null);

  // Filtrowanie dokumentów wg relacji
  const filteredDocuments = selectedRelationFilter
    ? baseFilteredDocuments.filter((doc) => {
        const matchingRelation = relations.find((rel) =>
          rel.configId === selectedRelationFilter &&
          (rel.sourceDocumentId === doc.id || rel.targetDocumentId === doc.id)
        );
        return !!matchingRelation;
      })
    : baseFilteredDocuments;

  const getContainerName = (containerId: string) => {
    const container = containers.find((c) => c.id === containerId);
    return container?.name || "No Container";
  };

  const handleMoveDocument = (docId: string, direction: "up" | "down") => {
    console.log(docId, direction);
  };

  const handleEditDocument = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      adminNavigate(`/documents/${doc.documentContainerId}/document/${id}/edit`);
    }
  };

  const enhancedDocuments = filteredDocuments.map((doc) => ({
    ...doc,
    containerName: getContainerName(doc.documentContainerId),
  }));

  return (
    <AdminOutletTemplate
      title={<Trans>All Documents</Trans>}
      description={<Trans>View and manage all documents across containers</Trans>}
      actions={
        <DocumentFilters
          filter={filter}
          onFilterChange={setFilter}
          selectedRelationFilter={selectedRelationFilter}
          setSelectedRelationFilter={setSelectedRelationFilter}
          relationConfigs={relationConfigs}
          onBackToContainers={() => adminNavigate("/documents/containers")}
        />
      }
    >
      <div className="space-y-4">
        <Card>
          <CardContent className="p-0">
            <DocumentTable
              documents={enhancedDocuments}
              onPreview={setSelectedDocument}
              onEdit={handleEditDocument}
              onMove={handleMoveDocument}
              onDelete={removeDocument}
              showContainer
            />
          </CardContent>
        </Card>
      </div>
      <DocumentPreviewDialog
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
      <Dialog
        open={!!selectedRelatedDocument}
        onOpenChange={() => setSelectedRelatedDocument(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <Trans>Related Documents for {selectedRelatedDocument?.title}</Trans>
            </DialogTitle>
          </DialogHeader>
          {selectedRelatedDocument && (
            <RelatedDocuments documentId={selectedRelatedDocument.id} />
          )}
        </DialogContent>
      </Dialog>
    </AdminOutletTemplate>
  );
};

export default AllDocuments;
