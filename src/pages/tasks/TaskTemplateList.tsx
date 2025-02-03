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
import { Settings2, Play, Plus } from "lucide-react";
import { useTasksStore } from "@/store/tasksStore";
import { useNavigate } from "react-router-dom";
import { TaskTemplateEmptyState } from "@/components/tasks/taskTemplateLstPage/TaskTemplateEmptyState";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";

export const TaskTemplateList = () => {
  const { templates } = useTasksStore();
  const navigate = useNavigate();

  return (
    <AdminOutletTemplate
      title={"Task Templates"}
      description="Manage and create your task templates."
      actions={
        <Button className="gap-2" onClick={() => navigate("new")}>
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      }
    >
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter templates..."
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

      <Card mobile>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px] p-6">
                  <Checkbox />
                </TableHead>
                <TableHead className="px-6">Name</TableHead>
                <TableHead className="px-6">Description</TableHead>
                <TableHead className="w-[100px] px-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TaskTemplateEmptyState onCreateClick={() => navigate("new")} />
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="px-6">
                      <Checkbox />
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex space-x-2">
                        <span className="max-w-[500px] truncate font-medium">
                          {template.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6">
                      <span className="text-muted-foreground">
                        {template.description}
                      </span>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/tasks/${template.id}/run`)
                          }
                        >
                          <Play className="h-4 w-4" />
                          Run
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/tasks/${template.id}/edit`)
                          }
                        >
                          Edit
                        </Button>
                      </div>
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
