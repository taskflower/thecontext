import { useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Trans } from "@lingui/macro";

export const DocumentEdit = () => {
  const { containerId, documentId } = useParams();
  const adminNavigate = useAdminNavigate();
  const { documents, updateDocument } = useDocumentsStore();

  const document = documents.find((d) => d.id === documentId);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
    }
  }, [document]);

  if (!document) {
    return <div><Trans>Document not found</Trans></div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (documentId) {
      updateDocument(documentId, { title, content });
      adminNavigate(`/documents/${containerId}`);
    }
  };

  const handleBack = () => adminNavigate(`/documents/${containerId}`);

  return (
    <AdminOutletTemplate
      title={<Trans>Edit Document</Trans>}
      description={<Trans>Modify document details</Trans>}
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
        submitButtonText={<Trans>Save Changes</Trans>}
        formTitle={<Trans>Document Details</Trans>}
      />
    </AdminOutletTemplate>
  );
};
