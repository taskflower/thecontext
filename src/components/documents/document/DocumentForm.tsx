import { Trans, t } from "@lingui/macro";
import {
  Document,
  DocumentContainer,
  CustomFieldValue,
} from "@/types/document";
import { DocumentSchema } from "@/types/schema";
import { updateDocumentFieldValue } from "@/utils/documents/fieldUtils";
import { useState } from "react";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { DocumentEditor } from "./editor/DocumentEditor";
import { CustomFields } from "../customFields";

interface DocumentFormProps {
  document: Document;
  container: DocumentContainer;
  schema?: DocumentSchema;
  onUpdate: (document: Document) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitButtonText: React.ReactNode;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({
  document,
  schema,
  onUpdate,
  onSubmit,
  onCancel,
  submitButtonText,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleFieldChange = (field: string, value: unknown) => {
    try {
      const typedValue = value as CustomFieldValue;
      const result = updateDocumentFieldValue(
        document,
        field,
        typedValue,
        schema?.fields
      );

      if (result.isValid) {
        onUpdate(result.document);
        setError(null);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : t`An unknown error occurred`
      );
    }
  };

  return (
    <Card className="border-0 md:border shadow-none md:shadow">
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              <Trans>Title</Trans>
            </label>
            <Input
              value={document.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              placeholder={t`Document title`}
              required
            />
          </div>

          {schema?.fields && schema.fields.length > 0 ? (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-medium">
                  <Trans>Content Editor</Trans>
                </h3>
                <DocumentEditor
                  content={document.content || ""}
                  onChange={(content) => handleFieldChange("content", content)}
                />
              </div>

              <div className="space-y-4">
                <CustomFields
                  schema={schema.fields}
                  document={document}
                  onUpdate={handleFieldChange}
                />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                <Trans>Content Editor</Trans>
              </h3>
              <DocumentEditor
                content={document.content || ""}
                onChange={(content) => handleFieldChange("content", content)}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit">{submitButtonText}</Button>
          </div>
        </form>

        {/* <DocumentPreview document={document} container={container} schema={schema} /> */}
      </CardContent>
    </Card>
  );
};
