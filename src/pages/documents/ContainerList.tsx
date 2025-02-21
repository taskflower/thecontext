import { Button } from "@/components/ui/button";
import {  Plus, SquareSigma } from "lucide-react";
import { useDocumentsStore } from "@/store/documentsStore";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { SearchInput } from "@/components/common/SearchInput";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Trans, t } from "@lingui/macro";
import { useState } from "react";
import { ContainerCard } from "@/components/documents/container";

export const ContainerList = () => {
  const { containers, getContainerDocuments, deleteContainer } = useDocumentsStore();
  const adminNavigate = useAdminNavigate();
  const [filterQuery, setFilterQuery] = useState("");

  const filteredContainers = containers.filter((container) =>
    container.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleDeleteContainer = async (containerId: string) => {
    try {
      await deleteContainer(containerId);
    } catch (error) {
      console.error("Failed to delete container:", error);
    }
  };

  return (
    <AdminOutletTemplate
      title={<Trans>Document Containers</Trans>}
      description={<Trans>Manage your document containers and their contents</Trans>}
      actions={
        <div className="flex items-center gap-2">
          
          <Button
            variant="outline"
            size="sm"
            className="hidden lg:flex"
            onClick={() => adminNavigate("/documents/all")}
          >
            <SquareSigma className="mr-2 h-4 w-4" />
            <Trans>All documents</Trans>
          </Button>
          <Button className="gap-2" onClick={() => adminNavigate("/documents/containers/new")}>
            <Plus className="h-4 w-4" />
            <Trans>New Container</Trans>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <SearchInput
          value={filterQuery}
          onChange={setFilterQuery}
          placeholder={t`Filter containers...`}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredContainers.map((container) => (
            <ContainerCard
              key={container.id}
              container={container}
              onDelete={handleDeleteContainer}
              getContainerDocuments={getContainerDocuments}
            />
          ))}

          {filteredContainers.length === 0 && (
            <div className="col-span-full text-center py-12 px-4">
              <div className="max-w-sm mx-auto space-y-3">
                <p className="text-lg font-medium">
                  <Trans>No containers found</Trans>
                </p>
                <p className="text-sm text-muted-foreground">
                  {filterQuery
                    ? t`Try adjusting your search query or clear the filter.`
                    : t`Create your first container to get started.`}
                </p>
                {!filterQuery && (
                  <Button
                    onClick={() => adminNavigate("/documents/containers/new")}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <Trans>Create Container</Trans>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminOutletTemplate>
  );
};
export default ContainerList;
