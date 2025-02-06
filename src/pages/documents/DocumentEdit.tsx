import { useNavigate, useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { DocumentForm } from "@/components/documents/DocumentForm";

export const DocumentEdit = () => {
  const { containerId, documentId } = useParams();
  const navigate = useNavigate();
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
    return <div>Document not found</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (documentId) {
      updateDocument(documentId, { title, content });
      navigate(`/admin/documents/${containerId}`);
    }
  };

  return (
    <AdminOutletTemplate
      title="Edit Document"
      description="Modify document details"
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
        submitButtonText="Save Changes"
        formTitle="Document Details"
      />
    </AdminOutletTemplate>
  );
};