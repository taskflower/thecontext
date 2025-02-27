import React from "react";
import { Folder, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTaskFlowStore } from "../../store";
import DocumentBrowser from "./DocumentBrowser";

const DocumentsView: React.FC = () => {
  const { addFolder, addFile, currentFolder } = useTaskFlowStore();
  
  const handleNewFolder = () => {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
      addFolder({
        id: `folder-${Date.now()}`,
        name: folderName,
        parentId: currentFolder
      });
    }
  };
  
  return (
    <div className="p-6 flex-1 overflow-auto">
      <div className="flex mb-4 gap-2">
        <Button 
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleNewFolder}
        >
          <Folder size={16} />
          <span>New Folder</span>
        </Button>
        <Button 
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => {
            // Simulation of file upload
            addFile({
              id: `file-${Date.now()}`,
              name: `Uploaded File ${Date.now()}.pdf`,
              folderId: currentFolder
            });
          }}
        >
          <FileText size={16} />
          <span>Upload Files</span>
        </Button>
      </div>
      
      <Card className="p-4">
        <DocumentBrowser />
      </Card>
    </div>
  );
};

export default DocumentsView;