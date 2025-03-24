// src/modules/context/components/ContextsList.tsx
import React, { useState } from "react";
import { Edit, PlusCircle, MoreHorizontal, X, FileText } from "lucide-react";
import { useAppStore } from "../../store";
import { ContextItem } from "../types";
import { useDialogState } from "../../common/hooks";
import { cn } from "@/utils/utils";

const ContextsList: React.FC = () => {
  const getContextItems = useAppStore((state) => state.getContextItems);
  const addContextItem = useAppStore((state) => state.addContextItem);
  const deleteContextItem = useAppStore((state) => state.deleteContextItem);

  const contextItems = getContextItems();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ContextItem | null>(null);

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
                onDelete={deleteContextItem}
                menuOpen={menuOpen === item.id}
                toggleMenu={() => toggleMenu(item.id)}
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
    </div>
  );
};

interface ContextItemProps {
  item: ContextItem;
  onEdit: (item: ContextItem) => void;
  onDelete: (id: string) => void;
  menuOpen: boolean;
  toggleMenu: () => void;
}

const ContextItemComponent: React.FC<ContextItemProps> = ({
  item,
  onEdit,
  onDelete,
  menuOpen,
  toggleMenu,
}) => {
  return (
    <li className="group flex items-center justify-between px-2 py-2 rounded-md hover:bg-muted/50">
      <button className="flex items-center flex-1 min-w-0 text-left">
        <div className="mr-2">
          <FileText className="h-4 w-4" />
        </div>
        <span className="truncate text-sm font-medium">{item.title}</span>
      </button>

      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu();
          }}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground",
            menuOpen
              ? "bg-muted text-foreground"
              : "opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted"
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-1 w-36 bg-popover border border-border rounded-md shadow-md z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="w-full text-left px-3 py-2 text-sm flex items-center hover:bg-muted"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted flex items-center border-t border-border"
            >
              <X className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
};

interface ContextDialogProps {
  title: string;
  formData: {
    title: string;
    content: string;
  };
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleSubmit: () => void;
  handleClose: () => void;
}

const ContextDialog: React.FC<ContextDialogProps> = ({
  title,
  formData,
  handleChange,
  handleSubmit,
  handleClose,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter context title"
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Enter context content"
              rows={5}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EditContextDialogProps {
  item: ContextItem;
  handleClose: () => void;
}

const EditContextDialog: React.FC<EditContextDialogProps> = ({
  item,
  handleClose,
}) => {
  const updateContextItem = useAppStore((state) => state.updateContextItem);
  const [formData, setFormData] = useState({
    title: item.title,
    content: item.content,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    updateContextItem(item.id, {
      title: formData.title,
      content: formData.content,
    });
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Edit Context Item</h3>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter context title"
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Enter context content"
              rows={5}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextsList;
