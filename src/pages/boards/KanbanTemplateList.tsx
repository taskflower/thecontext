// src/pages/boards/KanbanTemplateList.tsx
import { Button } from "@/components/ui/button";
import { useKanbanStore } from "@/store/kanbanStore";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Pencil, Layout, ArrowLeft } from "lucide-react";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Trans } from "@lingui/macro";

export const KanbanTemplateList = () => {
  const { boardTemplates, createInstance } = useKanbanStore();
  const adminNavigate = useAdminNavigate();

  const handleActivateBoard = (templateId: string, templateName: string) => {
    const instance = createInstance(templateId, templateName);
    console.log(instance);
    
    adminNavigate("/boards/instances");
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            <Trans>Board Templates</Trans>
          </h2>
          <p className="text-muted-foreground">
            <Trans>Create new boards from predefined templates</Trans>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => adminNavigate("/boards/instances")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> 
            <Trans>Back to boards</Trans>
          </Button>
          <Button onClick={() => adminNavigate("/boards/templates/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            <Trans>Create new template</Trans>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boardTemplates.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-muted-foreground" />
                {template.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {template.tasks.length} predefined tasks
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 mt-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adminNavigate(`/boards/templates/${template.id}/edit`)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                <Trans>Edit</Trans>
              </Button>
              <Button
                size="sm"
                onClick={() => handleActivateBoard(template.id, template.name)}
              >
                <Plus className="h-4 w-4 mr-2" />
                <Trans>Activate Board</Trans>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};