import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { TemplateEditor } from "@/components/tasks/editor/TemplateEditor";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Trans } from "@lingui/macro";

export const TaskTemplateNew = () => {
  const adminNavigate = useAdminNavigate();

  return (
    <AdminOutletTemplate
      title={<Trans>New task template</Trans>}
      description={<Trans>Create a new task template</Trans>}
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
      <TemplateEditor onCancel={() => adminNavigate("/tasks/templates")} />
    </AdminOutletTemplate>
  );
};

export default TaskTemplateNew;
