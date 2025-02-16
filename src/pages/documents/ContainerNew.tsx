import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useDocumentsStore } from "@/store/documentsStore";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { ContainerForm } from "@/components/documents/ContainerForm";
import { ErrorDialog } from "@/components/common/ErrorDialog";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Trans } from "@lingui/macro";

export const ContainerNew = () => {
  const adminNavigate = useAdminNavigate();
  const { addContainer } = useDocumentsStore();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetDocumentCount: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addContainer(formData);
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

  return (
    <>
      <AdminOutletTemplate
        title={<Trans>New Document Container</Trans>}
        description={<Trans>Create a new document container</Trans>}
        actions={
          <Button variant="outline" onClick={() => adminNavigate("/documents")}>
            <Trans>Back to Containers</Trans>
          </Button>
        }
      >
        <ContainerForm
          formData={formData}
          onSubmit={handleSubmit}
          onCancel={() => adminNavigate("/documents")}
          onChange={handleChange}
          submitButtonText={<Trans>Create Container</Trans>}
          formTitle={<Trans>Container Details</Trans>}
        />
      </AdminOutletTemplate>

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </>
  );
};
export default ContainerNew;