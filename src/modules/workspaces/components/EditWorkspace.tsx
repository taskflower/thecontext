import { useState, useEffect } from "react";
import { useAppStore } from "../../store";
import {
  CancelButton,
  DialogModal,
  InputField,
  SaveButton,
  TextAreaField,
} from "@/components/studio";

interface EditWorkspaceProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  workspaceId: string;
}

const EditWorkspace: React.FC<EditWorkspaceProps> = ({
  isOpen,
  setIsOpen,
  workspaceId,
}) => {
  const updateWorkspace = useAppStore((state) => state.updateWorkspace);
  const getCurrentWorkspace = useAppStore((state) => state.getCurrentWorkspace);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slug: "",
  });

  // Load workspace data when component mounts or workspaceId changes
  useEffect(() => {
    if (isOpen && workspaceId) {
      const workspace = getCurrentWorkspace();
      if (workspace) {
        setFormData({
          title: workspace.title,
          description: workspace.description || "",
          slug: workspace.slug || "",
        });
      }
    }
  }, [isOpen, workspaceId, getCurrentWorkspace]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    updateWorkspace(workspaceId, {
      title: formData.title,
      description: formData.description,
      slug: formData.slug,
    });
    setIsOpen(false);
  };

  const handleClose = () => setIsOpen(false);

  const renderFooter = () => (
    <>
      <CancelButton onClick={handleClose} />
      <SaveButton onClick={handleSubmit} disabled={!formData.title.trim()} />
    </>
  );

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Workspace"
      description="Update workspace details"
      footer={renderFooter()}
    >
      <InputField
        id="title"
        name="title"
        label="Title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Workspace title"
      />

      <InputField
        id="slug"
        name="slug"
        label="Slug (Optional)"
        value={formData.slug}
        onChange={handleChange}
        placeholder="workspace-slug"
      />

      <TextAreaField
        id="description"
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleChange}
        placeholder="What this workspace is for..."
        rows={3}
      />
    </DialogModal>
  );
};

export default EditWorkspace;