import { useNavigate } from "react-router-dom";
import { TemplateEditor } from "@/components/tasks/editor/TemplateEditor";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";

export const TaskTemplateNew = () => {
  const navigate = useNavigate();

  return (
    <AdminOutletTemplate
      title="New Template"
      description="Create a new task template"
      actions={
        <button
          onClick={() => navigate("/admin/tasks/templates")}
          className="btn"
        >
          Back
        </button>
      }
    >
      <TemplateEditor onCancel={() => navigate("/admin/tasks/templates")} />
    </AdminOutletTemplate>
  );
};

export default TaskTemplateNew;
