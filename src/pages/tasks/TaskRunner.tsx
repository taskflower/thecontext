import { useNavigate, useParams } from "react-router-dom";
import ProcessRunner from "@/components/tasks/ProcessRunner";
import { useTasksStore } from "@/store/tasksStore";

export const TaskRunner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { templates } = useTasksStore();
  
  const template = templates.find(t => t.id === id);

  if (!template) {
    return <div>Template not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      <ProcessRunner
        template={template}
        onBack={() => navigate('/admin/tasks/templates')}
        onEdit={() => navigate(`/admin/tasks/${template.id}/edit`)}
        onComplete={() => {
          // TODO: Handle task completion
          navigate('/admin/tasks/templates');
        }}
      />
    </div>
  );
};

export default TaskRunner;
