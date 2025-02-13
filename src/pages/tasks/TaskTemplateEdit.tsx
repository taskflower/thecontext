import { useParams } from "react-router-dom";
import { TemplateEditor } from "@/components/tasks/editor/TemplateEditor";
import { useTasksStore } from "@/store/tasksStore";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Trans } from "@lingui/macro";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";

export const TaskTemplateEdit = () => {
  const { id } = useParams();
  const adminNavigate = useAdminNavigate();
  const { templates } = useTasksStore();
  const template = templates.find((t) => t.id === id);

  if (!template) {
    return <div><Trans>Template not found</Trans></div>;
  }

  return (
    <AdminOutletTemplate
      title={<Trans>Editing: {template.name}</Trans>}
      description={<Trans>Modify the template details and steps below.</Trans>}
      actions={
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => adminNavigate("/tasks/templates")}
        >
          <ChevronLeft className="h-4 w-4" />
          <Trans>Back to list of tasks templates</Trans>
        </Button>
      }
    >
      <TemplateEditor
        template={template}
        onCancel={() => adminNavigate("/tasks/templates")}
      />
    </AdminOutletTemplate>
  );
};

export default TaskTemplateEdit;
