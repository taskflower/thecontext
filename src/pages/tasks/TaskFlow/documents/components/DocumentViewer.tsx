// src/pages/tasks/TaskFlow/documents/components/DocumentViewer.tsx

import React from "react";
import { X,  Tag, Clock } from "lucide-react";
import { useTaskFlowStore } from "../../store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DocumentViewer: React.FC = () => {
  const { selectedDocument, getDocument, selectDocument } = useTaskFlowStore();
  
  // If no document is selected, return null
  if (!selectedDocument) return null;
  
  const document = getDocument(selectedDocument);
  
  // If document not found, return null
  if (!document) return null;
  
  const createdDate = new Date(document.createdAt).toLocaleDateString();
  const updatedDate = new Date(document.updatedAt).toLocaleDateString();
  
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{document.title}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground gap-2 mt-1">
            <Clock size={14} />
            <span>
              Created: {createdDate} 
              {createdDate !== updatedDate && ` · Updated: ${updatedDate}`}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => selectDocument(null)}>
          <X size={18} />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto">
        <div className="whitespace-pre-wrap mb-6">{document.content}</div>
        
        {document.metaKeys.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center mb-2">
              <Tag size={14} className="text-muted-foreground mr-2" />
              <span className="text-sm font-medium">Tags</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {document.metaKeys.map((key, index) => (
                <Badge key={index} variant="secondary">
                  {key}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentViewer;