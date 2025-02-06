// src/plugins/pickerDoc/RuntimeComponent.tsx
import { PluginRuntimeProps } from "../base";
import { PickerDocRuntimeData } from "./types";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDocumentsStore } from "@/store/documentsStore";

export const RuntimeComponent: React.FC<PluginRuntimeProps> = ({
  onDataChange,
  onStatusChange,
}) => {
  const { documents } = useDocumentsStore();
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Update validity - at least one document must be selected
    const isValid = selectedDocs.size > 0;
    onStatusChange(isValid);

    // Update runtime data
    if (isValid) {
      const selectedDocuments = Array.from(selectedDocs).map((id) => {
        const doc = documents.find((d) => d.id === id);
        return {
          id,
          content: doc?.content || "",
        };
      });

      const newData: PickerDocRuntimeData = {
        selectedDocuments,
      };
      onDataChange(newData);
    }
  }, [selectedDocs, documents, onStatusChange, onDataChange]);

  const handleToggleDocument = (docId: string) => {
    setSelectedDocs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center space-x-2">
                <Checkbox
                  id={doc.id}
                  checked={selectedDocs.has(doc.id)}
                  onCheckedChange={() => handleToggleDocument(doc.id)}
                />
                <label
                  htmlFor={doc.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {doc.title}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};