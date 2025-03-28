// src/modules/graph/components/EditNode.tsx
import { useState, useEffect } from "react";
import { useAppStore } from "../../store";
import {
  CancelButton,
  DialogModal,
  InputField,
  SaveButton,
  TextAreaField,
} from "@/components/studio";

interface EditNodeProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  nodeId: string;
}

const EditNode: React.FC<EditNodeProps> = ({ isOpen, setIsOpen, nodeId }) => {
  const [formData, setFormData] = useState({
    label: "",
    userPrompt: "",
    assistantMessage: "",
    contextKey: "", // Add contextKey to formData
  });

  // Get necessary state and actions
  const state = useAppStore();
  const getContextItems = useAppStore((state) => state.getContextItems);
  const contextItems = getContextItems();
  const workspace = state.items.find((w) => w.id === state.selected.workspace);
  const scenario = workspace?.children.find(
    (s) => s.id === state.selected.scenario
  );
  const node = scenario?.children.find((n) => n.id === nodeId);

  // Load node data when component mounts or nodeId changes
  useEffect(() => {
    if (isOpen && nodeId && node) {
      setFormData({
        label: node.label || "",
        userPrompt: node.userPrompt || "",
        assistantMessage: node.assistantMessage || "",
        contextKey: node.contextKey || "", // Load contextKey from node
      });
    }
  }, [isOpen, nodeId, node]);

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

    // Update the node
    const updateNode = useAppStore.getState();
    updateNode.updateNodeLabel(nodeId, formData.label);
    updateNode.updateNodeUserPrompt(nodeId, formData.userPrompt);
    updateNode.updateNodeAssistantMessage(nodeId, formData.assistantMessage);
    updateNode.updateNodeContextKey(nodeId, formData.contextKey); // Update contextKey

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
      title="Edit Node"
      description="Update node details"
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
        id="assistantMessage"
        name="assistantMessage"
        label="Assistant Message"
        value={formData.assistantMessage}
        onChange={handleChange}
        placeholder="Assistant message for this node..."
        rows={4}
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
    </DialogModal>
  );
};

export default EditNode;
