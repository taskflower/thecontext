// components/context/ContextEditor.tsx
import React, { useState } from "react";
import { EmptyState, FormField } from "../theme";
import useStore from "@/store";

const ContextEditor: React.FC = () => {
  const contextForm = useStore((state) => state.contextForm);
  const updateContextForm = useStore((state) => state.updateContextForm);
  const saveContext = useStore((state) => state.saveContext);

  const [newItemName, setNewItemName] = useState("");
  const [newItemContent, setNewItemContent] = useState("");
  const [editingItem, setEditingItem] = useState<number | null>(null);

  if (!contextForm) return null;

  const handleChangeItem = (index: number, field: string, value: string) => {
    const updatedItems = [...contextForm];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    updateContextForm(updatedItems);
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    const newItem = {
      id: newItemName,
      title: newItemName,
      content: newItemContent || "{}",
    };

    updateContextForm([...contextForm, newItem]);
    setNewItemName("");
    setNewItemContent("");
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = contextForm.filter((_, i) => i !== index);
    updateContextForm(updatedItems);
  };

  return (
    <div className="flex-1 p-8 bg-background">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Edycja kontekstu</h1>

      <div className="card p-6">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Elementy kontekstu</h2>

        <div className="space-y-4 mb-6">
          {contextForm.map((item, index) => (
            <div key={item.id} className="border border-border rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">{item.title}</div>
                <div className="space-x-2">
                  <button
                    onClick={() =>
                      setEditingItem(editingItem === index ? null : index)
                    }
                    className="text-primary text-sm hover:text-primary/80"
                  >
                    {editingItem === index ? "Zakończ" : "Edytuj"}
                  </button>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-destructive text-sm hover:text-destructive/80"
                  >
                    Usuń
                  </button>
                </div>
              </div>

              {editingItem === index ? (
                <div className="space-y-3 mt-3">
                  <FormField
                    label="ID"
                    value={item.id}
                    onChange={(e) =>
                      handleChangeItem(index, "id", e.target.value)
                    }
                  />
                  <FormField
                    label="Tytuł"
                    value={item.title}
                    onChange={(e) =>
                      handleChangeItem(index, "title", e.target.value)
                    }
                  />
                  <FormField
                    label="Zawartość"
                    value={item.content}
                    onChange={(e) =>
                      handleChangeItem(index, "content", e.target.value)
                    }
                    rows={3}
                  />
                </div>
              ) : (
                <div className="text-sm bg-muted p-2 rounded-md overflow-auto max-h-24 mt-1">
                  {item.content}
                </div>
              )}
            </div>
          ))}

          {!contextForm.length && (
            <EmptyState message="Brak elementów kontekstu" />
          )}
        </div>

        <div className="border-t border-border pt-6 mt-6">
          <h3 className="text-sm font-semibold mb-3">Dodaj nowy element</h3>
          <div className="space-y-3">
            <FormField
              label="Nazwa/ID"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Nazwa/ID elementu"
            />
            <FormField
              label="Zawartość"
              value={newItemContent}
              onChange={(e) => setNewItemContent(e.target.value)}
              placeholder="Zawartość (JSON lub tekst)"
              rows={3}
            />
            <button
              onClick={handleAddItem}
              disabled={!newItemName.trim()}
              className={`btn ${
                !newItemName.trim()
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "btn-primary"
              } px-4 py-2`}
            >
              Dodaj element
            </button>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex justify-end">
          <button
            onClick={saveContext}
            className="btn btn-primary px-4 py-2"
          >
            Zapisz zmiany
          </button>
        </div>
      </div>
    </div>
  )}
  export default ContextEditor