// src/pages/documents/components/DocumentBrowser.tsx

import React from "react";
import { Folder } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import DocumentItem from "./DocumentItem";
import { Button } from "@/components/ui/button";
import { useDataStore, useUIStore } from "@/store";

const DocumentBrowser: React.FC = () => {
  const { getChildFolders, getDocItemsInFolder, getFolderPath, folders } =
    useDataStore();
  const { selectDocument } = useUIStore();
  
  // Use router params instead of internal state
  const { lang, folderId = "root" } = useParams();
  const navigate = useNavigate();

  const childFolders = getChildFolders(folderId);
  const docItems = getDocItemsInFolder(folderId);
  const folderPath = getFolderPath(folderId);

  // Get current folder to check if it's a project folder
  const currentFolderObj = folders.find(f => f.id === folderId);
  const isProjectFolder = currentFolderObj?.isProjectFolder;

  // Handle folder navigation with router
  const handleFolderNavigation = (navigateFolderId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin/${lang}/documents/${navigateFolderId}`);
  };

  // Handle document selection
  const handleDocSelection = (docId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    selectDocument(docId);
  };

  return (
    <>
      <div className="border-b pb-2 mb-4">
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          {folderPath.map((folder, index) => {
            // Determine folder icon color based on type
            const iconColorClass = 
              folder.isProjectRoot ? "text-purple-500" : 
              folder.isProjectFolder ? "text-green-500" : 
              "text-primary";
              
            return (
              <React.Fragment key={folder.id}>
                {index > 0 && <span className="mx-1">/</span>}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 flex items-center"
                  onClick={handleFolderNavigation(folder.id)}
                >
                  <Folder size={14} className={`mr-1 ${iconColorClass}`} />
                  <span>{folder.name}</span>
                </Button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {isProjectFolder && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
          <p className="text-sm">This is a project folder. Documents stored here will be associated with this project.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {childFolders.map((folder) => (
          <DocumentItem
            key={folder.id}
            type="folder"
            id={folder.id}
            name={folder.name}
            onNavigate={handleFolderNavigation(folder.id)}
          />
        ))}

        {docItems.map((docItem) => (
          <DocumentItem
            key={docItem.id}
            type="document"
            id={docItem.id}
            name={docItem.title}
            metaKeys={docItem.metaKeys}
            updatedAt={docItem.updatedAt}
            onSelect={handleDocSelection(docItem.id)}
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