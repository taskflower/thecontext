import { useState } from 'react';

import { IContainer } from '@/utils/types';
import { PlusCircle, Folder, FolderOpen, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useDocumentStore } from '@/store/documentStore';
import { Column } from '../common/ColumnComponent';


export function ContainerList({ onSelectContainer }: { onSelectContainer: (container: IContainer) => void }) {
  const { containers, addContainer, removeContainer, updateContainer } = useDocumentStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContainerName, setNewContainerName] = useState('');
  const [editingContainer, setEditingContainer] = useState<IContainer | null>(null);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);

  const handleAddContainer = () => {
    if (newContainerName.trim()) {
      addContainer(newContainerName);
      setNewContainerName('');
      setIsDialogOpen(false);
    }
  };

  const handleEditContainer = () => {
    if (editingContainer && newContainerName.trim()) {
      updateContainer(editingContainer.id, { name: newContainerName });
      setEditingContainer(null);
      setNewContainerName('');
      setIsDialogOpen(false);
    }
  };

  const handleSelectContainer = (container: IContainer) => {
    setSelectedContainer(container.id);
    onSelectContainer(container);
  };

  const addButton = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only">Add container</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingContainer ? 'Edit Container' : 'New Container'}</DialogTitle>
          <DialogDescription>
            {editingContainer 
              ? 'Edit the container name. This will update all references to this container.'
              : 'Create a new container to organize your documents.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Input 
            value={newContainerName} 
            onChange={(e) => setNewContainerName(e.target.value)}
            placeholder="Container name"
            className="w-full"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsDialogOpen(false);
              setEditingContainer(null);
              setNewContainerName('');
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={editingContainer ? handleEditContainer : handleAddContainer}
          >
            {editingContainer ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const emptyState = (
    <div className="py-8 text-center text-sm text-muted-foreground">
      No containers found. Create one to get started.
    </div>
  );

  const containerItems = containers.map((container) => (
    <div
      key={container.id}
      onClick={() => handleSelectContainer(container)}
      className={`flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer ${
        selectedContainer === container.id ? 'bg-accent text-accent-foreground' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        {selectedContainer === container.id ? (
          <FolderOpen className="h-4 w-4" />
        ) : (
          <Folder className="h-4 w-4" />
        )}
        <span className="font-medium">{container.name}</span>
        <span className="text-xs text-muted-foreground">
          ({container.documents.length})
        </span>
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
              setEditingContainer(container);
              setNewContainerName(container.name);
              setIsDialogOpen(true);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              removeContainer(container.id);
              if (selectedContainer === container.id) {
                setSelectedContainer(null);
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
      title="Containers" 
      rightActions={addButton}
      emptyState={containers.length === 0 ? emptyState : undefined}
    >
      {containers.length > 0 && containerItems}
    </Column>
  );
}