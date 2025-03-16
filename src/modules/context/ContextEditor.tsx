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
import { Label } from "@/components/ui/label";
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

  // Stan dla nowego elementu
  const [newItem, setNewItem] = useState<{
    key: string;
    value: string;
    valueType: "text" | "json";
  }>({
    key: "",
    value: "",
    valueType: "text",
  });

  // Stan dla edycji elementu
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Ładowanie danych kontekstu przy montowaniu lub zmianie workspace
  useEffect(() => {
    const contextItems = getContextItems(workspaceId);
    setItems(contextItems);
  }, [workspaceId, getContextItems]);

  // Dodaj nowy element kontekstu
  const handleAddItem = () => {
    if (newItem.key.trim() === "") return;

    // Walidacja JSON, jeśli to typ JSON
    if (newItem.valueType === "json") {
      try {
        JSON.parse(newItem.value);
      } catch {
        alert("Invalid JSON format");
        return;
      }
    }

    // Dodaj element
    addContextItem(workspaceId, {
      key: newItem.key,
      value: newItem.value,
      valueType: newItem.valueType,
    });

    // Resetuj formularz
    setNewItem({
      key: "",
      value: "",
      valueType: "text",
    });

    // Aktualizuj lokalny stan
    setItems(getContextItems(workspaceId));
  };

  // Rozpocznij edycję elementu
  const handleEditStart = (item: ContextItem) => {
    setEditingItem(item.key);
    setEditValue(item.value);
  };

  // Zakończ edycję i zapisz zmiany
  const handleEditSave = (item: ContextItem) => {
    if (editingItem === null) return;

    // Walidacja JSON, jeśli to typ JSON
    if (item.valueType === "json") {
      try {
        JSON.parse(editValue);
      } catch {
        alert("Invalid JSON format");
        return;
      }
    }

    // Aktualizuj element
    updateContextItem(workspaceId, item.key, editValue, item.valueType);
    setEditingItem(null);

    // Aktualizuj lokalny stan
    setItems(getContextItems(workspaceId));
  };

  // Anuluj edycję
  const handleEditCancel = () => {
    setEditingItem(null);
  };

  // Usuń element
  const handleDeleteItem = (key: string) => {
    if (
      confirm(`Are you sure you want to delete the item with key "${key}"?`)
    ) {
      deleteContextItem(workspaceId, key);

      // Aktualizuj lokalny stan
      setItems(getContextItems(workspaceId));
    }
  };

  // Formatuj JSON do wyświetlenia
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Workspace Context</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4 flex-1 overflow-hidden">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Items</Label>
            <div className="col-span-3 border rounded-md p-0 overflow-hidden">
              <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                <h4 className="font-medium text-sm">Context Key-Value Pairs</h4>
                <span className="text-xs text-muted-foreground">
                  {items.length} items
                </span>
              </div>

              <div className="p-3 border-b">
                <div className="grid grid-cols-[2fr_3fr_1fr] gap-2">
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
                </div>
                <Button
                  className="w-full mt-2"
                  size="sm"
                  onClick={handleAddItem}
                  disabled={newItem.key.trim() === ""}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Item
                </Button>
              </div>

              <ScrollArea className="max-h-[300px]">
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
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
