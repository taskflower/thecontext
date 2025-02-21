// AllDocuments.tsx

import {
  DocumentPreviewDialog,
  DocumentSearch,
  DocumentTable,
  RelatedDocuments,
} from "@/components/documents";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { useDocumentsStore } from "@/store/documentsStore";
import { t, Trans } from "@lingui/macro";
import { Filter } from "lucide-react";
import { useState } from "react";
import { Document } from "@/types/document";

import { useDocumentFilter } from "@/utils/documents/hooks";

export const AllDocuments = () => {
  const adminNavigate = useAdminNavigate();
  const { documents, containers, removeDocument, relationConfigs, relations } =
    useDocumentsStore();

  const {
    filter,
    setFilter,
    filteredDocuments: baseFilteredDocuments,
  } = useDocumentFilter(documents);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [selectedRelatedDocument, setSelectedRelatedDocument] =
    useState<Document | null>(null);
  const [selectedRelationFilter, setSelectedRelationFilter] = useState<
    string | null
  >(null);

  // Dodatkowe filtrowanie wg relacji, jeśli wybrano filtr
  const filteredDocuments = selectedRelationFilter
    ? baseFilteredDocuments.filter((doc) =>
        relations.some(
          (rel) =>
            rel.configId === selectedRelationFilter &&
            (rel.sourceDocumentId === doc.id || rel.targetDocumentId === doc.id)
        )
      )
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
      adminNavigate(
        `/documents/${doc.documentContainerId}/document/${id}/edit`
      );
    }
  };

  const enhancedDocuments = filteredDocuments.map((doc) => ({
    ...doc,
    containerName: getContainerName(doc.documentContainerId),
  }));

  return (
    <AdminOutletTemplate
      title={<Trans>All Documents</Trans>}
      description={
        <Trans>View and manage all documents across containers</Trans>
      }
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden lg:flex"
            onClick={() => adminNavigate("/documents/containers")}
          >
            <Trans>Back to containers</Trans>
          </Button>
          {/* Dropdown Filters */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden lg:flex">
                <Filter className="mr-2 h-4 w-4" />
                {selectedRelationFilter
                  ? relationConfigs.find(
                      (config) => config.id === selectedRelationFilter
                    )?.name
                  : t`Filters`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {relationConfigs.length === 0 ? (
                <DropdownMenuItem disabled>
                  <Trans>No relation filters</Trans>
                </DropdownMenuItem>
              ) : (
                relationConfigs.map((config) => (
                  <DropdownMenuItem
                    key={config.id}
                    onClick={() => setSelectedRelationFilter(config.id)}
                  >
                    {config.name}
                  </DropdownMenuItem>
                ))
              )}
              {selectedRelationFilter && (
                <DropdownMenuItem
                  onClick={() => setSelectedRelationFilter(null)}
                >
                  <Trans>Clear Filter</Trans>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DocumentSearch value={filter} onChange={setFilter} />
        </div>
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
              <Trans>
                Related Documents for {selectedRelatedDocument?.title}
              </Trans>
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
