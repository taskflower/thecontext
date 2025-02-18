/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Trans } from "@lingui/macro";
import { useState } from "react";

export const DocumentNew = () => {
  const { containerId } = useParams();
  const adminNavigate = useAdminNavigate();
  const { addDocument, getContainerDocuments } = useDocumentsStore();

  const [documentState, setDocumentState] = useState({
    title: "",
    content: ""
  });

  const handleUpdate = (field: string, value: any) => {
    setDocumentState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (containerId) {
      const containerDocs = getContainerDocuments(containerId);
      const maxOrder =
        containerDocs.length > 0
          ? Math.max(...containerDocs.map((d) => d.order))
          : -1;
      addDocument({
        ...documentState,
        documentContainerId: containerId,
        order: maxOrder + 1,
      });
      adminNavigate(`/documents/${containerId}`);
    }
  };

  const handleBack = () => adminNavigate(`/documents/${containerId}`);

  return (
    <AdminOutletTemplate
      title={<Trans>New Document</Trans>}
      description={<Trans>Create a new document with content</Trans>}
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
        submitButtonText={<Trans>Create Document</Trans>}
      />
    </AdminOutletTemplate>
  );
};