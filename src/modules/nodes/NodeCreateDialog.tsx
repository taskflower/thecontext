// src/modules/nodes/NodeCreateDialog.tsx
import React from "react";


import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface NodeCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onAddNode: (label: string, assistant: string) => void;
}

export const NodeCreateDialog: React.FC<NodeCreateDialogProps> = ({ 
  open, 
  onClose, 
  onAddNode 
}) => {

  const [nodeData, setNodeData] = React.useState({ label: "", assistant: "" });

  const handleAddNode = () => {
    if (nodeData.label.trim()) {
      onAddNode(nodeData.label, nodeData.assistant);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Node</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={nodeData.label}
            onChange={(e) => setNodeData(prev => ({ ...prev, label: e.target.value }))}
            placeholder="Node name"
          />
          <Textarea
            value={nodeData.assistant}
            onChange={(e) => setNodeData(prev => ({ ...prev, assistant: e.target.value }))}
            placeholder="Assistant message"
            className="min-h-[80px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddNode}>
            Add Node
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};