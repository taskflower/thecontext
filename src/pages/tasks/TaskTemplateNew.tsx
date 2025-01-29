// src/pages/tasks/TaskTemplateNew.tsx
import { useNavigate } from "react-router-dom";
import { TemplateEditor } from "@/components/tasks/TemplateEditor";

export const TaskTemplateNew = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-4xl mx-auto h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <TemplateEditor
        onCancel={() => navigate('/admin/tasks/templates')}
      />
    </div>
  );
};