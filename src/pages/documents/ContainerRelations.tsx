/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/documents/ContainerRelations.tsx
import { useParams } from "react-router-dom";
import { useDocumentsStore } from "@/store/documentsStore";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { Trans } from "@lingui/macro";
import { useState } from "react";
import { Plus } from "lucide-react";
import { RelationConfigForm, RelationConfigList } from "@/components/documents";
import { Button } from "@/components/ui";

export const ContainerRelations = () => {
  const { containerId } = useParams();
  const {
    containers,
    relationConfigs,
    addRelationConfig,
    removeRelationConfig,
  } = useDocumentsStore();
  const [showForm, setShowForm] = useState(false);

  const container = containers.find((c) => c.id === containerId);

  // Get configs where this container is either source or target
  const containerConfigs = relationConfigs.filter(
    (config) =>
      config.sourceContainerId === containerId ||
      config.targetContainerId === containerId
  );

  if (!container) {
    return (
      <div>
        <Trans>Container not found</Trans>
      </div>
    );
  }

  const handleAddConfig = (data: any) => {
    addRelationConfig({
      id: Date.now().toString(),
      ...data,
    });
    setShowForm(false);
  };

  const handleDeleteConfig = (configId: string) => {
    removeRelationConfig(configId);
  };

  return (
    <AdminOutletTemplate
      title={<Trans>Container Relations: {container.name}</Trans>}
      description={
        <Trans>
          Manage document relations for this container. Create and configure
          relationships between documents in different containers.
        </Trans>
      }
      actions={
        <Button variant="outline" onClick={() => window.history.back()}>
          <Trans>Back</Trans>
        </Button>
      }
    >
      <div className="space-y-6">
        {!showForm && (
          <div className="flex justify-end">
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <Trans>New Relation</Trans>
            </Button>
          </div>
        )}

        {showForm ? (
          <RelationConfigForm
            containers={containers}
            onSubmit={handleAddConfig}
          />
        ) : (
          <RelationConfigList
            configs={containerConfigs}
            containers={containers}
            onDelete={handleDeleteConfig}
          />
        )}
      </div>
    </AdminOutletTemplate>
  );
};

export default ContainerRelations;
