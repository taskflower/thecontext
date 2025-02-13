import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MDEditor from "@uiw/react-md-editor";
import { useState } from "react";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { SearchInput } from "@/components/common/SearchInput";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";

export const AllDocuments = () => {
  const adminNavigate = useAdminNavigate();
  const { documents, containers, removeDocument } = useDocumentsStore();

  const [filter, setFilter] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<{
    title: string;
    content: string;
  } | null>(null);

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(filter.toLowerCase()) ||
      doc.content.toLowerCase().includes(filter.toLowerCase())
  );

  const handleMoveDocument = (docId: string, direction: "up" | "down") => {
    // Move functionality not applicable in global view
    console.log(docId, direction);
  };

  const getContainerName = (containerId: string) => {
    const container = containers.find((c) => c.id === containerId);
    return container?.name || "No Container";
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
      title="All Documents"
      description="View and manage all documents across containers"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden lg:flex"
            onClick={() => adminNavigate("/documents/all")}
          >
            All Documents
          </Button>
          <Button variant="outline" size="sm" className="hidden lg:flex">
            <Settings2 className="mr-2 h-4 w-4" />
            View
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <SearchInput
            value={filter}
            onChange={setFilter}
            placeholder="Search documents..."
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
          <div data-color-mode="light">
            <MDEditor.Markdown
              source={selectedDocument?.content || ""}
              className="p-4 border rounded-md"
            />
          </div>
        </DialogContent>
      </Dialog>
    </AdminOutletTemplate>
  );
};