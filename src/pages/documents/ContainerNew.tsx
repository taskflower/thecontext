import { useNavigate } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { ContainerForm } from "@/components/documents/ContainerForm";
import { ErrorDialog } from "@/components/common/ErrorDialog";

export const ContainerNew = () => {
  const navigate = useNavigate();
  const { addContainer } = useDocumentsStore();
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetDocumentCount: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addContainer(formData);
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
        title="New Document Container"
        description="Create a new document container"
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
          submitButtonText="Create Container"
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