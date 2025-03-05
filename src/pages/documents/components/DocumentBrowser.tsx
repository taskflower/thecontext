// src/pages/documents/components/DocumentBrowser.tsx
import React from "react";
import { Folder } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useUIStore } from "@/store";
import { Button } from "@/components/ui";
import DocumentItem from "./DocumentItem";
import { documentService } from "../services";

const DocumentBrowser: React.FC = () => {
  const { selectDocument } = useUIStore();

  // Use router params instead of internal state
  const { lang, folderId = "root" } = useParams();
  const navigate = useNavigate();

  // Use documentService instead of direct store access
  const childFolders = documentService.getChildFolders(folderId);
  const docItems = documentService.getDocumentsInFolder(folderId);
  const folderPath = documentService.getFolderPath(folderId);

  // Handle folder navigation with router
  const handleFolderNavigation =
    (navigateFolderId: string) => (e: React.MouseEvent) => {
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
            return (
              <React.Fragment key={folder.id}>
                {index > 0 && <span className="mx-1">/</span>}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 flex items-center"
                  onClick={handleFolderNavigation(folder.id)}
                >
                  <Folder size={14} className={`mr-1`} />
                  <span>{folder.name}</span>
                </Button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

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