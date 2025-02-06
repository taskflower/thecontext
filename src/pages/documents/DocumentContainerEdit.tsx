// src/pages/documents/DocumentContainerEdit.tsx
import { useNavigate, useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DocumentContainerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { containers, updateContainer } = useDocumentsStore();

  const [formData, setFormData] = useState({ name: "", description: "" });
  const container = containers.find((c) => c.id === id);

  useEffect(() => {
    if (container) {
      setFormData({
        name: container.name,
        description: container.description || "",
      });
    }
  }, [container]);

  if (!container) {
    return <div>Container not found</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateContainer(id!, { name: formData.name, description: formData.description });
    navigate("/admin/documents");
  };

  return (
    <AdminOutletTemplate
      title={`Editing: ${container.name}`}
      description="Modify container details"
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
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => navigate("/admin/documents")}>
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

export default DocumentContainerEdit;
