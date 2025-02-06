import { useNavigate, useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { ContainerForm } from "@/components/documents/ContainerForm";
import { ErrorDialog } from "@/components/common/ErrorDialog";

export const ContainerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { containers, updateContainer } = useDocumentsStore();
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetDocumentCount: 0
  });

  const container = containers.find((c) => c.id === id);

  useEffect(() => {
    if (container) {
      setFormData({
        name: container.name,
        description: container.description || "",
        targetDocumentCount: container.targetDocumentCount || 0
      });
    }
  }, [container]);

  if (!container) {
    return <div>Container not found</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      updateContainer(id!, formData);
      navigate("/admin/documents");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <AdminOutletTemplate
        title={`Editing: ${container.name}`}
        description="Modify container details"
        actions={
          <Button variant="outline" onClick={() => navigate("/admin/documents")}>
            Back to Containers
          </Button>
        }
      >
        <ContainerForm
          formData={formData}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin/documents")}
          onChange={handleChange}
          submitButtonText="Save Changes"
          formTitle="Container Details"
        />
      </AdminOutletTemplate>

      <ErrorDialog 
        error={error}
        onClose={() => setError(null)}
      />
    </>
  );
};

export default ContainerEdit;