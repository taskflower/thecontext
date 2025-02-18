/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Trans } from "@lingui/macro";
import { Document } from "@/types/document";

export const DocumentEdit = () => {
  const { containerId, documentId } = useParams();
  const adminNavigate = useAdminNavigate();
  const { documents, updateDocument } = useDocumentsStore();
  
  const originalDocument = documents.find((d) => d.id === documentId);
  const [documentState, setDocumentState] = useState<Document | null>(null);

  useEffect(() => {
    if (originalDocument) {
      setDocumentState(originalDocument);
    }
  }, [originalDocument]);

  if (!documentState) {
    return <div><Trans>Document not found</Trans></div>;
  }

  const handleUpdate = (field: string, value: any) => {
    setDocumentState(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (documentId && documentState) {
      updateDocument(documentId, {
        title: documentState.title,
        content: documentState.content
      });
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
        onUpdate={handleUpdate}
        onSubmit={handleSubmit}
        onCancel={handleBack}
        submitButtonText={<Trans>Save Changes</Trans>}
      />
    </AdminOutletTemplate>
  );
};