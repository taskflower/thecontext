// src/pages/documents/DocumentNew.tsx
import { useNavigate, useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MDEditor from "@uiw/react-md-editor";
import { useState } from "react";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Card className="border-0 md:border shadow-none md:shadow">
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                required
              />
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
              <Button type="submit">Create Document</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminOutletTemplate>
  );
};

export default DocumentNew;
