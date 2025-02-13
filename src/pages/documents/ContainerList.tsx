// ContainerList.tsx
import { Button } from "@/components/ui/button";
import { Settings2, Plus, SquareSigma } from "lucide-react";
import { useDocumentsStore } from "@/store/documentsStore";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { useState } from "react";
import { SearchInput } from "@/components/common/SearchInput";
import ContainerCard from "@/components/documents/ContainerCard";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";

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
      title="Document Containers"
      description="Manage your document containers and their contents"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden lg:flex">
            <Settings2 className="mr-2 h-4 w-4" />
            View
          </Button>
          <Button variant="outline" size="sm" className="hidden lg:flex" onClick={() => adminNavigate("/documents/all")}>
            <SquareSigma className="mr-2 h-4 w-4" />
            All
          </Button>
          <Button className="gap-2" onClick={() => adminNavigate("/documents/containers/new")}>
            <Plus className="h-4 w-4" />
            New Container
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <SearchInput
          value={filterQuery}
          onChange={setFilterQuery}
          placeholder="Filter containers..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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
                <p className="text-lg font-medium">No containers found</p>
                <p className="text-sm text-muted-foreground">
                  {filterQuery 
                    ? "Try adjusting your search query or clear the filter."
                    : "Create your first container to get started."}
                </p>
                {!filterQuery && (
                  <Button onClick={() => adminNavigate("/documents/containers/new")} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Container
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
