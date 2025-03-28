// src/modules/context/components/ContextsList.tsx
import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { useAppStore } from "../../store";
import { ContextItem } from "../types";
import { useDialogState } from "../../common/hooks";
import ContextItemComponent from "./ContextItemComponent";
import { ContextDialog, EditContextDialog, ViewContextDialog } from "./ContextDialogs";

const ContextsList: React.FC = () => {
  const getContextItems = useAppStore((state) => state.getContextItems);
  const addContextItem = useAppStore((state) => state.addContextItem);
  const deleteContextItem = useAppStore((state) => state.deleteContextItem);
  const updateContextItem = useAppStore((state) => state.updateContextItem);

  const contextItems = getContextItems();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ContextItem | null>(null);
  const [viewingItem, setViewingItem] = useState<ContextItem | null>(null);

  const { isOpen, formData, openDialog, handleChange, setIsOpen } =
    useDialogState<{
      title: string;
      content: string;
    }>({
      title: "",
      content: "",
    });

  const handleAddContextItem = () => {
    if (!formData.title.trim()) return;
    addContextItem({
      title: formData.title,
      content: formData.content || "",
    });
    setIsOpen(false);
  };

  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  const handleEditItem = (item: ContextItem) => {
    setEditingItem(item);
    setMenuOpen(null);
  };

  const handleViewItem = (item: ContextItem) => {
    setViewingItem(item);
    setMenuOpen(null);
  };

  const handleDeleteItem = (id: string) => {
    deleteContextItem(id);
    setMenuOpen(null);
  };

  // Nowa funkcja do czyszczenia wartości kontekstu
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
          onClick={() => openDialog()}
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
                onClearValue={handleClearValue} // Dodany nowy handler
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
      {isOpen && (
        <ContextDialog
          title="Add Context Item"
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleAddContextItem}
          handleClose={() => setIsOpen(false)}
        />
      )}

      {/* Edit Context Item Dialog */}
      {editingItem && (
        <EditContextDialog
          item={editingItem}
          handleClose={() => setEditingItem(null)}
        />
      )}

      {/* View Context Item Dialog */}
      {viewingItem && (
        <ViewContextDialog
          item={viewingItem}
          handleClose={() => setViewingItem(null)}
        />
      )}
    </div>
  );
};

export default ContextsList;