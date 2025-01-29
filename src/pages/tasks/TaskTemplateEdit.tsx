// src/pages/tasks/TaskTemplateEdit.tsx
import { useNavigate, useParams } from "react-router-dom";
import { TemplateEditor } from "@/components/tasks/TemplateEditor";
import { useTasksStore } from "@/store/tasksStore";

export const TaskTemplateEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { templates } = useTasksStore();
  
  const template = templates.find(t => t.id === id);

  if (!template) {
    return <div>Template not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <TemplateEditor
        template={template}
        onCancel={() => navigate('/admin/tasks/templates')}
      />
    </div>
  );
};