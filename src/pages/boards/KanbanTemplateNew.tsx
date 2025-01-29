// src/pages/boards/templates/KanbanTemplateNew.tsx
import { useNavigate } from 'react-router-dom';
import { KanbanTemplateEditor } from '@/components/kaban/KanbanTemplateEditor';

export const KanbanTemplateNew = () => {
 const navigate = useNavigate();
 
 return (
   <div className="max-w-4xl mx-auto p-6">
     <KanbanTemplateEditor 
       onClose={() => navigate('/admin/boards/templates')}
     />
   </div>
 );
};