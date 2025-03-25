// src/modules/graph/components/AddNewEdge.tsx
import { useState } from "react";
import { useAppStore } from "../../store";
import {
  CancelButton,
  DialogModal,
  InputField,
  SaveButton,
} from "@/components/studio";

interface AddNewEdgeProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AddNewEdge: React.FC<AddNewEdgeProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const addEdge = useAppStore((state) => state.addEdge);
  const state = useAppStore();
  const workspace = state.items.find(w => w.id === state.selected.workspace);
  const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
  const nodes = scenario?.children || [];

  const [formData, setFormData] = useState({
    source: "",
    target: "",
    label: "",
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
    if (!formData.source || !formData.target) return;
    addEdge({
      source: formData.source,
      target: formData.target,
      label: formData.label,
    });
    setFormData({ source: "", target: "", label: "" });
    setIsOpen(false);
  };

  const handleClose = () => setIsOpen(false);

  const renderFooter = () => (
    <>
      <CancelButton onClick={handleClose} />
      <SaveButton onClick={handleSubmit} disabled={!formData.source || !formData.target} />
    </>
  );

  // Only show the dialog if there are at least 2 nodes
  if (nodes.length < 2) {
    return null;
  }

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Edge"
      description="Create a new connection between nodes"
      footer={renderFooter()}
    >
      <div className="mb-4">
        <label htmlFor="source" className="block text-sm font-medium mb-1">
          Source Node
        </label>
        <select
          id="source"
          name="source"
          value={formData.source}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Select source node</option>
          {nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="target" className="block text-sm font-medium mb-1">
          Target Node
        </label>
        <select
          id="target"
          name="target"
          value={formData.target}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Select target node</option>
          {nodes.map((node) => (
            <option 
              key={node.id} 
              value={node.id}
              disabled={node.id === formData.source}
            >
              {node.label}
            </option>
          ))}
        </select>
      </div>

      <InputField
        id="label"
        name="label"
        label="Label (optional)"
        value={formData.label}
        onChange={handleChange}
        placeholder="Edge label"
      />
    </DialogModal>
  );
};

export default AddNewEdge;