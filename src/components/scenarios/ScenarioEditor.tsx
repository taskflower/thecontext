// src/components/scenarios/ScenarioEditor.tsx
import React, { useState, useEffect } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { useScenarioStore } from "@/stores/scenarioStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Filter condition types
type ConditionOperator = "exists" | "notExists" | "equals" | "notEquals" | "contains" | "notContains";

interface FilterCondition {
  id: string;
  key: string;
  operator: ConditionOperator;
  value?: string;
}

interface ScenarioEditorProps {
  scenarioId: string;
  onClose: () => void;
}

export const ScenarioEditor: React.FC<ScenarioEditorProps> = ({ scenarioId, onClose }) => {
  const { getScenario, updateScenario } = useScenarioStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isEdited, setIsEdited] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  // Filter conditions state
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);

  // Load scenario data
  useEffect(() => {
    const scenario = getScenario(scenarioId);
    if (scenario) {
      setName(scenario.name);
      setDescription(scenario.description || "");
      
      // Load existing filter conditions from context if they exist
      if (scenario.context && scenario.context.filterConditions) {
        setFilterConditions(scenario.context.filterConditions);
      } else {
        setFilterConditions([]);
      }
      
      setIsEdited(false);
    }
  }, [scenarioId, getScenario]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setIsEdited(true);
    setSaveSuccess(false);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    setIsEdited(true);
    setSaveSuccess(false);
  };

  // Handle adding a new filter condition
  const handleAddCondition = () => {
    const newCondition: FilterCondition = {
      id: Date.now().toString(),
      key: "",
      operator: "exists",
      value: ""
    };
    
    setFilterConditions([...filterConditions, newCondition]);
    setIsEdited(true);
    setSaveSuccess(false);
  };

  // Handle removing a filter condition
  const handleRemoveCondition = (id: string) => {
    setFilterConditions(filterConditions.filter(condition => condition.id !== id));
    setIsEdited(true);
    setSaveSuccess(false);
  };

  // Handle updating a filter condition
  const handleUpdateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setFilterConditions(
      filterConditions.map(condition => 
        condition.id === id ? { ...condition, ...updates } : condition
      )
    );
    setIsEdited(true);
    setSaveSuccess(false);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    // Save basic info and filter conditions
    updateScenario(scenarioId, {
      name: name.trim(),
      description: description.trim(),
      context: {
        filterConditions: filterConditions
      }
    });

    setIsEdited(false);
    setSaveSuccess(true);

    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  // Determine if a value is needed for the selected operator
  const operatorNeedsValue = (operator: ConditionOperator) => {
    return !["exists", "notExists"].includes(operator);
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Edit Scenario</CardTitle>
        <CardDescription>
          Update your scenario details and filtering options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={handleNameChange}
                placeholder="Scenario name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="What this scenario is for..."
                rows={3}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="filters" className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Filter Conditions</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddCondition}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Condition
              </Button>
            </div>
            
            {filterConditions.length === 0 ? (
              <div className="text-center py-4 text-slate-500">
                No filter conditions defined. Add one to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {filterConditions.map((condition) => (
                  <div key={condition.id} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-4">
                      <Input
                        placeholder="Context key"
                        value={condition.key}
                        onChange={(e) => handleUpdateCondition(condition.id, { key: e.target.value })}
                      />
                    </div>
                    
                    <div className="col-span-3">
                      <Select
                        value={condition.operator}
                        onValueChange={(value: ConditionOperator) => 
                          handleUpdateCondition(condition.id, { 
                            operator: value,
                            // Clear value if it's not needed for this operator
                            value: !operatorNeedsValue(value) ? undefined : condition.value
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exists">Exists</SelectItem>
                          <SelectItem value="notExists">Does not exist</SelectItem>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="notEquals">Not equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="notContains">Does not contain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-4">
                      {operatorNeedsValue(condition.operator) ? (
                        <Input
                          placeholder="Value"
                          value={condition.value || ""}
                          onChange={(e) => handleUpdateCondition(condition.id, { value: e.target.value })}
                        />
                      ) : (
                        <Input disabled placeholder="No value needed" />
                      )}
                    </div>
                    
                    <div className="col-span-1 flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCondition(condition.id)}
                        className="h-10 w-10 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="pt-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-800">
                Scenarios will be filtered based on these conditions in the scenarios list
              </Badge>
            </div>
          </TabsContent>
          
          {saveSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-600">
                Scenario updated successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isEdited || !name.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </Tabs>
      </CardContent>
</>
  );
};