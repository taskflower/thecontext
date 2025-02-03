// src/pages/tasks/TaskTemplateNew.tsx
import { useNavigate } from "react-router-dom";
import { TemplateEditor } from "@/components/tasks/editor/TemplateEditor";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const TaskTemplateNew = () => {
  const navigate = useNavigate();

  return (
    <AdminOutletTemplate
      title="New task template"
      description="Create a new task template"
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
      <TemplateEditor onCancel={() => navigate("/admin/tasks/templates")} />
    </AdminOutletTemplate>
  );
};

export default TaskTemplateNew;
