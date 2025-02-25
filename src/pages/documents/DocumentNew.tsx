import { useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { Trans } from "@lingui/macro";
import { useState } from "react";
import { Document } from "@/types/document";
import { DocumentForm } from "@/components/documents";
import { Button } from "@/components/ui";
import { initializeDocument } from "@/utils/documents/fieldUtils";
import { useAdminNavigate } from "@/hooks";

export const DocumentNew: React.FC = () => {
  const { containerId } = useParams();
  const adminNavigate = useAdminNavigate();
  const { addDocument, getContainerDocuments, containers, schemas } = useDocumentsStore();
  
  const container = containers.find(c => c.id === containerId);
  // Get the schema using container's schemaId
  const schema = container?.schemaId ? schemas.find(s => s.id === container.schemaId) : undefined;
  
  const [documentState, setDocumentState] = useState<Document>(() => 
    initializeDocument({
      id: `temp-${Date.now()}`,
      title: "",
      content: "",
      documentContainerId: containerId || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 0,
      tags: []
    }, schema)
  );

  const handleUpdate = (updatedDoc: Document) => {
    setDocumentState(updatedDoc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (containerId) {
      const containerDocs = getContainerDocuments(containerId);
      const maxOrder = containerDocs.length > 0
        ? Math.max(...containerDocs.map((d) => d.order))
        : -1;
          
      const newDoc = {
        ...documentState,
        order: maxOrder + 1,
      };
      
      addDocument(newDoc);
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
        schema={schema}
        onUpdate={handleUpdate}
        onSubmit={handleSubmit}
        onCancel={handleBack}
        submitButtonText={<Trans>Create Document</Trans>}
      />
    </AdminOutletTemplate>
  );
};

export default DocumentNew;