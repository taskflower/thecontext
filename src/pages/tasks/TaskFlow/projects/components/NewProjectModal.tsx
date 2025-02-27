import React from "react";
import { useTaskFlowStore } from "../../store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NewProjectModalProps {
  toggleNewProjectModal: () => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ toggleNewProjectModal }) => {
  const { addProject } = useTaskFlowStore();
  const [open, setOpen] = React.useState(true);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const newProject = {
      id: `proj-${Date.now()}`,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      progress: 0,
      tasks: 0,
      completedTasks: 0,
      dueDate: formData.get("dueDate") as string,
      folderId: null,
    };

    addProject(newProject);
    setOpen(false);
    toggleNewProjectModal();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      setOpen(open);
      if (!open) toggleNewProjectModal();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to your dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Project Title</Label>
              <Input id="title" name="title" required />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                className="h-24"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={toggleNewProjectModal}>
              Cancel
            </Button>
            <Button type="submit">
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectModal;