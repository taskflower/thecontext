// src/pages/tasks/components/navigator/TaskEditModal.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { useDataStore } from "@/store/dataStore";
import { Priority } from "@/types"; // Import Priority type
import { useAdminNavigate } from "@/hooks";

interface TaskEditModalProps {
  taskId: string;
  onClose: () => void;
}

export function TaskEditModal({ taskId, onClose }: TaskEditModalProps) {
  const { tasks, addTask, deleteTask, projects } = useDataStore();
  const adminNavigate = useAdminNavigate();
  const task = tasks.find(t => t.id === taskId);
  
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    dueDate: "",
    projectId: "",
  });
  
  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setEditData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium" as Priority,
        dueDate: task.dueDate || new Date().toISOString().split("T")[0],
        projectId: task.projectId || "",
      });
    }
  }, [task, projects]);
  
  // Handle form submission
  const handleUpdate = () => {
    if (!editData.projectId) {
      alert("Wybierz projekt dla tego zadania.");
      return;
    }
    
    if (task) {
      // Update the task by deleting and re-adding
      deleteTask(task.id);
      addTask({
        ...task,
        ...editData
      });
      onClose();
    }
  };
  
  // If no projects exist, direct user to create a project first
  if (projects.length === 0) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nie można utworzyć zadania</DialogTitle>
          </DialogHeader>
          
          <div className="py-6 text-center">
            <p className="mb-4">Musisz najpierw utworzyć projekt, zanim będziesz mógł dodać zadania.</p>
            <Button 
              onClick={() => {
                onClose();
                adminNavigate("/projects");
              }}
            >
              Przejdź do projektów
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  // If task not found, close the modal
  if (!task) {
    onClose();
    return null;
  }
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edytuj zadanie</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Tytuł zadania</Label>
            <Input 
              id="edit-title" 
              value={editData.title} 
              onChange={(e) => setEditData({...editData, title: e.target.value})}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Opis</Label>
            <Textarea 
              id="edit-description" 
              value={editData.description} 
              onChange={(e) => setEditData({...editData, description: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-priority">Priorytet</Label>
              <Select 
                value={editData.priority} 
                onValueChange={(value: Priority) => setEditData({...editData, priority: value})}
              >
                <SelectTrigger id="edit-priority">
                  <SelectValue placeholder="Wybierz priorytet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niski</SelectItem>
                  <SelectItem value="medium">Średni</SelectItem>
                  <SelectItem value="high">Wysoki</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-dueDate">Termin</Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={editData.dueDate}
                onChange={(e) => setEditData({...editData, dueDate: e.target.value})}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="edit-project">Projekt <span className="text-destructive">*</span></Label>
            <Select 
              value={editData.projectId} 
              onValueChange={(value) => setEditData({...editData, projectId: value})}
              required
            >
              <SelectTrigger id="edit-project">
                <SelectValue placeholder="Wybierz projekt" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!editData.projectId && (
              <p className="text-xs text-destructive mt-1">Projekt jest wymagany</p>
            )}
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button 
            onClick={handleUpdate}
            disabled={!editData.title.trim() || !editData.projectId}
          >
            Zapisz zmiany
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}