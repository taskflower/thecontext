import { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useKanbanStore } from '@/store/kanbanStore';
import { KanbanBoard } from '@/components/kaban/KanbanBoard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const KanbanViewPage: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { instances } = useKanbanStore();
  
  const instance = instances.find(i => i.id === id);

  if (!instance) {
    return (
      <div className="max-w-4xl mx-auto h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Board not found</h1>
            <Button onClick={() => navigate('/admin/boards/instances')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Templates
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{instance.name}</h2>
          <p className="text-muted-foreground">
            Manage tasks and track progress
          </p>
        </div>
        <Button onClick={() => navigate('/admin/boards/instances')} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to active boards
        </Button>
      </div>

      <KanbanBoard instance={instance} />
    </div>
  );
};

export default KanbanViewPage;