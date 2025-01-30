// src/pages/documents/DocumentContainerEdit.tsx
import { useNavigate, useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

export const DocumentContainerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { containers, updateContainer } = useDocumentsStore();
  
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  
  const container = containers.find(c => c.id === id);

  useEffect(() => {
    if (container) {
      setFormData({
        name: container.name,
        description: container.description || ""
      });
    }
  }, [container]);

  if (!container) {
    return <div>Nie znaleziono kontenera</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateContainer(id!, {
      name: formData.name,
      description: formData.description
    });
    navigate('/admin/documents');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nazwa</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Opis</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/documents')}
          >
            Anuluj
          </Button>
          <Button type="submit">Zapisz zmiany</Button>
        </div>
      </form>
    </div>
  );
};