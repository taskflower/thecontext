/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Info } from "lucide-react";
import { Trans } from "@lingui/macro";
import { DocumentPreview } from "../preview/DocumentPreview";
import { DocumentEditor } from "./DocumentEditor";
import { DocumentContainer } from "@/types/document";
import CustomFields from "../schema/CustomFields";

interface DocumentTabsProps {
  document: Record<string, any>;
  container?: DocumentContainer;
  onUpdate: (field: string, value: any) => void;
}

export const DocumentTabs = ({ document, container, onUpdate }: DocumentTabsProps) => {
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
          <h3 className="text-sm font-md mb-4">Content Editor</h3>
          <DocumentEditor
            content={document.content || ""}
            onChange={(val: any) => onUpdate("content", val || "")}
          />
        </div>
        
        {container?.schema?.fields && container.schema.fields.length > 0 && (
          <CustomFields
            schema={container.schema.fields}
            document={document}
            onUpdate={onUpdate}
          />
        )}
      </TabsContent>

      <TabsContent value="preview" className="mt-4">
        <h3 className="text-sm font-medium mb-4">Document Information</h3>
        <DocumentPreview 
          document={document} 
          container={container}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DocumentTabs;