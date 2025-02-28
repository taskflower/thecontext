/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/documents/components/DocumentsView.tsx

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import DocumentBrowser from "./DocumentBrowser";
import DocumentViewer from "./DocumentViewer";
import NewDocumentModal from "./NewDocumentModal";
import DocumentsHeader from "./DocumentsHeader";
import DocumentItem from "./DocumentItem";
import { useDataStore, useUIStore } from "@/store";
import { DocItem } from "@/types";

const DocumentsView: React.FC = () => {
  const { searchDocItems } = useDataStore();
  const { selectedDocument, selectDocument } = useUIStore();
  
  const [searchResults, setSearchResults] = useState<DocItem[]>([]);
  
  // Set up event listener for search events from the header
  useEffect(() => {
    const handleDocumentSearch = (event: CustomEvent) => {
      const { searchTerm } = event.detail;
      if (searchTerm.trim()) {
        const results = searchDocItems(searchTerm);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };

    window.addEventListener('documentSearch', handleDocumentSearch as EventListener);
    
    return () => {
      window.removeEventListener('documentSearch', handleDocumentSearch as EventListener);
    };
  }, [searchDocItems]);
  
  return (
    <div className="flex-1 flex flex-col">
      {/* Header component now directly uses the store */}
      <DocumentsHeader />
      
      {/* Main content */}
      <div className="p-6 flex-1 overflow-hidden flex flex-col">
        <div className="flex mb-4 gap-2"></div>
        
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
                      selectDocument(doc.id);
                      setSearchResults([]);
                    }}
                  />
                ))}
                <Button 
                  variant="link" 
                  className="text-xs py-0"
                  onClick={() => {
                    setSearchResults([]);
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
    </div>
  );
};

export default DocumentsView;