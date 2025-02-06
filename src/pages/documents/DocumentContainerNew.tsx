// src/pages/documents/DocumentContainerNew.tsx
import { useNavigate } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DocumentContainerNew = () => {
  const navigate = useNavigate();
  const { addContainer } = useDocumentsStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addContainer({ name, description });
    navigate("/admin/documents");
  };

  return (
    <AdminOutletTemplate
      title="New Document Container"
      description="Create a new document container"
      actions={
        <Button variant="outline" onClick={() => navigate("/admin/documents")}>
          Back to Containers
        </Button>
      }
    >
      <Card className="border-0 md:border shadow-none md:shadow">
        <CardHeader>
          <CardTitle>Container Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Container name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Container description"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => navigate("/admin/documents")}>
                Cancel
              </Button>
              <Button type="submit">Create Container</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminOutletTemplate>
  );
};

export default DocumentContainerNew;
