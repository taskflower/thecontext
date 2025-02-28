import React, { useState } from "react";
import { Search, Folder, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDataStore, useUIStore } from "@/store";

const DocumentsHeader: React.FC = () => {
  const { addFolder } = useDataStore();
  const { currentFolder, toggleNewDocumentModal } = useUIStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  
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
    // We'll keep the search functionality in the header component
    if (searchTerm.trim()) {
      // Trigger search in the store or pass to parent via context
      // This will depend on how you want to structure your application
      const searchEvent = new CustomEvent('documentSearch', { 
        detail: { searchTerm } 
      });
      window.dispatchEvent(searchEvent);
    }
  };

  return (
    <div className="h-16 bg-background border-b px-6 flex justify-between items-center">
      <div className="text-xl font-medium">
        Documents
      </div>
      
      <div className="flex items-center">
        <form onSubmit={handleSearch} className="relative mr-4">
          <Input
            type="text"
            placeholder="Search documents..."
            className="w-64 pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
        </form>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-3"
          onClick={handleNewFolder}
        >
          <Folder size={16} className="mr-2" />
          New Folder
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={toggleNewDocumentModal}
        >
          <FileText size={16} className="mr-2" />
          New Document
        </Button>
      </div>
    </div>
  );
};

export default DocumentsHeader;