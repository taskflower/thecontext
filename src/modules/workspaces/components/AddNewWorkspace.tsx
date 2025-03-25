import { useState } from "react";
import { useAppStore } from "../../store";
import {
  CancelButton,
  DialogModal,
  InputField,
  SaveButton,
  TextAreaField,
} from "@/components/studio";

interface AddNewWorkspaceProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AddNewWorkspace: React.FC<AddNewWorkspaceProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const addWorkspace = useAppStore((state) => state.addWorkspace);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slug: "",
  });

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
    addWorkspace({
      title: formData.title,
      description: formData.description,
      slug: formData.slug,
    });
    setFormData({ title: "", description: "", slug: "" });
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
      title="Add Workspace"
      description="Create a new workspace for your projects"
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

export default AddNewWorkspace;