import { useNavigate, useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MDEditor from '@uiw/react-md-editor';
import { useState, useEffect } from "react";

export const DocumentEdit = () => {
  const { containerId, documentId } = useParams();
  const navigate = useNavigate();
  const { documents, updateDocument } = useDocumentsStore();
  
  const document = documents.find(d => d.id === documentId);
  
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
      updateDocument(documentId, {
        title,
        content
      });
      navigate(`/admin/documents/${containerId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Edit Document</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2" data-color-mode="light">
          <label className="text-sm font-medium">Content</label>
          <MDEditor
            value={content}
            onChange={(val) => setContent(val || '')}
            height={400}
            preview="edit"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/admin/documents/${containerId}`)}
          >
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
};