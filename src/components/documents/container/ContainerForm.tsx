/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/documents/ContainerForm.tsx
import React from "react";

import { FileText, Settings, Box } from "lucide-react";

import { DocumentSchema } from "@/types/schema";
import { Trans, t } from "@lingui/macro";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@/components/ui";
import { SchemaEditor } from "../customFields";

interface ContainerFormData {
  name: string;
  description?: string; // Make description optional
  targetDocumentCount?: number;
  schema?: DocumentSchema;
}

interface ContainerFormProps {
  formData: ContainerFormData;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onChange: (field: string, value: any) => void;
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
  const handleSchemaUpdate = (fields: any) => {
    onChange("schema", {
      id: formData.schema?.id || Date.now().toString(),
      fields,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Card className="border-0 md:border shadow-none md:shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Box className="h-5 w-5" />
          {formTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <Trans>Details</Trans>
              </TabsTrigger>
              <TabsTrigger value="schema" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <Trans>Custom fields</Trans>
              </TabsTrigger>
              <TabsTrigger value="scope" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <Trans>Messages scope</Trans>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-4">
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
                    onChange(
                      "targetDocumentCount",
                      parseInt(e.target.value) || 0
                    )
                  }
                  placeholder={t`Optional target number of documents`}
                />
              </div>
            </TabsContent>

            <TabsContent value="schema" className="mt-4">
              <SchemaEditor
                fields={formData.schema?.fields || []}
                onChange={handleSchemaUpdate}
              />
            </TabsContent>
          </Tabs>

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
export default ContainerForm;
