// src/modules/context/components/AddNewContext.tsx
import React, { useState, useEffect } from "react";
import { useAppStore } from "../../store";
import { detectContentType } from "../utils";
import { ContextType } from "../types";
import { Database, Settings, Loader } from "lucide-react";
import {
  CancelButton,
  DialogModal,
  InputField,
  SaveButton,
  TextAreaField,
} from "@/components/studio";
import IndexedDBService from "../../indexedDB/service";

interface AddNewContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  scenarioId?: string; // Opcjonalne ID scenariusza
  onOpenDatabaseConfigurator?: () => void; // Funkcja do otwierania konfiguratora baz danych
}

export const AddNewContext: React.FC<AddNewContextProps> = ({
  isOpen,
  setIsOpen,
  scenarioId,
  onOpenDatabaseConfigurator
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
  
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const [availableCollections, setAvailableCollections] = useState<string[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

  // Inicjalizacja scenarioId, jeśli podano
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        scenarioId: scenarioId || "",
      }));
      setCollectionError(null);
    }
  }, [isOpen, scenarioId]);
  
  // Ładowanie dostępnych kolekcji, gdy typ zmienia się na IndexedDB
  useEffect(() => {
    async function loadCollections() {
      if (formData.type === ContextType.INDEXED_DB) {
        setIsLoadingCollections(true);
        try {
          const collections = await IndexedDBService.getCollections();
          setAvailableCollections(collections);
        } catch (err) {
          console.error("Error loading collections:", err);
          setAvailableCollections([]);
        } finally {
          setIsLoadingCollections(false);
        }
      }
    }
    
    loadCollections();
  }, [formData.type]);

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
      if (name === 'content' && formData.type === ContextType.TEXT) {
        const { type } = detectContentType(value);
        if (type === 'json') {
          setFormData((prev) => ({
            ...prev,
            type: ContextType.JSON,
          }));
        }
      }
      
      // Reset collection error when editing content
      if (name === 'content' && formData.type === ContextType.INDEXED_DB) {
        setCollectionError(null);
      }
    }
  };
  
  // Funkcja sprawdzająca i tworząca kolekcję IndexedDB
  const ensureCollection = async (collectionName: string): Promise<boolean> => {
    try {
      setIsCreatingCollection(true);
      setCollectionError(null);
      
      // Upewnij się, że kolekcja istnieje
      await IndexedDBService.ensureCollection(collectionName);
      
      setIsCreatingCollection(false);
      return true;
    } catch (err) {
      setIsCreatingCollection(false);
      setCollectionError(
        err instanceof Error ? err.message : "Nie udało się utworzyć kolekcji IndexedDB"
      );
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    
    // W przypadku IndexedDB sprawdź, czy podano nazwę kolekcji
    if (formData.type === ContextType.INDEXED_DB) {
      if (!formData.content.trim()) {
        setCollectionError("Podaj nazwę kolekcji IndexedDB");
        return;
      }
      
      // Upewnij się, że kolekcja istnieje
      const collectionReady = await ensureCollection(formData.content);
      if (!collectionReady) return;
    }
    
    addContextItem({
      title: formData.title,
      content: formData.content,
      type: formData.type,
      scenarioId: formData.scenarioId || undefined,
      persistent: formData.persistent,
      metadata: formData.type === ContextType.INDEXED_DB ? {
        collection: formData.content
      } : undefined
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
      <SaveButton onClick={handleSubmit} disabled={!formData.title.trim() || isCreatingCollection} />
    </>
  );

  // Pobierz aktualny scenariusz
  const currentScenario = getCurrentScenario();

  // Podpowiedź dla różnych typów kontekstu
  const getContentPlaceholder = () => {
    switch (formData.type) {
      case ContextType.JSON:
        return '{ "klucz": "wartość" }';
      case ContextType.INDEXED_DB:
        return "Nazwa kolekcji";
      case ContextType.MARKDOWN:
        return "# Nagłówek\nTwój tekst Markdown";
      default:
        return "Wprowadź zawartość kontekstu";
    }
  };

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
            {formData.type === ContextType.INDEXED_DB ? "Nazwa kolekcji" : "Zawartość"}
          </label>
          {formData.type === ContextType.JSON && (
            <div className="text-xs text-blue-500 mb-1">
              Zawartość wykryta jako JSON
            </div>
          )}
          {formData.type === ContextType.INDEXED_DB && (
            <div className="text-xs text-purple-500 mb-1 flex items-center">
              <Database className="h-3 w-3 mr-1" />
              Kolekcja IndexedDB
            </div>
          )}
        </div>
        
        {formData.type === ContextType.INDEXED_DB ? (
          <div className="space-y-1">
            <div className="flex gap-2">
              {isLoadingCollections ? (
                <div className="flex-1 px-3 py-2 border border-border rounded-md bg-background flex items-center justify-center">
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  <span className="text-sm text-muted-foreground">Ładowanie kolekcji...</span>
                </div>
              ) : availableCollections.length > 0 ? (
                <select
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className={`flex-1 px-3 py-2 border ${collectionError ? 'border-red-500' : 'border-border'} rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30`}
                >
                  <option value="">-- Wybierz kolekcję --</option>
                  {availableCollections.map(collection => (
                    <option key={collection} value={collection}>
                      {collection}
                    </option>
                  ))}
                  <option value="__new__">+ Utwórz nową kolekcję</option>
                </select>
              ) : (
                <div className="flex-1 flex gap-2">
                  <input
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Wprowadź nazwę kolekcji (np. users, products, settings)"
                    className={`flex-1 px-3 py-2 border ${collectionError ? 'border-red-500' : 'border-border'} rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30`}
                  />
                </div>
              )}
              
              {formData.content === "__new__" && (
                <input
                  name="newCollectionName"
                  placeholder="Nazwa nowej kolekcji"
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      content: e.target.value
                    }));
                  }}
                  className="flex-1 px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              )}
              
              {onOpenDatabaseConfigurator && (
                <button
                  type="button"
                  onClick={onOpenDatabaseConfigurator}
                  className="flex items-center justify-center px-3 py-2 border border-border rounded-md bg-muted hover:bg-muted/80"
                  aria-label="Otwórz konfigurator bazy danych"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {collectionError && (
              <div className="mt-1 text-xs text-red-500">
                {collectionError}
              </div>
            )}
            
            <div className="mt-2 text-xs text-muted-foreground">
              <p>{availableCollections.length > 0 
                ? "Wybierz istniejącą kolekcję lub utwórz nową." 
                : "Wprowadź nazwę kolekcji dla kontekstu IndexedDB."}</p>
              <p>Kolekcja zostanie utworzona automatycznie jeśli nie istnieje.</p>
              {onOpenDatabaseConfigurator && (
                <p>Możesz również użyć konfiguratora baz danych, aby zarządzać kolekcjami.</p>
              )}
            </div>
          </div>
        ) : (
          <TextAreaField
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder={getContentPlaceholder()}
            rows={8} 
            label={""}
          />
        )}
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