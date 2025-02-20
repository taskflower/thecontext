/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/documents/DocumentNew.tsx
import { useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Trans } from "@lingui/macro";
import { useState } from "react";
import { Document } from "@/types/document";

export const DocumentNew = () => {
  const { containerId } = useParams();
  const adminNavigate = useAdminNavigate();
  const { addDocument, getContainerDocuments, containers } = useDocumentsStore();
  
  const container = containers.find(c => c.id === containerId);
  
  // Create initial document state with all required fields
  const [documentState, setDocumentState] = useState<Document>({
    id: `temp-${Date.now()}`, // Temporary ID that will be replaced on save
    title: "",
    content: "",
    documentContainerId: containerId || "",
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 0,
    customFields: {}
  });

  const handleUpdate = (field: string, value: any) => {
    setDocumentState(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date()
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
          
      // Create new document without the temporary ID
      const { 
        title, 
        content, 
        documentContainerId, 
        createdAt, 
        updatedAt, 
        customFields 
      } = documentState;
      
      addDocument({
        title,
        content,
        documentContainerId,
        createdAt,
        updatedAt,
        customFields,
        order: maxOrder + 1,
      });
      adminNavigate(`/documents/${containerId}`);
    }
  };

  const handleBack = () => adminNavigate(`/documents/${containerId}`);

  if (!container) {
    return (
      <AdminOutletTemplate
        title={<Trans>Error</Trans>}
        description={<Trans>Container not found</Trans>}
        actions={
          <Button variant="outline" onClick={handleBack}>
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
        container={container}
        onUpdate={handleUpdate}
        onSubmit={handleSubmit}
        onCancel={handleBack}
        submitButtonText={<Trans>Create Document</Trans>}
      />
    </AdminOutletTemplate>
  );
};

export default DocumentNew;