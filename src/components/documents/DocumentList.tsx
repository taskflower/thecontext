import { useState, useEffect } from 'react';


import { FileText, MoreHorizontal, Edit, Trash, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDocumentStore } from '@/store/documentStore';
import { Column } from '../common/ColumnComponent';
import { IContainer, IContainerDocument } from '@/utils/documents/documentTypes';


interface DocumentListProps {
  container: IContainer | null;
  onSelectDocument: (document: IContainerDocument) => void;
}

export function DocumentList({ container, onSelectDocument }: DocumentListProps) {
  const { addDocument, updateDocument, removeDocument, containers } = useDocumentStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>('');
  const [editingDocument, setEditingDocument] = useState<IContainerDocument | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [currentContainer, setCurrentContainer] = useState<IContainer | null>(container);

  // Update currentContainer whenever container or containers state changes
  useEffect(() => {
    if (container) {
      // Find the fresh container data from the store
      const updatedContainer = containers.find(c => c.id === container.id) || null;
      setCurrentContainer(updatedContainer);
    } else {
      setCurrentContainer(null);
    }
  }, [container, containers]);

  // Set initial schema when container changes
  useEffect(() => {
    if (currentContainer?.schemas.length > 0 && !selectedSchemaId) {
      setSelectedSchemaId(currentContainer.schemas[0].id);
    }
  }, [currentContainer, selectedSchemaId]);

  const resetForm = () => {
    setNewDocTitle('');
    setNewDocContent('');
    setSelectedSchemaId(currentContainer?.schemas[0]?.id || '');
    setEditingDocument(null);
  };

  const handleAddDocument = () => {
    if (!currentContainer || !newDocTitle.trim()) return;
    
    const schemaId = selectedSchemaId || currentContainer.schemas[0]?.id || 'default';
    
    // Add the document to the store
    const docId = addDocument(currentContainer.id, {
      title: newDocTitle,
      content: newDocContent,
      customFields: {},
      schemaId
    });
    
    // Force immediate update of the UI by getting the latest data from the store
    const updatedContainer = useDocumentStore.getState().containers.find(
      c => c.id === currentContainer.id
    );
    
    if (updatedContainer) {
      setCurrentContainer(updatedContainer);
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEditDocument = () => {
    if (!currentContainer || !editingDocument || !newDocTitle.trim()) return;
    
    updateDocument(currentContainer.id, editingDocument.id, {
      title: newDocTitle,
      content: newDocContent,
      schemaId: selectedSchemaId || editingDocument.schemaId
    });
    
    resetForm();
    setIsDialogOpen(false);
  };

  const handleSelectDocument = (document: IContainerDocument) => {
    setSelectedDocument(document.id);
    onSelectDocument(document);
  };

  const openEditDialog = (document: IContainerDocument) => {
    setEditingDocument(document);
    setNewDocTitle(document.title);
    setNewDocContent(document.content);
    setSelectedSchemaId(document.schemaId);
    setIsDialogOpen(true);
  };

  if (!currentContainer) {
    return (
      <Column 
        title="Documents" 
        emptyState={
          <div className="flex h-[calc(100vh-240px)] items-center justify-center">
            <p className="text-sm text-muted-foreground">Select a container to view documents</p>
          </div>
        }
      >
        {null}
      </Column>
    );
  }

  const addButton = (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      setIsDialogOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add document</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editingDocument ? 'Edit Document' : 'New Document'}</DialogTitle>
          <DialogDescription>
            {editingDocument
              ? 'Edit document details and content.'
              : 'Create a new document in this container.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Title
              </label>
              <Input
                id="title"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="Document title"
                className="w-full mt-1"
              />
            </div>
            <div>
              <label htmlFor="schema" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Schema
              </label>
              <Select 
                value={selectedSchemaId} 
                onValueChange={setSelectedSchemaId}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select schema" />
                </SelectTrigger>
                <SelectContent>
                  {currentContainer.schemas.map((schema) => (
                    <SelectItem key={schema.id} value={schema.id}>
                      {schema.name}
                    </SelectItem>
                  ))}
                  {currentContainer.schemas.length === 0 && (
                    <SelectItem value="default">Default</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label htmlFor="content" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Content
            </label>
            <Textarea
              id="content"
              value={newDocContent}
              onChange={(e) => setNewDocContent(e.target.value)}
              placeholder="Document content"
              className="min-h-[200px] mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={editingDocument ? handleEditDocument : handleAddDocument}>
            {editingDocument ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const emptyState = (
    <div className="py-8 text-center text-sm text-muted-foreground">
      No documents in this container. Create one to get started.
    </div>
  );

  const documentItems = currentContainer.documents.map((document) => (
    <div
      key={document.id}
      onClick={() => handleSelectDocument(document)}
      className={`flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer ${
        selectedDocument === document.id ? 'bg-accent text-accent-foreground' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span className="font-medium">{document.title}</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              openEditDialog(document);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              removeDocument(currentContainer.id, document.id);
              if (selectedDocument === document.id) {
                setSelectedDocument(null);
              }
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ));

  return (
    <Column 
      title={`${currentContainer.name}`} 
      rightActions={addButton}
      emptyState={currentContainer.documents.length === 0 ? emptyState : undefined}
    >
      {currentContainer.documents.length > 0 && documentItems}
    </Column>
  );
}