// src/pages/documents/components/DocumentsHeader.tsx
import { useState } from "react";
import { Search, Folder, FileText } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useUIStore } from "@/store";
import { Button, Input } from "@/components/ui";
import { documentService } from "../services";
import { useToast } from "@/hooks/useToast";

const DocumentsHeader: React.FC = () => {
  const { toggleNewDocumentModal } = useUIStore();
  const { toast } = useToast();
  const { lang, folderId = "root" } = useParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  const handleNewFolder = () => {
    const folderName = prompt("Enter folder name:");
    if (folderName?.trim()) {
      const result = documentService.createFolder(folderName, folderId);
      
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to create folder",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Folder created successfully",
        variant: "default"
      });
      
      // Navigate to the new folder
      if (result.data) {
        navigate(`/admin/${lang}/documents/${result.data.id}`);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // We'll keep the search functionality in the header component
    if (searchTerm.trim()) {
      // Trigger search in the store or pass to parent via context
      const searchEvent = new CustomEvent("documentSearch", {
        detail: { searchTerm },
      });
      window.dispatchEvent(searchEvent);
    }
  };

  return (
    <div className="h-16 bg-background border-b px-6 flex justify-between items-center">
      <h2 className="text-base font-semibold">Documents</h2>

      <div className="flex items-center">
        <form onSubmit={handleSearch} className="relative mr-4">
          <Input
            type="text"
            placeholder="Search documents..."
            className="w-64 pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            size={16}
            className="absolute left-3 top-2.5 text-muted-foreground"
          />
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

        <Button variant="outline" size="sm" onClick={toggleNewDocumentModal}>
          <FileText size={16} className="mr-2" />
          New Document
        </Button>
      </div>
    </div>
  );
};

export default DocumentsHeader;