// src/components/documents/ContainerForm.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trans, t } from "@lingui/macro";

interface ContainerFormProps {
  formData: {
    name: string;
    description: string;
    targetDocumentCount: number;
  };
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onChange: (field: string, value: string | number) => void;
  submitButtonText: React.ReactNode;
  formTitle: React.ReactNode;
}

export const ContainerForm = ({
  formData,
  onSubmit,
  onCancel,
  onChange,
  submitButtonText,
  formTitle,
}: ContainerFormProps) => {
  return (
    <Card className="border-0 md:border shadow-none md:shadow">
      <CardHeader>
        <CardTitle>{formTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              <Trans>Name</Trans>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder={t`Container name`}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              <Trans>Description</Trans>
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder={t`Container description`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              <Trans>Estimated target document count</Trans>
            </label>
            <Input
              type="number"
              min="0"
              value={formData.targetDocumentCount}
              onChange={(e) =>
                onChange("targetDocumentCount", parseInt(e.target.value) || 0)
              }
              placeholder={t`Optional target number of documents`}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit">{submitButtonText}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
