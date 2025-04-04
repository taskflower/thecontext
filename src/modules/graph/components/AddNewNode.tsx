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

const AddNewNode: React.FC<AddNewNodeProps> = ({ isOpen, setIsOpen }) => {
  const addNode = useAppStore((state) => state.addNode);
  const getContextItems = useAppStore((state) => state.getContextItems);
  const contextItems = getContextItems();

  const [formData, setFormData] = useState({
    label: "",
    description: "", // Dodane pole opisu
    assistantMessage: "",
    userPrompt: "",
    contextKey: "",
    contextJsonPath: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
      description: formData.description, // Dodane pole opisu
      assistantMessage: formData.assistantMessage,
      userPrompt: formData.userPrompt,
      contextKey: formData.contextKey || undefined,
      contextJsonPath: formData.contextJsonPath || undefined,
    });
    setFormData({
      label: "",
      description: "", // Dodane pole opisu
      assistantMessage: "",
      userPrompt: "",
      contextKey: "",
      contextJsonPath: "",
    });
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
        id="description"
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Node description (optional)"
        rows={2}
      />

      <TextAreaField
        id="assistantMessage"
        name="assistantMessage"
        label="Assistant Message (Question)"
        value={formData.assistantMessage}
        onChange={handleChange}
        placeholder="Assistant message for this node..."
        rows={4}
      />

      <TextAreaField
        id="userPrompt"
        name="userPrompt"
        label="User Prompt (Answer)"
        value={formData.userPrompt}
        onChange={handleChange}
        placeholder="User prompt for this node..."
        rows={3}
      />

      <div className="mb-4">
        <label htmlFor="contextKey" className="block text-sm font-medium mb-1">
          Save answer to Context Key
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
      
      {/* JSON Path field - only show if context key is selected */}
      {formData.contextKey && (
        <div className="mb-4">
          <label htmlFor="contextJsonPath" className="block text-sm font-medium mb-1">
            JSON Path (optional)
          </label>
          <input
            type="text"
            id="contextJsonPath"
            name="contextJsonPath"
            value={formData.contextJsonPath}
            onChange={handleChange}
            placeholder="e.g. data.user.name (leave empty for entire JSON)"
            className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Save only part of the JSON to context (supports dot notation)
          </p>
        </div>
      )}
    </DialogModal>
  );
};

export default AddNewNode;