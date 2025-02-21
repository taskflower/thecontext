// src/pages/documents/AllDocuments.tsx

import { SearchInput } from "@/components/common";
import { DocumentTable, MarkdownPreview, RelatedDocuments } from "@/components/documents";
import { Button, Card, CardContent, DialogHeader } from "@/components/ui";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { useDocumentsStore } from "@/store/documentsStore";
import { t, Trans } from "@lingui/macro";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { Filter } from "lucide-react";
import { useState } from "react";
import { Document } from "@/types/document";

export const AllDocuments = () => {
  const adminNavigate = useAdminNavigate();
  const { documents, containers, removeDocument, relationConfigs, relations } =
    useDocumentsStore();

  const [filter, setFilter] = useState("");
  // Zmieniamy typ na Document | null dla spójności
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedRelatedDocument, setSelectedRelatedDocument] = useState<Document | null>(null);
  const [selectedRelationFilter, setSelectedRelationFilter] = useState<string | null>(null);

  // Filtrowanie na podstawie wyszukiwania tekstowego
  let filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(filter.toLowerCase()) ||
      doc.content.toLowerCase().includes(filter.toLowerCase())
  );

  // Jeśli wybrano filtr relacji, ograniczamy wyniki do dokumentów biorących udział w relacjach z daną konfiguracją
  if (selectedRelationFilter) {
    filteredDocuments = filteredDocuments.filter((doc) =>
      relations.some(
        (rel) =>
          rel.configId === selectedRelationFilter &&
          (rel.sourceDocumentId === doc.id || rel.targetDocumentId === doc.id)
      )
    );
  }

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
                <DropdownMenuItem onClick={() => setSelectedRelationFilter(null)}>
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
          <SearchInput
            value={filter}
            onChange={setFilter}
            placeholder={t`Search documents...`}
            className="h-8 w-[150px] lg:w-[250px]"
          />
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
              // Usunięto nieistniejący props onPreviewRelated
            />
          </CardContent>
        </Card>
      </div>

      {/* Dialog dla podglądu zawartości dokumentu */}
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

      {/* Dialog dla podglądu powiązanych dokumentów */}
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
