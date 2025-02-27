// src/pages/tasks/TaskFlow/documents/components/DocumentBrowser.tsx

import React from "react";
import { Folder } from "lucide-react";
import DocumentItem from "./DocumentItem";
import { Button } from "@/components/ui/button";
import { useDataStore, useUIStore } from "../../store";

const DocumentBrowser: React.FC = () => {
  const { 
    getChildFolders, 
    getDocItemsInFolder, 
    getFolderPath
  } = useDataStore();
  
  const {
    currentFolder,
    navigateToFolder,
    selectDocument
  } = useUIStore();
  
  const childFolders = getChildFolders(currentFolder);
  const docItems = getDocItemsInFolder(currentFolder);
  const folderPath = getFolderPath(currentFolder);
  
  return (
    <>
      <div className="border-b pb-2 mb-4">
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          {folderPath.map((folder, index) => (
            <React.Fragment key={folder.id}>
              {index > 0 && <span className="mx-1">/</span>}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 flex items-center" 
                onClick={() => navigateToFolder(folder.id)}
              >
                <Folder size={14} className="mr-1" />
                <span>{folder.name}</span>
              </Button>
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {childFolders.map(folder => (
          <DocumentItem 
            key={folder.id} 
            type="folder" 
            id={folder.id}
            name={folder.name} 
            onNavigate={() => navigateToFolder(folder.id)}
          />
        ))}
        
        {docItems.map(docItem => (
          <DocumentItem 
            key={docItem.id} 
            type="document" 
            id={docItem.id}
            name={docItem.title}
            metaKeys={docItem.metaKeys}
            updatedAt={docItem.updatedAt}
            onSelect={() => selectDocument(docItem.id)}
          />
        ))}
        
        {childFolders.length === 0 && docItems.length === 0 && (
          <div className="text-center p-6 text-muted-foreground">
            This folder is empty
          </div>
        )}
      </div>
    </>
  );
};

export default DocumentBrowser;