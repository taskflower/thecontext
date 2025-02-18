// src/pages/boards/templates/KanbanTemplateEdit.tsx
import { useParams } from "react-router-dom";
import { useKanbanStore } from "@/store/kanbanStore";
import { KanbanTemplateEditor } from "@/components/boards/KanbanTemplateEditor";

export const KanbanTemplateEdit = () => {
  const { id } = useParams();
  const { boardTemplates } = useKanbanStore();
  const template = boardTemplates.find((t) => t.id === id);

  if (!template) return <div>Template not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <KanbanTemplateEditor template={template} />
    </div>
  );
};
