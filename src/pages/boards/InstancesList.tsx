import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

import { useKanbanStore } from "@/store/kanbanStore";
import { useNavigate } from "react-router-dom";
import { Settings2,   Power } from "lucide-react";
import InstanceActions from "@/components/kaban/instancesList/InstanceActions";

export const InstancesList = () => {
  const { instances, removeInstance } = useKanbanStore();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Active Boards</h2>
          <p className="text-muted-foreground">
            Manage and access your kanban boards
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            className="gap-2"
            onClick={() => navigate(`/admin/boards/templates`)}
          >
            <Power className="h-4 w-4" />
            Activate new board
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter boards..."
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 lg:flex"
          >
            <Settings2 className="mr-2 h-4 w-4" />
            View
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px] p-6">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="px-6">Name</TableHead>
                  <TableHead className="px-6">Created</TableHead>
                  <TableHead className="px-6">Tasks</TableHead>
                  <TableHead className="px-6">Progress</TableHead>
                  <TableHead className="w-[100px] px-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instances.map((instance) => {
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
                      <TableCell className="px-6">{totalTasks} tasks</TableCell>
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
    </div>
  );
};

export default InstancesList;


