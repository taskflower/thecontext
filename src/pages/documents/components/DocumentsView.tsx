/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/documents/components/DocumentsView.tsx

import { useState, useEffect } from "react";

import { useParams } from "react-router-dom";

import DocumentBrowser from "./DocumentBrowser";
import DocumentViewer from "./DocumentViewer";
import NewDocumentModal from "./NewDocumentModal";
import DocumentsHeader from "./DocumentsHeader";
import DocumentItem from "./DocumentItem";
import { useDataStore, useUIStore } from "@/store";
import { DocItem } from "@/types";
import { Button, Card } from "@/components/ui";

const DocumentsView: React.FC = () => {
  const { searchDocItems } = useDataStore();
  const { selectedDocument, selectDocument } = useUIStore();
  const [searchResults, setSearchResults] = useState<DocItem[]>([]);
  
  // Get the current folder ID from URL params
  const { folderId = "root" } = useParams();

  // Update UI store's currentFolder when URL parameter changes
  useEffect(() => {
    // We're intentionally not calling navigateToFolder here
    // as we're decoupling the URL from the internal state
    // Only needed for NewDocumentModal to work properly
    useUIStore.setState({ currentFolder: folderId });
  }, [folderId]);
  
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
      <DocumentsHeader />
      
      {/* Main content */}
      <div className="p-4 flex-1 overflow-hidden flex flex-col bg-gray-50">
       
        
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