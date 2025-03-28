// src/modules/context/components/ContextsList.tsx
import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { useAppStore } from "../../store";
import { ContextItem } from "../types";
import ContextItemComponent from "./ContextItemComponent";
import { AddNewContext } from "./AddNewContext";
import { EditContext } from "./EditContext";
import { ViewContext } from "./ViewContext";


const ContextsList: React.FC = () => {
  const getContextItems = useAppStore((state) => state.getContextItems);
  const deleteContextItem = useAppStore((state) => state.deleteContextItem);
  const updateContextItem = useAppStore((state) => state.updateContextItem);

  const contextItems = getContextItems();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  
  // Modal states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  const handleEditItem = (item: ContextItem) => {
    setSelectedItemId(item.id);
    setIsEditDialogOpen(true);
    setMenuOpen(null);
  };

  const handleViewItem = (item: ContextItem) => {
    setSelectedItemId(item.id);
    setIsViewDialogOpen(true);
    setMenuOpen(null);
  };

  const handleDeleteItem = (id: string) => {
    deleteContextItem(id);
    setMenuOpen(null);
  };

  // Function to clear context value
  const handleClearValue = (id: string) => {
    updateContextItem(id, { content: "" });
    setMenuOpen(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Context Items Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-base font-medium">Context</h2>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Add context item"
        >
          <PlusCircle className="h-5 w-5" />
        </button>
      </div>

      {/* Context Items List */}
      <div className="flex-1 overflow-auto p-2">
        {contextItems.length > 0 ? (
          <ul className="space-y-0.5">
            {contextItems.map((item: ContextItem) => (
              <ContextItemComponent
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onClearValue={handleClearValue}
                menuOpen={menuOpen === item.id}
                toggleMenu={() => toggleMenu(item.id)}
                onClick={handleViewItem}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            <p className="text-sm">No context items found</p>
            <p className="text-xs mt-1">
              Add context to help with your workflows
            </p>
          </div>
        )}
      </div>

      {/* Add Context Item Dialog */}
      <AddNewContext 
        isOpen={isAddDialogOpen} 
        setIsOpen={setIsAddDialogOpen} 
      />

      {/* Edit Context Item Dialog */}
      <EditContext
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        contextItemId={selectedItemId}
      />

      {/* View Context Item Dialog */}
      <ViewContext
        isOpen={isViewDialogOpen}
        setIsOpen={setIsViewDialogOpen}
        contextItemId={selectedItemId}
      />
    </div>
  );
};

export default ContextsList;