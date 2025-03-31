import React, { useState, useEffect } from "react";
import { useAppStore } from "../../store";
import { detectContentType } from "../utils";
import { ContextType } from "../types";
import {
  CancelButton,
  DialogModal,
  InputField,
  SaveButton,
  TextAreaField,
} from "@/components/studio";

interface AddNewContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  scenarioId?: string; // Opcjonalne ID scenariusza
}

export const AddNewContext: React.FC<AddNewContextProps> = ({
  isOpen,
  setIsOpen,
  scenarioId,
}) => {
  const addContextItem = useAppStore((state) => state.addContextItem);
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: ContextType.TEXT,
    scenarioId: "",
    persistent: false,
  });

  // Inicjalizacja scenarioId, jeśli podano
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        scenarioId: scenarioId || "",
      }));
    }
  }, [isOpen, scenarioId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type: inputType } = e.target as HTMLInputElement;
    
    if (inputType === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Automatyczne wykrywanie typu na podstawie zawartości
      if (name === 'content') {
        const { type } = detectContentType(value);
        if (type === 'json') {
          setFormData((prev) => ({
            ...prev,
            type: ContextType.JSON,
          }));
        }
      }
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    
    addContextItem({
      title: formData.title,
      content: formData.content,
      type: formData.type,
      scenarioId: formData.scenarioId || undefined,
      persistent: formData.persistent,
    });
    
    // Resetowanie formularza
    setFormData({ 
      title: "", 
      content: "", 
      type: ContextType.TEXT,
      scenarioId: "",
      persistent: false,
    });
    
    setIsOpen(false);
  };

  const handleClose = () => setIsOpen(false);

  const renderFooter = () => (
    <>
      <CancelButton onClick={handleClose} />
      <SaveButton onClick={handleSubmit} disabled={!formData.title.trim()} />
    </>
  );

  // Pobierz aktualny scenariusz
  const currentScenario = getCurrentScenario();

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Dodaj element kontekstu"
      description="Utwórz nowy element kontekstu dla przestrzeni roboczej"
      footer={renderFooter()}
    >
      <InputField
        id="title"
        name="title"
        label="Nazwa (klucz)"
        value={formData.title}
        onChange={handleChange}
        placeholder="Nazwa elementu kontekstu"
      />

      <div className="space-y-1 mt-4">
        <label htmlFor="type" className="block text-sm font-medium">
          Typ zawartości
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value={ContextType.TEXT}>Tekst</option>
          <option value={ContextType.JSON}>JSON</option>
          <option value={ContextType.MARKDOWN}>Markdown</option>
          <option value={ContextType.INDEXED_DB}>IndexedDB</option>
        </select>
      </div>

      <div className="space-y-1 mt-4">
        <div className="flex items-center justify-between">
          <label htmlFor="content" className="block text-sm font-medium">
            Zawartość
          </label>
          {formData.type === ContextType.JSON && (
            <div className="text-xs text-blue-500 mb-1">
              Zawartość wykryta jako JSON
            </div>
          )}
        </div>
        <TextAreaField
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder={formData.type === ContextType.JSON
            ? '{ "klucz": "wartość" }'
            : formData.type === ContextType.INDEXED_DB
              ? "Nazwa kolekcji"
              : "Wprowadź zawartość kontekstu"}
          rows={8} label={""}        />
      </div>

      {currentScenario && (
        <div className="space-y-1 mt-4">
          <div className="flex items-center">
            <input
              id="scoped"
              name="scenarioId"
              type="checkbox"
              className="h-4 w-4 border-border rounded text-primary focus:ring-primary/30"
              checked={!!formData.scenarioId}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  scenarioId: e.target.checked ? currentScenario.id : "",
                }));
              }}
            />
            <label htmlFor="scoped" className="ml-2 block text-sm">
              Ogranicz do bieżącego scenariusza ({currentScenario.name})
            </label>
          </div>
        </div>
      )}

      <div className="space-y-1 mt-4">
        <div className="flex items-center">
          <input
            id="persistent"
            name="persistent"
            type="checkbox"
            className="h-4 w-4 border-border rounded text-primary focus:ring-primary/30"
            checked={formData.persistent}
            onChange={handleChange}
          />
          <label htmlFor="persistent" className="ml-2 block text-sm">
            Trwały (zachowaj między sesjami)
          </label>
        </div>
      </div>
    </DialogModal>
  );
};