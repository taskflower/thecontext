// src/pages/documents/DocumentEdit.tsx
import { useNavigate, useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MDEditor from "@uiw/react-md-editor";
import { useState, useEffect } from "react";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Card className="border-0 md:border shadow-none md:shadow">
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2" data-color-mode="light">
              <label className="text-sm font-medium">Content</label>
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || "")}
                height={400}
                preview="edit"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminOutletTemplate>
  );
};

export default DocumentEdit;
