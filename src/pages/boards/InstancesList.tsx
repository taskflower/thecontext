import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings2, Power } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useKanbanStore } from "@/store/kanbanStore";
import InstanceActions from "@/components/boards/instancesList/InstanceActions";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { SearchInput } from "@/components/common/SearchInput";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Trans, t } from "@lingui/macro";
import { useState } from "react";

export const InstancesList = () => {
  const { instances, removeInstance } = useKanbanStore();
  const adminNavigate = useAdminNavigate();
  const [filter, setFilter] = useState("");

  const handleActivateBoard = () => {
    adminNavigate(`/boards/templates`);
  };

  if (!instances.length) {
    return (
      <AdminOutletTemplate
        title={<Trans>Active Boards</Trans>}
        description={<Trans>Manage and access your kanban boards</Trans>}
        actions={
          <Button variant="outline" className="gap-2" onClick={handleActivateBoard}>
            <Power className="h-4 w-4" />
            <Trans>Activate new board</Trans>
          </Button>
        }
      >
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            <Trans>No Active Boards</Trans>
          </h2>
          <p className="text-muted-foreground text-center">
            <Trans>Get started by activating your first kanban board</Trans>
          </p>
          <Button variant="outline" className="gap-2" onClick={handleActivateBoard}>
            <Power className="h-4 w-4" />
            <Trans>Activate new board</Trans>
          </Button>
        </div>
      </AdminOutletTemplate>
    );
  }

  return (
    <AdminOutletTemplate
      title={<Trans>Active Boards</Trans>}
      description={<Trans>Manage and access your kanban boards</Trans>}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden lg:flex">
            <Settings2 className="mr-2 h-4 w-4" />
            <Trans>View</Trans>
          </Button>
          <Button className="gap-2" onClick={handleActivateBoard}>
            <Power className="h-4 w-4" />
            <Trans>Activate new board</Trans>
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <SearchInput
            value={filter}
            onChange={setFilter}
            placeholder={t`Filter boards...`}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px] p-6">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="px-6"><Trans>Name</Trans></TableHead>
                  <TableHead className="px-6"><Trans>Created</Trans></TableHead>
                  <TableHead className="px-6"><Trans>Tasks</Trans></TableHead>
                  <TableHead className="px-6"><Trans>Progress</Trans></TableHead>
                  <TableHead className="w-[100px] px-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instances
                  .filter(instance => 
                    instance.name.toLowerCase().includes(filter.toLowerCase())
                  )
                  .map((instance) => {
                    const totalTasks = instance.tasks.length;
                    const completedTasks = instance.tasks.filter(
                      (t) => t.status === "done"
                    ).length;
                    const progress =
                      Math.round((completedTasks / totalTasks) * 100) || 0;

                    return (
                      <TableRow key={instance.id}>
                        <TableCell className="px-6">
                          <Checkbox />
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="flex space-x-2">
                            <span className="max-w-[500px] truncate font-medium">
                              {instance.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6">
                          {new Date(instance.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-6">
                          <Trans>{totalTasks} tasks</Trans>
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="flex w-full items-center gap-2">
                            <div className="h-2 w-full rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="w-12 text-sm text-muted-foreground">
                              {progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6">
                          <InstanceActions 
                            instanceId={instance.id}
                            onDelete={removeInstance}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminOutletTemplate>
  );
};

export default InstancesList;