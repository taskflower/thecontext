import { useState } from 'react';
import { ITask, ITaskStep } from '@/utils/ragnarok/types';
import { Plus, PlayCircle, FileText, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTaskStore } from '@/store/taskStore';
import { useDocumentStore } from '@/store/docStore';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function TaskDetail() {
  // Pobierz wybrane id zadania ze sklepu
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId);
  // Subskrybujemy zadanie na podstawie selectedTaskId
  const task = useTaskStore((state) =>
    selectedTaskId ? state.tasks.find((t) => t.id === selectedTaskId) : null
  );
  const { addStep, executeTaskStep, executeAllTaskSteps } = useTaskStore();
  const { containers } = useDocumentStore();
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [newStepDescription, setNewStepDescription] = useState('');
  const [newStepType, setNewStepType] = useState<ITaskStep['type']>('retrieval');

  if (!task) {
    return (
      <div className="h-full">
        <div className="px-6 py-4">
          <h2 className="text-base font-semibold">Task Detail</h2>
        </div>
        <div className="flex h-[calc(100vh-240px)] items-center justify-center">
          <p className="text-sm text-muted-foreground">Select a task to view details</p>
        </div>
      </div>
    );
  }

  const container = task.containerId
    ? containers.find((c) => c.id === task.containerId)
    : null;

    const handleAddStep = () => {
      if (!newStepDescription.trim()) return;
    
      addStep(task.id, {
        order: task.steps.length + 1,
        type: newStepType,
        description: newStepDescription,
        status: "pending" // dodajemy domyślny status
      });
    
      setNewStepDescription('');
      setIsAddingStep(false);
    };

  const getStatusBadge = (status: ITask['status'] | ITaskStep['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'completed':
        return <Badge>Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  const getPriorityBadge = (priority: ITask['priority']) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline">Low Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Priority</Badge>;
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
    }
  };

  return (
    <div className="h-full">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{task.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
            </div>
          </div>
          <Button
            onClick={() => executeAllTaskSteps(task.id)}
            disabled={task.status === 'completed' || task.status === 'failed'}
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Execute All Steps
          </Button>
        </div>
      </div>
      <div className="px-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Description</h3>
            <p className="text-sm">
              {task.description || 'No description provided.'}
            </p>
          </div>

          {container && (
            <div>
              <h3 className="text-sm font-medium mb-2">Container</h3>
              <div className="flex items-center gap-2 text-sm">
                <Folder className="h-4 w-4" />
                {container.name}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Steps</h3>
              <Button variant="outline" size="sm" onClick={() => setIsAddingStep(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
            </div>

            <ScrollArea className="">
              <div className="space-y-3">
                {task.steps.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground border rounded-md">
                    No steps defined. Add steps to execute this task.
                  </div>
                ) : (
                  task.steps.map((step, index) => (
                    <div key={step.id} className="overflow-hidden border rounded-md">
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="h-6 w-6 p-0 flex items-center justify-center rounded-full"
                            >
                              {index + 1}
                            </Badge>
                            {step.description}
                          </h3>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(step.status)}
                            <Badge variant="outline">{step.type}</Badge>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => executeTaskStep(task.id, step.id)}
                              disabled={step.status === 'completed' || step.status === 'in_progress'}
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      {step.output && (
                        <div className="px-4 py-3 bg-muted/50 border-t">
                          <div className="text-sm font-mono">{step.output}</div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {task.relatedDocumentIds.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Related Documents</h3>
              <div className="space-y-1">
                {task.relatedDocumentIds.map((docId) => {
                  let document = null;
                  let documentContainer = null;

                  for (const c of containers) {
                    document = c.documents.find((d) => d.id === docId);
                    if (document) {
                      documentContainer = c;
                      break;
                    }
                  }

                  if (!document) return null;

                  return (
                    <div key={docId} className="flex items-center gap-2 text-sm p-2 rounded-md border">
                      <FileText className="h-4 w-4" />
                      <span>{document.title}</span>
                      {documentContainer && documentContainer.id !== task.containerId && (
                        <Badge variant="outline" className="ml-2">
                          {documentContainer.name}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isAddingStep} onOpenChange={setIsAddingStep}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task Step</DialogTitle>
            <DialogDescription>Create a new step for this task.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="step-type" className="text-sm font-medium mb-1 block">
                Step Type
              </label>
              <Select
                value={newStepType}
                onValueChange={(value) => setNewStepType(value as ITaskStep['type'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select step type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retrieval">Retrieval</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="generation">Generation</SelectItem>
                  <SelectItem value="validation">Validation</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="step-description" className="text-sm font-medium mb-1 block">
                Description
              </label>
              <Input
                id="step-description"
                value={newStepDescription}
                onChange={(e) => setNewStepDescription(e.target.value)}
                placeholder="Step description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingStep(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStep}>Add Step</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
