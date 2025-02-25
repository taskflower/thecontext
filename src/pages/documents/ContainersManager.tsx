import { ContainerComponent } from "@/components/containers/container/ContainerComponent";
import { RelationComponent } from "@/components/containers/container/RelationComponent";
import { ContainerCreator } from "@/components/containers/management/ContainerCreator";
import { RelationCreator } from "@/components/containers/management/RelationCreator";
import { SchemaCreator } from "@/components/containers/management/SchemaCreator";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { useContainerStore } from "@/store/containerStore";
import { Trans } from "@lingui/macro";

const ContainersManager = () => {
  const containers = useContainerStore((state) => state.containers);
  const relations = useContainerStore((state) => state.relations);
  const selectedContainer = useContainerStore(
    (state) => state.selectedContainer
  );

  return (
    <AdminOutletTemplate
      title={<Trans>Container Management System</Trans>}
      description={
        <Trans>View and manage all documents across containers</Trans>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
        <div>
          <h2 className="text-lg font-semibold mb-4">Management</h2>
          <ContainerCreator />
          {selectedContainer && (
            <SchemaCreator containerId={selectedContainer} />
          )}
          <RelationCreator />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Containers</h2>
          {containers.map((container) => (
            <ContainerComponent key={container.id} container={container} />
          ))}
        </div>

        <div>
          <h2 className="text-;g font-semibold mb-4">Relations</h2>
          {relations.map((relation) => (
            <RelationComponent key={relation.id} relation={relation} />
          ))}
        </div>
      </div>
    </AdminOutletTemplate>
  );
};

export default ContainersManager;
