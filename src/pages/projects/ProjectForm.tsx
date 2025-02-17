/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/projects/ProjectForm.tsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trans } from "@lingui/macro";
import { useState } from "react";

interface ProjectFormData {
  title: string;
  description: string;
  settings: Record<string, any>;
}

interface ProjectFormProps {
  formData: ProjectFormData;
  onChange: (data: ProjectFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const ProjectForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
}: ProjectFormProps) => {
  const [settingsStr, setSettingsStr] = useState(
    JSON.stringify(formData.settings, null, 2)
  );

  const handleSettingsChange = (value: string) => {
    setSettingsStr(value);
    try {
      const parsed = JSON.parse(value);
      onChange({ ...formData, settings: parsed });
    } catch (e) {
      // If JSON is invalid, don't update the settings
      console.log(e);
      
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            <Trans>Project Details</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              <Trans>Title</Trans>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                onChange({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              <Trans>Description</Trans>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                onChange({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings">
              <Trans>Settings (JSON)</Trans>
            </Label>
            <Textarea
              id="settings"
              value={settingsStr}
              onChange={(e) => handleSettingsChange(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            <Trans>Cancel</Trans>
          </Button>
          <Button type="submit">
            <Trans>Save</Trans>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};