import React, { useState, useEffect } from "react";
import { useAppStore } from "../store";
import { Filter, FilterOperator } from "./types";
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
import { Plus, Trash2, Edit2, Check, X, ToggleLeft, ToggleRight } from "lucide-react";


interface FilterEditorProps {
  scenarioId: string;
  onClose: () => void;
}

export const FilterEditor: React.FC<FilterEditorProps> = ({ scenarioId, onClose }) => {
  const selected = useAppStore((state) => state.selected);
  const getContextItems = useAppStore((state) => state.getContextItems);
  const getScenarioFilters = useAppStore((state) => state.getScenarioFilters);
  const addScenarioFilter = useAppStore((state) => state.addScenarioFilter);
  const updateScenarioFilter = useAppStore((state) => state.updateScenarioFilter);
  const deleteScenarioFilter = useAppStore((state) => state.deleteScenarioFilter);
  const toggleScenarioFilter = useAppStore((state) => state.toggleScenarioFilter);
  
  // Force component to update when state changes
  useAppStore((state) => state.stateVersion);

  const [filters, setFilters] = useState<Filter[]>([]);
  const [contextItems, setContextItems] = useState<{ key: string; valueType: string }[]>([]);

  // State for new filter
  const [newFilter, setNewFilter] = useState<{
    name: string;
    contextKey: string;
    operator: FilterOperator;
    value: string;
  }>({
    name: "",
    contextKey: "",
    operator: FilterOperator.EQUALS,
    value: "",
  });

  // State for editing filter
  const [editingFilter, setEditingFilter] = useState<string | null>(null);
  const [editFilter, setEditFilter] = useState<{
    name: string;
    contextKey: string;
    operator: FilterOperator;
    value: string;
  }>({
    name: "",
    contextKey: "",
    operator: FilterOperator.EQUALS,
    value: "",
  });

  // Load filters and context data on mount
  useEffect(() => {
    if (scenarioId && selected.workspace) {
      // Get context items for dropdown options
      const workspaceContextItems = getContextItems(selected.workspace)(useAppStore.getState());
      setContextItems(workspaceContextItems);
      
      // Get filters for this scenario
      const scenarioFilters = getScenarioFilters(scenarioId)(useAppStore.getState());
      setFilters(scenarioFilters);
    } else {
      setFilters([]);
      setContextItems([]);
    }
  }, [scenarioId, selected.workspace, getContextItems, getScenarioFilters]);

  // Add new filter
  const handleAddFilter = () => {
    if (newFilter.name.trim() === "" || newFilter.contextKey === "") return;

    // Add the filter
    addScenarioFilter(scenarioId, {
      name: newFilter.name,
      contextKey: newFilter.contextKey,
      operator: newFilter.operator,
      value: newFilter.value,
      enabled: true
    });

    // Reset form
    setNewFilter({
      name: "",
      contextKey: "",
      operator: FilterOperator.EQUALS,
      value: "",
    });

    // Update local state
    const updatedFilters = getScenarioFilters(scenarioId)(useAppStore.getState());
    setFilters(updatedFilters);
  };

  // Start editing a filter
  const handleEditStart = (filter: Filter) => {
    setEditingFilter(filter.id);
    setEditFilter({
      name: filter.name,
      contextKey: filter.contextKey,
      operator: filter.operator,
      value: filter.value || "",
    });
  };

  // Save edit changes
  const handleEditSave = (filter: Filter) => {
    if (editingFilter === null) return;

    // Update the filter with all editable properties
    updateScenarioFilter(scenarioId, filter.id, {
      name: editFilter.name,
      contextKey: editFilter.contextKey,
      operator: editFilter.operator,
      value: editFilter.value,
    });
    setEditingFilter(null);

    // Update local state
    const updatedFilters = getScenarioFilters(scenarioId)(useAppStore.getState());
    setFilters(updatedFilters);
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditingFilter(null);
  };

  // Delete a filter
  const handleDeleteFilter = (filterId: string) => {
    if (confirm(`Are you sure you want to delete this filter?`)) {
      deleteScenarioFilter(scenarioId, filterId);

      // Update local state
      const updatedFilters = getScenarioFilters(scenarioId)(useAppStore.getState());
      setFilters(updatedFilters);
    }
  };

  // Toggle filter enabled state
  const handleToggleFilter = (filterId: string) => {
    toggleScenarioFilter(scenarioId, filterId);

    // Update local state
    const updatedFilters = getScenarioFilters(scenarioId)(useAppStore.getState());
    setFilters(updatedFilters);
  };

  // Get operator display name
  const getOperatorLabel = (operator: FilterOperator): string => {
    switch (operator) {
      case FilterOperator.EQUALS: return "Equals";
      case FilterOperator.NOT_EQUALS: return "Not Equals";
      case FilterOperator.CONTAINS: return "Contains";
      case FilterOperator.NOT_CONTAINS: return "Not Contains";
      case FilterOperator.EMPTY: return "Is Empty";
      case FilterOperator.NOT_EMPTY: return "Is Not Empty";
      case FilterOperator.GREATER_THAN: return "Greater Than";
      case FilterOperator.LESS_THAN: return "Less Than";
      case FilterOperator.JSON_PATH: return "JSON Path";
      default: return operator;
    }
  };

  // Check if operator needs a value
  const operatorNeedsValue = (operator: FilterOperator): boolean => {
    return ![FilterOperator.EMPTY, FilterOperator.NOT_EMPTY].includes(operator);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Scenario Filters</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
          {/* Add new filter form */}
          <div className="grid grid-cols-2 gap-2 p-2 bg-muted/20 rounded-md">
            <div className="col-span-2">
              <Label htmlFor="filter-name">Filter Name</Label>
              <Input
                id="filter-name"
                placeholder="Filter name"
                value={newFilter.name}
                onChange={(e) =>
                  setNewFilter((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            
            <div>
              <Label htmlFor="context-key">Context Key</Label>
              <Select
                value={newFilter.contextKey}
                onValueChange={(value) =>
                  setNewFilter((prev) => ({ ...prev, contextKey: value }))
                }
              >
                <SelectTrigger id="context-key" className="w-full">
                  <SelectValue placeholder="Select context key" />
                </SelectTrigger>
                <SelectContent>
                  {contextItems.map((item) => (
                    <SelectItem key={item.key} value={item.key}>
                      {item.key} ({item.valueType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="operator">Operator</Label>
              <Select
                value={newFilter.operator}
                onValueChange={(value) =>
                  setNewFilter((prev) => ({
                    ...prev,
                    operator: value as FilterOperator,
                    // Clear value if new operator doesn't need it
                    value: operatorNeedsValue(value as FilterOperator) ? prev.value : "",
                  }))
                }
              >
                <SelectTrigger id="operator" className="w-full">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FilterOperator).map((op) => (
                    <SelectItem key={op} value={op}>
                      {getOperatorLabel(op)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {operatorNeedsValue(newFilter.operator) && (
              <div className="col-span-2">
                <Label htmlFor="filter-value">Value</Label>
                <Input
                  id="filter-value"
                  placeholder="Filter value"
                  value={newFilter.value}
                  onChange={(e) =>
                    setNewFilter((prev) => ({ ...prev, value: e.target.value }))
                  }
                />
              </div>
            )}
            
            <Button
              className="col-span-2 mt-2"
              size="sm"
              onClick={handleAddFilter}
              disabled={newFilter.name.trim() === "" || newFilter.contextKey === ""}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Filter
            </Button>
          </div>

          {/* Filters table */}
          <ScrollArea className="flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Context Key</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filters.length > 0 ? (
                  filters.map((filter) => (
                    <TableRow key={filter.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleFilter(filter.id)}
                          className="h-7 w-7"
                        >
                          {filter.enabled ? (
                            <ToggleRight className="h-5 w-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{filter.name}</TableCell>
                      <TableCell>{filter.contextKey}</TableCell>
                      <TableCell>{getOperatorLabel(filter.operator)}</TableCell>
                      <TableCell className="font-medium">
                        {editingFilter === filter.id ? (
                          <Input 
                            value={editFilter.name}
                            onChange={(e) => setEditFilter(prev => ({ ...prev, name: e.target.value }))}
                          />
                        ) : (
                          filter.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingFilter === filter.id ? (
                          <Select
                            value={editFilter.contextKey}
                            onValueChange={(value) => setEditFilter(prev => ({ ...prev, contextKey: value }))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select context key" />
                            </SelectTrigger>
                            <SelectContent>
                              {contextItems.map((item) => (
                                <SelectItem key={item.key} value={item.key}>
                                  {item.key} ({item.valueType})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          filter.contextKey
                        )}
                      </TableCell>
                      <TableCell>
                        {editingFilter === filter.id ? (
                          <Select
                            value={editFilter.operator}
                            onValueChange={(value) => {
                              const newOperator = value as FilterOperator;
                              setEditFilter(prev => ({ 
                                ...prev, 
                                operator: newOperator,
                                value: operatorNeedsValue(newOperator) ? prev.value : ""
                              }));
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select operator" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(FilterOperator).map((op) => (
                                <SelectItem key={op} value={op}>
                                  {getOperatorLabel(op)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          getOperatorLabel(filter.operator)
                        )}
                      </TableCell>
                      <TableCell>
                        {editingFilter === filter.id ? (
                          operatorNeedsValue(editFilter.operator) ? (
                            <Input
                              value={editFilter.value}
                              onChange={(e) => setEditFilter(prev => ({ ...prev, value: e.target.value }))}
                            />
                          ) : (
                            <span className="text-muted-foreground italic">N/A</span>
                          )
                        ) : (
                          operatorNeedsValue(filter.operator) ? (
                            filter.value || <span className="text-muted-foreground italic">None</span>
                          ) : (
                            <span className="text-muted-foreground italic">N/A</span>
                          )
                        )}
                      </TableCell>
                      <TableCell>
                        {editingFilter === filter.id ? (
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => handleEditSave(filter)}
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
                              onClick={() => handleEditStart(filter)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteFilter(filter.id)}
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
                      colSpan={6}
                      className="text-center h-24 text-muted-foreground"
                    >
                      No filters defined for this scenario
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