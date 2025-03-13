// src/components/scenarios/ScenarioEditor.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import { useScenarioStore } from "@/stores/scenarioStore";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  // Load scenario data
  useEffect(() => {
    const scenario = getScenario(scenarioId);
    if (scenario) {
      setName(scenario.name);
      setDescription(scenario.description || "");
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

  const handleSave = () => {
    if (!name.trim()) return;

    updateScenario(scenarioId, {
      name: name.trim(),
      description: description.trim(),
    });

    setIsEdited(false);
    setSaveSuccess(true);

    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle>Edit Scenario</CardTitle>
        <CardDescription>
          Update your scenario details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
        </div>
      </CardContent>
    </Card>
  );
};