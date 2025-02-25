import { useState } from "react";
import { useDocumentsStore } from "@/store/documentsStore";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";

import { Trans } from "@lingui/macro";

import { Button } from "@/components/ui";
import { SchemaField } from "@/types/schema";
import { useAdminNavigate } from "@/hooks";
import { ContainerForm } from "@/components/documents";
import { ErrorDialog } from "@/components/common";

export const ContainerNew = () => {
  const adminNavigate = useAdminNavigate();
  const { addContainer } = useDocumentsStore();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    messagesScope: [],
    name: "",
    description: "",
    targetDocumentCount: 0,
    schema: {
      id: Date.now().toString(),
      name: "Default Schema",
      description: "",
      fields: [] as SchemaField[],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => adminNavigate("/documents")}
          >
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
