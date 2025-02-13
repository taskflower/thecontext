import { useParams } from "react-router-dom";
import ProcessRunner from "@/components/tasks/ProcessRunner";
import { useTasksStore } from "@/store/tasksStore";
import { Trans } from "@lingui/macro";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";

export const TaskTemplateRunner = () => {
  const { id } = useParams();
  const adminNavigate = useAdminNavigate();
  const { templates } = useTasksStore();
  
  const template = templates.find((t) => t.id === id);

  if (!template) {
    return <div><Trans>Template not found</Trans></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      <ProcessRunner
        template={template}
        onBack={() => adminNavigate("/tasks/templates")}
        onEdit={() => adminNavigate(`/tasks/templates/${template.id}/edit`)}
        onComplete={() => adminNavigate("/tasks/templates")}
      />
    </div>
  );
};

export default TaskTemplateRunner;
