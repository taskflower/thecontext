/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trans, t } from "@lingui/macro";
import { MarkdownEditor } from "./MarkdownComponents";
import { FileText, Info } from "lucide-react";

interface DocumentFormProps {
  document: Record<string, any>;
  onUpdate: (field: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitButtonText: React.ReactNode;
  formTitle: React.ReactNode;
}

export const DocumentForm = ({
  document,
  onUpdate,
  onSubmit,
  onCancel,
  submitButtonText,
  formTitle,
}: DocumentFormProps) => {
  const [activeTab, setActiveTab] = useState("editor");

  // Dynamicznie budujemy metadane, ignorując pole content
  const documentMetadata = Object.entries(document)
    .filter(([key]) => key !== 'content')
    .map(([key, value]) => {
      let displayValue = value;
      
      // Specjalna obsługa dat
      if (value instanceof Date || (typeof value === 'string' && Date.parse(value))) {
        displayValue = new Date(value).toLocaleString();
      }
      // Obsługa tablic
      else if (Array.isArray(value)) {
        displayValue = value.join(", ") || "None";
      }
      // Pozostałe typy
      else {
        displayValue = value?.toString() || "Not set";
      }

      return {
        key,
        value: displayValue
      };
    });

  return (
    <Card className="border-0 md:border shadow-none md:shadow">
      <CardHeader>
        <CardTitle>{formTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              <Trans>Title</Trans>
            </label>
            <Input
              value={document.title || ""}
              onChange={(e) => onUpdate("title", e.target.value)}
              placeholder={t`Document title`}
              required
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <Trans>Content Editor</Trans>
              </TabsTrigger>
              <TabsTrigger value="metadata" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <Trans>Document Info</Trans>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="mt-4">
              <MarkdownEditor 
                content={document.content || ""}
                onChange={(val) => onUpdate("content", val || "")}
              />
            </TabsContent>

            <TabsContent value="metadata" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3"><Trans>Property</Trans></TableHead>
                    <TableHead><Trans>Value</Trans></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentMetadata.map(({ key, value }) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium capitalize">
                        <Trans>{key.replace(/([A-Z])/g, ' $1').trim()}</Trans>
                      </TableCell>
                      <TableCell>
                        {key === "content" ? (
                          <Button
                            variant="link"
                            onClick={() => setActiveTab("editor")}
                            className="p-0 h-auto"
                          >
                            <Trans>View in editor</Trans>
                          </Button>
                        ) : (
                          value
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

export default DocumentForm;