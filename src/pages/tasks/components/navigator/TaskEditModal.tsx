// src/pages/tasks/components/navigator/TaskEditModal.tsx
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormModal } from "@/components/ui/form-modal";
import { Priority } from "@/types";
import { useAdminNavigate } from "@/hooks";
import { useScenarioStore, useTaskStore } from "@/store";

interface TaskEditModalProps {
  taskId: string;
  onClose: () => void;
}

export function TaskEditModal({ taskId, onClose }: TaskEditModalProps) {
  const { scenarios } = useScenarioStore();
  const { tasks, updateTask } = useTaskStore();
  const adminNavigate = useAdminNavigate();
  const task = tasks.find((t) => t.id === taskId);

  const [editData, setEditData] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    dueDate: "",
    scenarioId: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setEditData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || ("medium" as Priority),
        dueDate: task.dueDate || new Date().toISOString().split("T")[0],
        scenarioId: task.scenarioId || "",
      });
    }
  }, [task, scenarios]);

  // Handle form submission
  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!editData.scenarioId) {
      setError("Please select a project for this task.");
      return;
    }

    if (task) {
      // Use updateTask instead of delete and add
      const success = updateTask(task.id, {
        ...editData
      });
      
      if (success.success) {
        onClose();
      } else {
        setError(success.error || "Error updating task");
      }
    }
  };

  // If no scenarios exist, direct user to create a scenario first
  if (!scenarios || scenarios.length === 0) {
    return (
      <FormModal
        title="Cannot Edit Task"
        isOpen={true}
        onClose={onClose}
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
          adminNavigate("/scenarios");
        }}
        submitLabel="Go to Projects"
      >
        <div className="py-2 text-center">
          <p>You need a project to associate with this task.</p>
        </div>
      </FormModal>
    );
  }

  // If task not found, close the modal
  if (!task) {
    onClose();
    return null;
  }

  return (
    <FormModal
      title="Edit Task"
      isOpen={true}
      onClose={onClose}
      onSubmit={handleUpdate}
      isSubmitDisabled={!editData.title.trim() || !editData.scenarioId}
      error={error}
      submitLabel="Save Changes"
      size="lg"
    >
      <div className="grid gap-2">
        <Label htmlFor="edit-title">Task Title</Label>
        <Input
          id="edit-title"
          value={editData.title}
          onChange={(e) =>
            setEditData({ ...editData, title: e.target.value })
          }
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={editData.description}
          onChange={(e) =>
            setEditData({ ...editData, description: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="edit-priority">Priority</Label>
          <Select
            value={editData.priority}
            onValueChange={(value: Priority) =>
              setEditData({ ...editData, priority: value })
            }
          >
            <SelectTrigger id="edit-priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="edit-dueDate">Due Date</Label>
          <Input
            id="edit-dueDate"
            type="date"
            value={editData.dueDate}
            onChange={(e) =>
              setEditData({ ...editData, dueDate: e.target.value })
            }
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="edit-scenario">
          Project <span className="text-destructive">*</span>
        </Label>
        <Select
          value={editData.scenarioId}
          onValueChange={(value) =>
            setEditData({ ...editData, scenarioId: value })
          }
          required
        >
          <SelectTrigger id="edit-scenario">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {scenarios.map((scenario) => (
              <SelectItem key={scenario.id} value={scenario.id}>
                {scenario.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!editData.scenarioId && (
          <p className="text-xs text-destructive mt-1">
            Project is required
          </p>
        )}
      </div>
    </FormModal>
  );
}

export default TaskEditModal;