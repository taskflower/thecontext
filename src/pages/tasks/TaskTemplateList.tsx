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
import { Settings2, Plus } from "lucide-react";
import { useTasksStore } from "@/store/tasksStore";
import { useNavigate } from "react-router-dom";
import { TaskTemplateEmptyState } from "@/components/tasks/taskTemplateLstPage/TaskTemplateEmptyState";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { truncate } from "@/services/utils";
import TemplateActions from "@/components/tasks/templatesList/TemplateActions";


export const TaskTemplateList = () => {
  const { templates, removeTemplate } = useTasksStore();
  const navigate = useNavigate();

  return (
    <AdminOutletTemplate
      title="Task Templates"
      description="Manage and create your task templates."
      actions={
        <Button className="gap-2" onClick={() => navigate("new")}>
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      }
    >
      <div className="flex items-center gap-2 p-3 md:p-0">
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

      <Card className="border-0 md:border shadow-none md:shadow">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px] p-3 py-4">
                  <Checkbox />
                </TableHead>
                <TableHead className="px-3">Name</TableHead>
                <TableHead className="hidden md:table-cell px-3">Description</TableHead>
                <TableHead className="w-[150px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TaskTemplateEmptyState onCreateClick={() => navigate("new")} />
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
                        {truncate(template.description, 100)}
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