// src/modules/graph/components/EditEdge.tsx
import { useState, useEffect } from "react";
import { useAppStore } from "../../store";
import {
  CancelButton,
  DialogModal,
  InputField,
  SaveButton,
} from "@/components/studio";

interface EditEdgeProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  edgeId: string;
}

const EditEdge: React.FC<EditEdgeProps> = ({
  isOpen,
  setIsOpen,
  edgeId,
}) => {
  const [formData, setFormData] = useState({
    label: "",
  });

  // Get necessary state
  const state = useAppStore();
  const workspace = state.items.find(w => w.id === state.selected.workspace);
  const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
  const edge = scenario?.edges?.find(e => e.id === edgeId);

  // Load edge data when component mounts or edgeId changes
  useEffect(() => {
    if (isOpen && edgeId && edge) {
      setFormData({
        label: edge.label || "",
      });
    }
  }, [isOpen, edgeId, edge]);

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
    // Update the edge label
    useAppStore.getState().updateEdgeLabel(edgeId, formData.label);
    setIsOpen(false);
  };

  const handleClose = () => setIsOpen(false);

  const renderFooter = () => (
    <>
      <CancelButton onClick={handleClose} />
      <SaveButton onClick={handleSubmit} />
    </>
  );

  // Get the source and target node labels for display
  const sourceNode = scenario?.children.find(n => n.id === edge?.source);
  const targetNode = scenario?.children.find(n => n.id === edge?.target);

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Edge"
      description="Update edge details"
      footer={renderFooter()}
    >
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Connection
        </label>
        <div className="px-3 py-2 border border-border bg-muted/30 rounded-md text-muted-foreground">
          {sourceNode?.label || "Unknown"} → {targetNode?.label || "Unknown"}
        </div>
      </div>

      <InputField
        id="label"
        name="label"
        label="Label"
        value={formData.label}
        onChange={handleChange}
        placeholder="Edge label"
      />
    </DialogModal>
  );
};

export default EditEdge;