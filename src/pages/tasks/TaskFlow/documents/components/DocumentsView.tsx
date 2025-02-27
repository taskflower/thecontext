/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/documents/components/DocumentsView.tsx

import React, { useState } from "react";
import { Folder, FileText, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTaskFlowStore } from "../../store";

import DocumentBrowser from "./DocumentBrowser";
import DocumentViewer from "./DocumentViewer";
import NewDocumentModal from "./NewDocumentModal";

const DocumentsView: React.FC = () => {
  const { 
    addFolder, 
    currentFolder, 
    selectedDocument, 
    toggleNewDocumentModal,
    searchDocuments
  } = useTaskFlowStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const results = searchDocuments(searchTerm);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };
  
  return (
    <div className="p-6 flex-1 overflow-hidden flex flex-col">
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
          onClick={toggleNewDocumentModal}
        >
          <FileText size={16} />
          <span>New Document</span>
        </Button>
        
        <form onSubmit={handleSearch} className="ml-auto flex gap-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search documents..."
              className="w-64 pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>
      
      <div className="flex gap-6 flex-1 overflow-hidden">
        <Card className="p-4 flex-1 overflow-auto">
          {searchResults.length > 0 ? (
            <div className="mb-3 pb-2 border-b">
              <div className="text-sm font-medium mb-2">Search Results ({searchResults.length})</div>
              {searchResults.map(doc => (
                <DocumentItem
                  key={doc.id}
                  type="document"
                  id={doc.id}
                  name={doc.title}
                  metaKeys={doc.metaKeys}
                  updatedAt={doc.updatedAt}
                  onSelect={() => {
                    useTaskFlowStore.getState().selectDocument(doc.id);
                    setSearchResults([]);
                    setSearchTerm("");
                  }}
                />
              ))}
              <Button 
                variant="link" 
                className="text-xs py-0"
                onClick={() => {
                  setSearchResults([]);
                  setSearchTerm("");
                }}
              >
                Clear results
              </Button>
            </div>
          ) : null}
          <DocumentBrowser />
        </Card>
        
        {selectedDocument && (
          <div className="w-1/2 overflow-auto">
            <DocumentViewer />
          </div>
        )}
      </div>
      
      <NewDocumentModal />
    </div>
  );
};

// Import DocumentItem here to avoid circular dependency
import DocumentItem from "./DocumentItem";

export default DocumentsView;