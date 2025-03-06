// src/pages/projects/components/EditProjectModal.tsx
import { useState, useEffect } from "react";
import { Project } from "@/types";
import { FormModal, Input, Label, Textarea } from "@/components/ui";
import projectService from "../services/ProjectService";
import { useToast } from "@/hooks/useToast";

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set initial form values
  useEffect(() => {
    if (project) {
      setName(project.name);
      setSlug(project.slug);
      setDescription(project.description || "");
      setError(null);
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!project || !name.trim() || !slug.trim()) return;
    
    setIsSubmitting(true);
    setError(null);

    const result = projectService.updateProject(project.id, {
      name,
      slug,
      description,
    });

    if (!result.success) {
      setError(result.error || "Failed to update the project.");
      setIsSubmitting(false);
      return;
    }

    // Notification of success
    toast({
      title: "Success",
      description: "Project updated successfully",
      variant: "default"
    });

    setIsSubmitting(false);
    setError(null);
    onClose();
  };

  if (!project) return null;

  return (
    <FormModal
      title="Edit Project"
      description="Update project details."
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitDisabled={!name.trim() || !slug.trim() || isSubmitting}
      error={error}
      submitLabel={isSubmitting ? "Saving..." : "Save Changes"}
    >
      <div className="grid gap-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null); // Clear error when input changes
          }}
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
        />
      </div>
    </FormModal>
  );
};

export default EditProjectModal;