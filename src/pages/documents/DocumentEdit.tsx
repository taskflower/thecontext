import { useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { useState, useEffect } from "react";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Trans } from "@lingui/macro";
import { Document } from "@/types/document";
import { DocumentForm } from "@/components/documents";
import { Button } from "@/components/ui";
import { initializeDocumentWithSchema } from "@/utils/documents/documentHelpers";


export const DocumentEdit: React.FC = () => {
  const { containerId, documentId } = useParams();
  const adminNavigate = useAdminNavigate();
  const { documents, containers, updateDocument } = useDocumentsStore();
  
  const container = containers.find(c => c.id === containerId);
  const originalDocument = documents.find((d) => d.id === documentId);
  const [documentState, setDocumentState] = useState<Document | null>(null);

  useEffect(() => {
    if (originalDocument && container?.schema) {
      const initializedDoc = initializeDocumentWithSchema(originalDocument, container.schema);
      setDocumentState(initializedDoc);
    } else if (originalDocument) {
      setDocumentState(originalDocument);
    }
  }, [originalDocument, container]);

  if (!container) {
    return (
      <AdminOutletTemplate
        title={<Trans>Error</Trans>}
        description={<Trans>Container not found</Trans>}
        actions={
          <Button variant="outline" onClick={() => adminNavigate("/documents")}>
            <Trans>Back</Trans>
          </Button>
        }
      >
        <div className="p-4 text-red-500">
          <Trans>The specified container was not found.</Trans>
        </div>
      </AdminOutletTemplate>
    );
  }

  if (!documentState) {
    return (
      <AdminOutletTemplate
        title={<Trans>Error</Trans>}
        description={<Trans>Document not found</Trans>}
        actions={
          <Button variant="outline" onClick={() => adminNavigate(`/documents/${containerId}`)}>
            <Trans>Back</Trans>
          </Button>
        }
      >
        <div className="p-4 text-red-500">
          <Trans>The specified document was not found.</Trans>
        </div>
      </AdminOutletTemplate>
    );
  }

  const handleUpdate = (updatedDoc: Document) => {
    setDocumentState(updatedDoc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (documentId && documentState) {
      updateDocument(documentId, documentState);
      adminNavigate(`/documents/${containerId}`);
    }
  };

  const handleBack = () => adminNavigate(`/documents/${containerId}`);

  return (
    <AdminOutletTemplate
      title={<Trans>Document Details</Trans>}
      description={<Trans>Modify document properties and content</Trans>}
      actions={
        <Button variant="outline" onClick={handleBack}>
          <Trans>Back</Trans>
        </Button>
      }
    >
      <DocumentForm
        document={documentState}
        container={container}
        onUpdate={handleUpdate}
        onSubmit={handleSubmit}
        onCancel={handleBack}
        submitButtonText={<Trans>Save Changes</Trans>}
      />
    </AdminOutletTemplate>
  );
};

export default DocumentEdit;