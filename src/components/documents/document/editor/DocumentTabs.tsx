import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Info } from "lucide-react";
import { Trans } from "@lingui/macro";
import { DocumentEditor } from "./DocumentEditor";
import { Document, DocumentContainer, CustomFieldValue } from "@/types/document";
import { CustomFields } from "../../customFields";
import { DocumentPreview } from "../preview";

interface DocumentTabsProps {
  document: Document;
  container: DocumentContainer;
  onUpdate: (field: string, value: CustomFieldValue) => void;
}

export const DocumentTabs = ({
  document,
  container,
  onUpdate,
}: DocumentTabsProps) => {
  const handleContentChange = (content: string | undefined) => {
    onUpdate("content", content || "");
  };

  const handleCustomFieldUpdate = (field: string, value: CustomFieldValue) => {
    onUpdate(field, value);
  };

  return (
    <Tabs defaultValue="editor" className="w-full">
      <div className="flex justify-between items-center mb-4">
        <span></span>
        <TabsList>
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <Trans>Content</Trans>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <Trans>Details</Trans>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="editor" className="mt-4 space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-4">
            <Trans>Content Editor</Trans>
          </h3>
          <DocumentEditor
            content={document.content || ""}
            onChange={handleContentChange}
          />
        </div>

        {container?.schema?.fields && container.schema.fields.length > 0 && (
          <CustomFields
            schema={container.schema.fields}
            document={document}
            onUpdate={handleCustomFieldUpdate}
          />
        )}
      </TabsContent>

      <TabsContent value="preview" className="mt-4">
        <h3 className="text-sm font-medium mb-4">
          <Trans>Document Information</Trans>
        </h3>
        <DocumentPreview document={document} container={container} />
      </TabsContent>
    </Tabs>
  );
};

export default DocumentTabs;