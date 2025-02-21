// src/components/documents/document/DocumentForm.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trans, t } from "@lingui/macro";
import { Document, DocumentContainer, CustomFieldValue } from "@/types/document";
import DocumentTabs from "./editor/DocumentTabs";
import { updateDocumentField } from "@/utils/documents/documentHelpers";

interface DocumentFormProps {
  document: Document;
  container: DocumentContainer;
  onUpdate: (document: Document) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitButtonText: React.ReactNode;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({
  document,
  container,
  onUpdate,
  onSubmit,
  onCancel,
  submitButtonText,
}) => {
  const handleFieldChange = (field: string, value: unknown) => {
    // Konwertujemy unknown na CustomFieldValue
    const typedValue = value as CustomFieldValue;
    
    const result = updateDocumentField(document, field, typedValue, container.schema);
    
    if (result.isValid) {
      onUpdate(result.document);
    } else {
      // Tutaj możesz dodać obsługę błędów walidacji
      console.error(result.error);
    }
  };

  return (
    <Card className="border-0 md:border shadow-none md:shadow">
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
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

          <DocumentTabs
            document={document}
            container={container}
            onUpdate={handleFieldChange}
          />

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