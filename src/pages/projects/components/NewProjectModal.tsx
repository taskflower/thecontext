// src/pages/projects/components/NewProjectModal.tsx
import { useState } from "react";
import { FormModal } from "@/components/ui/form-modal";
import { Input, Label, Textarea } from "@/components/ui";
import projectService from "../services/ProjectService";
import { useToast } from "@/hooks/useToast";

interface NewProjectModalProps {
  toggleNewProjectModal: () => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({
  toggleNewProjectModal,
}) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setError(null);

    // Generate slug from name (lowercase, replace spaces with hyphens, remove special chars)
    const newSlug = newName
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
    
    setSlug(newSlug);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) return;
    if (!slug.trim()) {
      setError("Slug is required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    const result = projectService.createProject(name, slug, description);

    if (!result.success) {
      setError(result.error || "Failed to create project");
      setIsSubmitting(false);
      return;
    }

    // Notification of success
    toast({
      title: "Success",
      description: "Project created successfully",
      variant: "default"
    });

    // Reset form
    setName("");
    setSlug("");
    setDescription("");
    setError(null);
    setIsSubmitting(false);

    toggleNewProjectModal();
  };

  return (
    <FormModal
      title="Create New Project"
      description="Add a new project to manage multiple scenarios."
      isOpen={true}
      onClose={toggleNewProjectModal}
      onSubmit={handleSubmit}
      isSubmitDisabled={!name.trim() || !slug.trim() || isSubmitting}
      error={error}
      submitLabel={isSubmitting ? "Creating..." : "Create Project"}
    >
      <div className="grid gap-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          value={name}
          onChange={handleNameChange}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value.toLowerCase().replace(/[^\w-]/g, ""));
            setError(null);
          }}
          placeholder="project-slug"
          required
        />
        <p className="text-xs text-muted-foreground">
          The slug is used in URLs and must be unique. Use only lowercase letters, 
          numbers, and hyphens.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          className="h-24"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description for your project..."
        />
      </div>
    </FormModal>
  );
};

export default NewProjectModal;