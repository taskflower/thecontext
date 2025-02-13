import { useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { useState } from "react";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Trans } from "@lingui/macro";

export const DocumentNew = () => {
  const { containerId } = useParams();
  const adminNavigate = useAdminNavigate();
  const { addDocument, getContainerDocuments } = useDocumentsStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (containerId) {
      const containerDocs = getContainerDocuments(containerId);
      const maxOrder =
        containerDocs.length > 0
          ? Math.max(...containerDocs.map((d) => d.order))
          : -1;
      addDocument({
        title,
        content,
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
      description={<Trans>Create a new document</Trans>}
      actions={
        <Button variant="outline" onClick={handleBack}>
          <Trans>Back</Trans>
        </Button>
      }
    >
      <DocumentForm
        title={title}
        content={content}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onSubmit={handleSubmit}
        onCancel={handleBack}
        submitButtonText={<Trans>Create Document</Trans>}
        formTitle={<Trans>Document Details</Trans>}
      />
    </AdminOutletTemplate>
  );
};
