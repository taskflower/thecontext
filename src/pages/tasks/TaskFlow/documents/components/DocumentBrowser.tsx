import React from "react";
import { Folder } from "lucide-react";
import { useTaskFlowStore } from "../../store";
import DocumentItem from "./DocumentItem";
import { Button } from "@/components/ui/button";

const DocumentBrowser: React.FC = () => {
  const { 
    currentFolder, 
    getChildFolders, 
    getFilesInFolder, 
    getFolderPath, 
    navigateToFolder 
  } = useTaskFlowStore();
  
  const childFolders = getChildFolders(currentFolder);
  const files = getFilesInFolder(currentFolder);
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
        
        {files.map(file => (
          <DocumentItem 
            key={file.id} 
            type="file" 
            id={file.id}
            name={file.name} 
          />
        ))}
      </div>
    </>
  );
};

export default DocumentBrowser;