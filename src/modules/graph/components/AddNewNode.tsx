// src/modules/graph/components/AddNewNode.tsx
import { useState } from "react";
import { useAppStore } from "../../store";
import {
  CancelButton,
  DialogModal,
  InputField,
  SaveButton,
  TextAreaField,
} from "@/components/studio";

interface AddNewNodeProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AddNewNode: React.FC<AddNewNodeProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const addNode = useAppStore((state) => state.addNode);

  const [formData, setFormData] = useState({
    label: "",
    assistantMessage: "",
    userPrompt: "",
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
    if (!formData.label.trim()) return;
    addNode({
      label: formData.label,
      assistantMessage: formData.assistantMessage,
      userPrompt: formData.userPrompt,
    });
    setFormData({ label: "", assistantMessage: "", userPrompt: "" });
    setIsOpen(false);
  };

  const handleClose = () => setIsOpen(false);

  const renderFooter = () => (
    <>
      <CancelButton onClick={handleClose} />
      <SaveButton onClick={handleSubmit} disabled={!formData.label.trim()} />
    </>
  );

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Node"
      description="Create a new node in your scenario"
      footer={renderFooter()}
    >
      <InputField
        id="label"
        name="label"
        label="Label"
        value={formData.label}
        onChange={handleChange}
        placeholder="Node label"
      />

      <TextAreaField
        id="userPrompt"
        name="userPrompt"
        label="User Prompt"
        value={formData.userPrompt}
        onChange={handleChange}
        placeholder="User prompt for this node..."
        rows={3}
      />

      <TextAreaField
        id="assistantMessage"
        name="assistantMessage"
        label="Assistant Message"
        value={formData.assistantMessage}
        onChange={handleChange}
        placeholder="Assistant message for this node..."
        rows={4}
      />
    </DialogModal>
  );
};

export default AddNewNode;