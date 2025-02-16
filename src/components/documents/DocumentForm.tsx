// src/components/documents/DocumentForm.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trans, t } from "@lingui/macro";
import { MarkdownEditor } from "./MarkdownComponents";

interface DocumentFormProps {
  title: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitButtonText: React.ReactNode;
  formTitle: React.ReactNode;
}

export const DocumentForm = ({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSubmit,
  onCancel,
  submitButtonText,
  formTitle,
}: DocumentFormProps) => {
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
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={t`Document title`}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              <Trans>Content</Trans>
            </label>
            <MarkdownEditor 
              content={content}
              onChange={(val) => onContentChange(val || "")}
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