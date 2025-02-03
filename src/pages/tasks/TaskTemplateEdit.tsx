import { useNavigate, useParams } from "react-router-dom";
import { TemplateEditor } from "@/components/tasks/editor/TemplateEditor";
import { useTasksStore } from "@/store/tasksStore";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";

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
      title="Edit Template"
      description={`Editing: ${template.name}`}
      actions={
        <button onClick={() => navigate("/admin/tasks/templates")} className="btn">
          Back
        </button>
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
