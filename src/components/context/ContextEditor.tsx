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
    <div className="flex-1 p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Edycja kontekstu</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Elementy kontekstu</h2>

        <div className="space-y-4 mb-6">
          {contextForm.map((item, index) => (
            <div key={item.id} className="border border-gray-200 rounded p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">{item.title}</div>
                <div className="space-x-2">
                  <button
                    onClick={() =>
                      setEditingItem(editingItem === index ? null : index)
                    }
                    className="text-blue-500 text-sm"
                  >
                    {editingItem === index ? "Zakończ" : "Edytuj"}
                  </button>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 text-sm"
                  >
                    Usuń
                  </button>
                </div>
              </div>

              {editingItem === index ? (
                <div className="space-y-2">
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
                <div className="text-sm bg-gray-50 p-2 rounded overflow-auto max-h-24">
                  {item.content}
                </div>
              )}
            </div>
          ))}

          {!contextForm.length && (
            <EmptyState message="Brak elementów kontekstu" />
          )}
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold mb-2">Dodaj nowy element</h3>
          <div className="space-y-2">
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
              className={`px-4 py-2 rounded ${
                !newItemName.trim()
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Dodaj element
            </button>
          </div>
        </div>

        <div className="border-t mt-6 pt-6 flex justify-end">
          <button
            onClick={saveContext}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Zapisz zmiany
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContextEditor;
