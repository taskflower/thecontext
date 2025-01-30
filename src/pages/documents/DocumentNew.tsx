// src/pages/documents/DocumentNew.tsx
import { useNavigate, useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
      // Get current max order for the container
      const containerDocs = getContainerDocuments(containerId);
      const maxOrder = containerDocs.length > 0 
        ? Math.max(...containerDocs.map(d => d.order))
        : -1;

      addDocument({
        title,
        content,
        documentContainerId: containerId,
        order: maxOrder + 1
      });
      navigate(`/admin/documents/${containerId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">New Document</h2>
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Content</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px]"
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
          <Button type="submit">Create Document</Button>
        </div>
      </form>
    </div>
  );
};