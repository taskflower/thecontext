import { useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { ContainerForm } from "@/components/documents/ContainerForm";
import { ErrorDialog } from "@/components/common/ErrorDialog";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Trans } from "@lingui/macro";

export const ContainerEdit = () => {
  const { id } = useParams();
  const adminNavigate = useAdminNavigate();
  const { containers, updateContainer } = useDocumentsStore();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetDocumentCount: 0,
  });

  const container = containers.find((c) => c.id === id);

  useEffect(() => {
    if (container) {
      setFormData({
        name: container.name,
        description: container.description || "",
        targetDocumentCount: container.targetDocumentCount || 0,
      });
    }
  }, [container]);

  if (!container) {
    return <div><Trans>Container not found</Trans></div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      updateContainer(id!, formData);
      adminNavigate("/documents");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBack = () => adminNavigate("/documents");

  return (
    <>
      <AdminOutletTemplate
        title={<Trans>Editing: {container.name}</Trans>}
        description={<Trans>Modify container details</Trans>}
        actions={
          <Button variant="outline" onClick={handleBack}>
            <Trans>Back to Containers</Trans>
          </Button>
        }
      >
        <ContainerForm
          formData={formData}
          onSubmit={handleSubmit}
          onCancel={handleBack}
          onChange={handleChange}
          submitButtonText={<Trans>Save Changes</Trans>}
          formTitle={<Trans>Container Details</Trans>}
        />
      </AdminOutletTemplate>

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </>
  );
};

export default ContainerEdit;
