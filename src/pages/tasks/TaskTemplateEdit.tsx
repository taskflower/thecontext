// src/pages/tasks/TaskTemplateEdit.tsx
import { useNavigate, useParams } from "react-router-dom";
import { TemplateEditor } from "@/components/tasks/editor/TemplateEditor";
import { useTasksStore } from "@/store/tasksStore";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const TaskTemplateEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { templates } = useTasksStore();
  const template = templates.find((t) => t.id === id);

  if (!template) {
    return <div>Template not found</div>;
  }

  return (
    <AdminOutletTemplate
      title={`Editing: ${template.name}`}
      description="Modify the template details and steps below."
      actions={
        <Button
          variant={"outline"}
          className="gap-2"
          onClick={() => navigate("/admin/tasks/templates")}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to list of tasks templates
        </Button>
      }
    >
      <TemplateEditor
        template={template}
        onCancel={() => navigate("/admin/tasks/templates")}
      />
    </AdminOutletTemplate>
  );
};

export default TaskTemplateEdit;
