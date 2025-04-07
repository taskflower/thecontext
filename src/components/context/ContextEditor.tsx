// components/context/ContextEditor.tsx
import React, { useState } from "react";
import useStore from "@/store";

interface FormFieldProps {
  label: string;
  name?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: "text" | "number" | "email" | "password";
  placeholder?: string;
  required?: boolean;
  rows?: number;
  hint?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  rows = 0,
  hint = "",
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2" htmlFor={name}>
      {label}
    </label>
    {rows > 0 ? (
      <textarea
        id={name}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="flex min-h-[80px] w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        rows={rows}
        required={required}
      />
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        required={required}
      />
    )}
    {hint && <p className="mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>}
  </div>
);

const ContextEditor: React.FC = () => {
  const contextForm = useStore((state) => state.contextForm);
  const updateContextForm = useStore((state) => state.updateContextForm);
  const saveContext = useStore((state) => state.saveContext);
  const navigateBack = useStore((state) => state.navigateBack);

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
    <div className="p-8 bg-[hsl(var(--background))]">
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={navigateBack}
          className="text-[hsl(var(--primary))] hover:opacity-80 text-sm font-medium"
        >
          ← Powrót
        </button>
        <h1 className="text-2xl font-semibold">Edycja kontekstu</h1>
      </div>

      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Elementy kontekstu</h2>

        <div className="space-y-4 mb-6">
          {contextForm.map((item, index) => (
            <div key={item.id} className="border border-[hsl(var(--border))] rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">{item.title}</div>
                <div className="space-x-2">
                  <button
                    onClick={() =>
                      setEditingItem(editingItem === index ? null : index)
                    }
                    className="text-[hsl(var(--primary))] text-sm hover:opacity-80"
                  >
                    {editingItem === index ? "Zakończ" : "Edytuj"}
                  </button>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-[hsl(var(--destructive))] text-sm hover:opacity-80"
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
                <div className="text-sm bg-[hsl(var(--muted))] p-2 rounded-md overflow-auto max-h-24 mt-1">
                  {item.content}
                </div>
              )}
            </div>
          ))}

          {!contextForm.length && (
            <div className="text-[hsl(var(--muted-foreground))] text-sm italic py-2">
              Brak elementów kontekstu
            </div>
          )}
        </div>

        <div className="border-t border-[hsl(var(--border))] pt-6 mt-6">
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
              className={`inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-2 ${
                !newItemName.trim()
                  ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
                  : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-opacity-90"
              }`}
            >
              Dodaj element
            </button>
          </div>
        </div>

        <div className="border-t border-[hsl(var(--border))] mt-8 pt-6 flex justify-end">
          <button
            onClick={saveContext}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-opacity-90 px-4 py-2"
          >
            Zapisz zmiany
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContextEditor;