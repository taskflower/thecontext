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
  const getContextItems = useAppStore((state) => state.getContextItems);
  const contextItems = getContextItems();

  const [formData, setFormData] = useState({
    label: "",
    assistantMessage: "",
    userPrompt: "",
    contextKey: "", // Add contextKey to formData
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
      contextKey: formData.contextKey || undefined, // Add contextKey to node data
    });
    setFormData({ label: "", assistantMessage: "", userPrompt: "", contextKey: "" });
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

      <div className="mb-4">
        <label htmlFor="contextKey" className="block text-sm font-medium mb-1">
          Context Key
        </label>
        <select
          id="contextKey"
          name="contextKey"
          value={formData.contextKey}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">No context</option>
          {contextItems.map((item) => (
            <option key={item.id} value={item.title}>
              {item.title}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Associate this node with a context item
        </p>
      </div>

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