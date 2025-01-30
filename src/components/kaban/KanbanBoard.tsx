// src/components/kanban/Board.tsx
import { FC, useState } from 'react';
import { useKanbanStore } from '@/store/kanbanStore';
import { KanbanInstance, KanbanTaskTemplate, KanbanStatus } from '@/types/kaban';
import { Template } from '@/types/template';
import { KanbanColumn } from './KanbanColumn';
import { ProcessRunner } from '../tasks/ProcessRunner';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

export const KanbanBoard: FC<{ instance: KanbanInstance }> = ({ instance }) => {
  const { boardTemplates, updateInstanceTaskStatus } = useKanbanStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const template = boardTemplates.find(t => t.id === instance.templateId);
  
  if (!template) {
    return (
      <Card className="p-6">
        <p className="text-destructive text-center">Template not found</p>
      </Card>
    );
  }

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    updateInstanceTaskStatus(instance.id, taskId, 'inProgress' as KanbanStatus);
  };

  const handleProcessComplete = () => {
    if (selectedTaskId) {
      updateInstanceTaskStatus(instance.id, selectedTaskId, 'done' as KanbanStatus);
      setSelectedTaskId(null);
    }
  };

  const selectedTask = selectedTaskId ? instance.tasks.find(t => t.id === selectedTaskId) : null;
  const selectedTemplateTask = selectedTask 
    ? template.tasks.find(t => t.id === selectedTask.templateTaskId) as KanbanTaskTemplate 
    : null;

  // Sprawdzamy czy task ma wymagane pola
  if (selectedTemplateTask && (!selectedTemplateTask.steps || selectedTemplateTask.steps.length === 0)) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Selected task doesn't have any steps defined. Please edit the template to add steps.
        </AlertDescription>
      </Alert>
    );
  }

  const processRunnerTemplate: Template | null = selectedTemplateTask ? {
    id: selectedTemplateTask.id,
    name: selectedTemplateTask.name,
    description: selectedTemplateTask.description,
    createdAt: new Date(), // Required by BaseEntity
    updatedAt: new Date(), // Required by BaseEntity
    steps: selectedTemplateTask.steps.map(step => ({
      id: step.id,
      name: step.name,
      description: step.description,
      pluginId: step.pluginId,
      data: step.data,
      config: step.config || {} // dodane brakujące pole config z domyślną pustą wartością
    }))
  } : null;

  return (
    <div>
      {processRunnerTemplate ? (
        <ProcessRunner
          template={processRunnerTemplate}
          onBack={() => setSelectedTaskId(null)}
          onComplete={handleProcessComplete}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="flex divide-x">
              <KanbanColumn status="todo" instance={instance} template={template} onTaskClick={handleTaskClick} />
              <KanbanColumn status="inProgress" instance={instance} template={template} onTaskClick={handleTaskClick} />
              <KanbanColumn status="done" instance={instance} template={template} onTaskClick={handleTaskClick} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};