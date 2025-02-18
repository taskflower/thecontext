import { FC, useState } from "react";
import { useKanbanStore } from "@/store/kanbanStore";
import { useTasksStore } from "@/store/tasksStore";
import { KanbanBoard, KanbanTaskTemplate } from "@/types/kaban";
import { Template } from "@/types/template";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileSymlink, Plus, X, ArrowLeft } from "lucide-react";
import { Trans, t } from "@lingui/macro";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";

interface KanbanTemplateEditorProps {
  template?: KanbanBoard;
}

export const KanbanTemplateEditor: FC<KanbanTemplateEditorProps> = ({
  template,
}) => {
  const { addBoardTemplate, updateBoardTemplate } = useKanbanStore();
  const { templates } = useTasksStore();
  const adminNavigate = useAdminNavigate();

  const [templateDetails, setTemplateDetails] = useState({
    name: template?.name || "",
    description: template?.description || "",
  });
  
  const [selectedTemplates, setSelectedTemplates] = useState<Template[]>(
    template?.tasks
      .map((task) => templates.find((t) => t.id === task.templateId))
      .filter((t): t is Template => t !== undefined) || []
  );

  const [isSelectingTemplate, setIsSelectingTemplate] = useState(false);

  const handleSave = () => {
    if (!templateDetails.name.trim()) {
      return; // Early return if name is empty
    }

    const templateData: Omit<KanbanBoard, 'id' | 'createdAt' | 'updatedAt'> = {
      name: templateDetails.name,
      description: templateDetails.description,
      tasks: selectedTemplates.map(
        (template): KanbanTaskTemplate => ({
          id: template.id,
          name: template.name,
          description: template.description || "",
          dependencies: [],
          templateId: template.id,
          steps: template.steps.map((step) => ({
            id: step.id,
            name: step.name,
            description: step.description || "",
            pluginId: step.pluginId,
            data: step.data,
            config: step.config || {},
          })),
        })
      ),
    };

    if (template) {
      updateBoardTemplate({ ...template, ...templateData });
    } else {
      addBoardTemplate(templateData);
    }
    adminNavigate("/boards/templates");
  };

  const handleCancel = () => {
    adminNavigate("/boards/templates");
  };

  const handleAddTemplate = (template: Template) => {
    setSelectedTemplates((prev) => [...prev, template]);
    setIsSelectingTemplate(false);
  };

  const handleRemoveTemplate = (templateId: string) => {
    setSelectedTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

  const availableTemplates = templates.filter(
    (template) => !selectedTemplates.some((st) => st.id === template.id)
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {template ? <Trans>Edit board template</Trans> : <Trans>Create board template</Trans>}
          </h2>
          <p className="text-muted-foreground">
            <Trans>Create or modify board template details</Trans>
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleCancel}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <Trans>Back to Templates</Trans>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle><Trans>Template Details</Trans></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium"><Trans>Template Name</Trans></label>
            <Input
              value={templateDetails.name}
              onChange={(e) =>
                setTemplateDetails((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder={t`Enter template name`}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium"><Trans>Description</Trans></label>
            <Input
              value={templateDetails.description}
              onChange={(e) =>
                setTemplateDetails((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={t`Enter template description`}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle><Trans>Task Templates</Trans></CardTitle>
          <Button
            onClick={() => setIsSelectingTemplate(true)}
            size="sm"
            className="gap-2"
            disabled={availableTemplates.length === 0}
          >
            <Plus className="h-4 w-4" />
            <Trans>Add task template</Trans>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trans>No task templates added yet</Trans>
            </div>
          ) : (
            selectedTemplates.map((template) => (
              <Card key={template.id}>
                <CardContent className="flex justify-between items-center py-4">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Trans>Steps: {template.steps.length}</Trans>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTemplate(template.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}

          {isSelectingTemplate && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">
                  <Trans>Select Task Template</Trans>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {availableTemplates.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      <Trans>No available templates</Trans>
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => adminNavigate('/tasks/templates')} 
                      size="sm" 
                      className="gap-2"
                    >
                      <FileSymlink className="h-4 w-4" />
                      <Trans>Go to task templates</Trans>
                    </Button>
                  </div>
                ) : (
                  availableTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleAddTemplate(template)}
                      className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    >
                      <div className="font-medium">{template.name}</div>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        <Trans>({template.steps.length} steps)</Trans>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
              <CardFooter className="justify-end border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSelectingTemplate(false)}
                >
                  <Trans>Cancel</Trans>
                </Button>
              </CardFooter>
            </Card>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleCancel}
        >
          <Trans>Cancel</Trans>
        </Button>
        <Button
          onClick={handleSave}
          disabled={!templateDetails.name.trim() || selectedTemplates.length === 0}
        >
          {template ? <Trans>Save changes</Trans> : <Trans>Create template</Trans>}
        </Button>
      </div>
    </div>
  );
};

export default KanbanTemplateEditor;