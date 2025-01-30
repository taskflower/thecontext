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
import { FileSymlink, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface KanbanTemplateEditorProps {
  template?: KanbanBoard;
  onClose: () => void;
}

export const KanbanTemplateEditor: FC<KanbanTemplateEditorProps> = ({
  template,
  onClose,
}) => {
  const { addBoardTemplate, updateBoardTemplate } = useKanbanStore();
  const { templates } = useTasksStore();
  const [templateDetails, setTemplateDetails] = useState({
    name: template?.name || "",
    description: template?.description || "",
  });
  const [selectedTemplates, setSelectedTemplates] = useState<Template[]>(
    template?.tasks
      .map((task) => templates.find((t) => t.id === task.templateId))
      .filter((t): t is Template => t !== undefined) || []
  );

  const handleSave = () => {
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
    onClose();
  };

  const handleAddTemplate = (template: Template) => {
    setSelectedTemplates((prev) => [...prev, template]);
  };

  const handleRemoveTemplate = (templateId: string) => {
    setSelectedTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          {template ? "Edit" : "Create"} board template
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Template Name</label>
            <Input
              value={templateDetails.name}
              onChange={(e) =>
                setTemplateDetails((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Enter template name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={templateDetails.description}
              onChange={(e) =>
                setTemplateDetails((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter template description"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row justify-between items-center">
          <CardTitle>Task Templates</CardTitle>
          <TemplateSelector
            templates={templates.filter((t) => t.steps && t.steps.length > 0)}
            selectedTemplates={selectedTemplates}
            onSelect={handleAddTemplate}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedTemplates.map((template) => (
            <Card key={template.id}>
              <CardContent className="flex justify-between items-center py-4">
                <div>
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Steps: {template.steps.length}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveTemplate(template.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
       
      </Card>
      <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!templateDetails.name}>
            Save board template
          </Button>
        </CardFooter>
    </div>
  );
};

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplates: Template[];
  onSelect: (template: Template) => void;
}

const TemplateSelector: FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplates,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const availableTemplates = templates.filter(
    (template) => !selectedTemplates.some((st) => st.id === template.id)
  );
  const navigate = useNavigate();
  return (
    <div className="relative">
      <Button onClick={() => setIsOpen(!isOpen)} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add task template
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-10">
          {availableTemplates.length === 0 ? (
            <div className="p-2">
              <p className="p-4 text-muted-foreground">
                No available templates
              </p>
              <Button variant="outline" onClick={() => navigate("/admin/tasks/templates")} size="sm" className="w-full">
                <FileSymlink className="h-4 w-4" />
                To tasks templates 
              </Button>
            </div>
          ) : (
            <ul className="py-2">
              {availableTemplates.map((template) => (
                <li
                  key={template.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onSelect(template);
                    setIsOpen(false);
                  }}
                >
                  {template.name}
                  <span className="text-xs text-muted-foreground ml-2">
                    ({template.steps.length} steps)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};