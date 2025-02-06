import { useNavigate, useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { useState } from "react";

export const DocumentNew = () => {
  const { containerId } = useParams();
  const navigate = useNavigate();
  const { addDocument, getContainerDocuments } = useDocumentsStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (containerId) {
      const containerDocs = getContainerDocuments(containerId);
      const maxOrder = containerDocs.length > 0
        ? Math.max(...containerDocs.map((d) => d.order))
        : -1;
      addDocument({
        title,
        content,
        documentContainerId: containerId,
        order: maxOrder + 1,
      });
      navigate(`/admin/documents/${containerId}`);
    }
  };

  return (
    <AdminOutletTemplate
      title="New Document"
      description="Create a new document"
      actions={
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      }
    >
      <DocumentForm
        title={title}
        content={content}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitButtonText="Create Document"
        formTitle="Document Details"
      />
    </AdminOutletTemplate>
  );
};