// src/modules/context/ContextEditor.tsx
import React, { useState } from "react";
import { X } from "lucide-react";
import { useAppStore } from "../../store";

interface ContextEditorProps {
  onClose: () => void;
}

export const ContextEditor: React.FC<ContextEditorProps> = ({ onClose }) => {
  const getContextItems = useAppStore((state) => state.getContextItems);
  const addContextItem = useAppStore((state) => state.addContextItem);
  const updateContextItem = useAppStore((state) => state.updateContextItem);
  const deleteContextItem = useAppStore((state) => state.deleteContextItem);
  
  const contextItems = getContextItems();
  const [selectedItem, setSelectedItem] = useState<string | null>(
    contextItems.length > 0 ? contextItems[0].id : null
  );
  
  const [newItemTitle, setNewItemTitle] = useState("");
  const [editMode, setEditMode] = useState(false);
  
  const currentItem = selectedItem ? contextItems.find(item => item.id === selectedItem) : null;
  const [content, setContent] = useState(currentItem?.content || "");
  
  const handleSave = () => {
    if (selectedItem) {
      updateContextItem(selectedItem, { content });
    }
  };
  
  const handleAddNewItem = () => {
    if (newItemTitle.trim()) {
      addContextItem({
        title: newItemTitle,
        content: ""
      });
      setNewItemTitle("");
      setEditMode(false);
      
      // Select the newly added item
      const updatedItems = getContextItems();
      if (updatedItems.length > 0) {
        setSelectedItem(updatedItems[updatedItems.length - 1].id);
        setContent("");
      }
    }
  };
  
  const handleDeleteItem = () => {
    if (selectedItem) {
      deleteContextItem(selectedItem);
      const remainingItems = contextItems.filter(item => item.id !== selectedItem);
      if (remainingItems.length > 0) {
        setSelectedItem(remainingItems[0].id);
        setContent(remainingItems[0].content);
      } else {
        setSelectedItem(null);
        setContent("");
      }
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-background border border-border rounded-lg shadow-lg w-full max-w-4xl h-3/4 flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-medium">Context Editor</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar with context items */}
          <div className="w-64 border-r border-border overflow-y-auto">
            <div className="p-3 border-b border-border">
              {editMode ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder="New item title"
                    className="flex-1 px-2 py-1 text-sm border border-border rounded-md mr-2"
                  />
                  <button 
                    onClick={handleAddNewItem}
                    className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-md"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="w-full px-3 py-1.5 text-sm bg-muted/50 hover:bg-muted rounded-md"
                >
                  Add New Item
                </button>
              )}
            </div>
            
            <ul className="p-2 space-y-1">
              {contextItems.map(item => (
                <li 
                  key={item.id} 
                  className={`
                    px-3 py-2 rounded-md text-sm cursor-pointer
                    ${selectedItem === item.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'}
                  `}
                  onClick={() => {
                    if (selectedItem !== item.id) {
                      // Save current content before switching
                      if (selectedItem) {
                        updateContextItem(selectedItem, { content });
                      }
                      setSelectedItem(item.id);
                      setContent(item.content);
                    }
                  }}
                >
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Editor area */}
          <div className="flex-1 flex flex-col">
            {selectedItem ? (
              <>
                <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                  <h4 className="font-medium">{currentItem?.title}</h4>
                  <div className="space-x-2">
                    <button
                      onClick={handleDeleteItem}
                      className="px-3 py-1 text-xs border border-destructive text-destructive rounded-md hover:bg-destructive/10"
                    >
                      Delete
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex-1 p-4 resize-none outline-none bg-background"
                  placeholder="Enter your context content here..."
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>Select or create a context item to edit</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
