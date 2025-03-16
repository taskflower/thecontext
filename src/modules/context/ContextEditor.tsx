// src/modules/context/ContextEditor.tsx
import React, { useState, useEffect } from "react";
import { useAppStore } from "../store";
import { ContextItem } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ContextEditorProps {
  onClose: () => void;
}

export const ContextEditor: React.FC<ContextEditorProps> = ({ onClose }) => {
  const selected = useAppStore((state) => state.selected);
  const workspaceId = selected.workspace;
  const getContextItems = useAppStore((state) => state.getContextItems);
  const addContextItem = useAppStore((state) => state.addContextItem);
  const updateContextItem = useAppStore((state) => state.updateContextItem);
  const deleteContextItem = useAppStore((state) => state.deleteContextItem);
  // Force component to update when state changes
  useAppStore((state) => state.stateVersion);

  const [items, setItems] = useState<ContextItem[]>([]);

  // State for new item
  const [newItem, setNewItem] = useState<{
    key: string;
    value: string;
    valueType: "text" | "json";
  }>({
    key: "",
    value: "",
    valueType: "text",
  });

  // State for editing item
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Load context data on mount or workspace change
  useEffect(() => {
    if (workspaceId) {
      // Get items from store and apply to state using state function
      const contextItems = getContextItems(workspaceId)(useAppStore.getState());
      setItems(contextItems);
    } else {
      setItems([]);
    }
  }, [workspaceId, getContextItems]);

  // Add new context item
  const handleAddItem = () => {
    if (newItem.key.trim() === "" || !workspaceId) return;

    // Validate JSON if that's the type
    if (newItem.valueType === "json") {
      try {
        JSON.parse(newItem.value);
      } catch {
        alert("Invalid JSON format");
        return;
      }
    }

    // Add the item
    addContextItem(workspaceId, {
      key: newItem.key,
      value: newItem.value,
      valueType: newItem.valueType,
    });

    // Reset form
    setNewItem({
      key: "",
      value: "",
      valueType: "text",
    });

    // Update local state
    const updatedItems = getContextItems(workspaceId)(useAppStore.getState());
    setItems(updatedItems);
  };

  // Start editing an item
  const handleEditStart = (item: ContextItem) => {
    setEditingItem(item.key);
    setEditValue(item.value);
  };

  // Save edit changes
  const handleEditSave = (item: ContextItem) => {
    if (editingItem === null || !workspaceId) return;

    // Validate JSON if that's the type
    if (item.valueType === "json") {
      try {
        JSON.parse(editValue);
      } catch {
        alert("Invalid JSON format");
        return;
      }
    }

    // Update the item
    updateContextItem(workspaceId, item.key, editValue, item.valueType);
    setEditingItem(null);

    // Update local state
    const updatedItems = getContextItems(workspaceId)(useAppStore.getState());
    setItems(updatedItems);
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditingItem(null);
  };

  // Delete an item
  const handleDeleteItem = (key: string) => {
    if (!workspaceId) return;
    
    if (
      confirm(`Are you sure you want to delete the item with key "${key}"?`)
    ) {
      deleteContextItem(workspaceId, key);

      // Update local state
      const updatedItems = getContextItems(workspaceId)(useAppStore.getState());
      setItems(updatedItems);
    }
  };

  // Format JSON for display
  const formatJson = (value: string): string => {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Workspace Context</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
          {/* Add new item form */}
          <div className="grid grid-cols-[2fr_3fr_1fr] gap-2 p-2 bg-muted/20 rounded-md">
            <Input
              placeholder="Key"
              value={newItem.key}
              onChange={(e) =>
                setNewItem((prev) => ({ ...prev, key: e.target.value }))
              }
            />
            <Input
              placeholder="Value"
              value={newItem.value}
              onChange={(e) =>
                setNewItem((prev) => ({ ...prev, value: e.target.value }))
              }
            />
            <Select
              value={newItem.valueType}
              onValueChange={(value) =>
                setNewItem((prev) => ({
                  ...prev,
                  valueType: value as "text" | "json",
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="col-span-3 mt-2"
              size="sm"
              onClick={handleAddItem}
              disabled={newItem.key.trim() === "" || !workspaceId}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Item
            </Button>
          </div>

          {/* Items table */}
          <ScrollArea className="flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <TableRow key={item.key}>
                      <TableCell className="font-medium">
                        {item.key}
                        <Badge
                          variant={
                            item.valueType === "json"
                              ? "outline"
                              : "secondary"
                          }
                          className="ml-2 text-xs"
                        >
                          {item.valueType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {editingItem === item.key ? (
                          <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="min-h-[80px] font-mono text-xs"
                          />
                        ) : (
                          <div className="max-h-[100px] overflow-y-auto whitespace-pre-wrap text-sm font-mono bg-muted/30 p-1 rounded">
                            {item.valueType === "json"
                              ? formatJson(item.value)
                              : item.value}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.key ? (
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => handleEditSave(item)}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={handleEditCancel}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => handleEditStart(item)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteItem(item.key)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center h-24 text-muted-foreground"
                    >
                      No items in this context yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};