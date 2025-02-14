import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings2, Plus } from "lucide-react";
import { useTasksStore } from "@/store/tasksStore";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { truncate } from "@/services/utils";
import TemplateActions from "@/components/tasks/templatesList/TemplateActions";
import { TaskTemplateEmptyState } from "@/components/tasks/taskTemplateLstPage/TaskTemplateEmptyState";
import { Trans } from "@lingui/macro";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";

export const TaskTemplateList = () => {
  const { templates, removeTemplate } = useTasksStore();
  const adminNavigate = useAdminNavigate();

  return (
    <AdminOutletTemplate
      title={<Trans>Task Templates</Trans>}
      description={<Trans>Manage and create your task templates.</Trans>}
      actions={
        <Button
          className="gap-2"
          onClick={() => adminNavigate("/tasks/templates/new")}
        >
          <Plus className="h-4 w-4" />
          <Trans>New Template</Trans>
        </Button>
      }
    >
      <div className="flex items-center gap-2 p-3 md:p-0">
        <Input
          placeholder={<Trans>Filter templates...</Trans>}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
          <Settings2 className="mr-2 h-4 w-4" />
          <Trans>View</Trans>
        </Button>
      </div>

      <Card className="border-0 md:border shadow-none md:shadow">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="w-[30px] p-3 py-4">
                  <Checkbox />
                </TableCell>
                <TableCell className="px-3"><Trans>Name</Trans></TableCell>
                <TableCell className="hidden md:table-cell px-3">
                  <Trans>Description</Trans>
                </TableCell>
                <TableCell className="w-[150px] px-3"></TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TaskTemplateEmptyState onCreateClick={() => adminNavigate("/tasks/templates/new")} />
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="px-3">
                      <Checkbox />
                    </TableCell>
                    <TableCell className="px-3">
                      <div className="flex space-x-2">
                        <span className="max-w-[500px] truncate font-medium">
                          {truncate(template.name, 24)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell px-3">
                      <span className="text-muted-foreground">
                        {template.description ? 
                          truncate(template.description, 100) : 
                          <span className="italic text-muted-foreground">
                            <Trans>No description provided</Trans>
                          </span>
                        }
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <TemplateActions 
                        templateId={template.id}
                        onDelete={removeTemplate}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminOutletTemplate>
  );
};

export default TaskTemplateList;