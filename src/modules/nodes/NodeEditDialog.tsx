// src/modules/nodes/NodeEditDialog.tsx
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GraphNode } from "../types";

interface NodeEditDialogProps {
  node: GraphNode;
  open: boolean;
  onClose: () => void;
  onUpdateNode: (nodeId: string, label: string, assistant: string) => void;
}

export const NodeEditDialog: React.FC<NodeEditDialogProps> = ({ 
  node, 
  open, 
  onClose, 
  onUpdateNode 
}) => {
  const [editNodeData, setEditNodeData] = React.useState({ 
    label: node.label, 
    assistant: node.assistant 
  });

  const handleUpdateNode = () => {
    onUpdateNode(node.id, editNodeData.label, editNodeData.assistant);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Node</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={editNodeData.label}
            onChange={(e) =>
              setEditNodeData((prev) => ({ ...prev, label: e.target.value }))
            }
            placeholder="Node name"
          />
          <Textarea
            value={editNodeData.assistant}
            onChange={(e) =>
              setEditNodeData((prev) => ({ ...prev, assistant: e.target.value }))
            }
            placeholder="Assistant message"
            className="min-h-[80px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdateNode}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};