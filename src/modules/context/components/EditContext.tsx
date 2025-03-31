// src/modules/context/components/EditContext.tsx
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

interface EditContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  contextItemId: string;
  onOpenDatabaseConfigurator?: () => void; // Funkcja do otwierania konfiguratora baz danych
}

export const EditContext: React.FC<EditContextProps> = ({
  isOpen,
  setIsOpen,
  contextItemId,
  onOpenDatabaseConfigurator
}) => {
  const getContextItems = useAppStore((state) => state.getContextItems);
  const updateContextItem = useAppStore((state) => state.updateContextItem);
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: ContextType.TEXT,
    scenarioId: "",
    persistent: false,
  });
  
  const [isUpdatingCollection, setIsUpdatingCollection] = useState(false);
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const [originalCollectionName, setOriginalCollectionName] = useState<string>("");
  const [availableCollections, setAvailableCollections] = useState<string[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

  // Load context item data when component mounts or contextItemId changes
  useEffect(() => {
    if (isOpen && contextItemId) {
      const items = getContextItems();
      const item = items.find((item) => item.id === contextItemId);
      if (item) {
        setFormData({
          title: item.title,
          content: item.content || "",
          type: item.type || ContextType.TEXT,
          scenarioId: item.scenarioId || "",
          persistent: item.persistent || false,
        });
        
        if (item.type === ContextType.INDEXED_DB) {
          setOriginalCollectionName(item.content);
        }
        
        setCollectionError(null);
      }
    }
  }, [isOpen, contextItemId, getContextItems]);
  
  // Ładowanie dostępnych kolekcji, gdy komponent jest otwarty i typ to IndexedDB
  useEffect(() => {
    async function loadCollections() {
      if (isOpen && formData.type === ContextType.INDEXED_DB) {
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
  }, [isOpen, formData.type]);

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

      // Auto-detect JSON content
      if (name === 'content') {
        const { type } = detectContentType(value);
        if (type === 'json' && formData.type === ContextType.TEXT) {
          setFormData((prev) => ({
            ...prev,
            type: ContextType.JSON,
          }));
        }
        
        // Reset collection error when editing content
        if (formData.type === ContextType.INDEXED_DB) {
          setCollectionError(null);
        }
      }
    }
  };
  
  // Funkcja sprawdzająca i tworząca kolekcję IndexedDB
  const ensureCollection = async (collectionName: string): Promise<boolean> => {
    try {
      setIsUpdatingCollection(true);
      setCollectionError(null);
      
      // Upewnij się, że kolekcja istnieje
      await IndexedDBService.ensureCollection(collectionName);
      
      setIsUpdatingCollection(false);
      return true;
    } catch (err) {
      setIsUpdatingCollection(false);
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
      
      // Tylko jeśli nazwa kolekcji się zmieniła lub to nowa kolekcja
      if (formData.content !== originalCollectionName) {
        // Upewnij się, że kolekcja istnieje
        const collectionReady = await ensureCollection(formData.content);
        if (!collectionReady) return;
      }
    }
    
    updateContextItem(contextItemId, {
      title: formData.title,
      content: formData.content,
      type: formData.type,
      scenarioId: formData.scenarioId || undefined,
      persistent: formData.persistent,
      metadata: formData.type === ContextType.INDEXED_DB ? {
        collection: formData.content
      } : undefined
    });
    setIsOpen(false);
  };

  const handleClose = () => setIsOpen(false);

  const renderFooter = () => (
    <>
      <CancelButton onClick={handleClose} />
      <SaveButton onClick={handleSubmit} disabled={!formData.title.trim() || isUpdatingCollection} />
    </>
  );

  // Get current scenario for context binding option
  const currentScenario = getCurrentScenario();

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edytuj element kontekstu"
      description="Zaktualizuj szczegóły elementu kontekstu"
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

      {formData.type === ContextType.INDEXED_DB ? (
        // Dla IndexedDB wyświetl pole na nazwę kolekcji
        <div className="space-y-1 mt-4">
          <div className="flex items-center justify-between">
            <label htmlFor="content" className="block text-sm font-medium">
              Nazwa kolekcji IndexedDB
            </label>
            <div className="text-xs text-purple-500 mb-1 flex items-center">
              <Database className="h-3 w-3 mr-1" />
              Kolekcja IndexedDB
            </div>
          </div>
          
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
        // Dla innych typów wyświetl standardowe pole na zawartość
        <div className="space-y-1 mt-4">
          <div className="flex items-center justify-between">
            <label htmlFor="content" className="block text-sm font-medium">
              Zawartość
            </label>
            {formData.type === ContextType.JSON && (
              <div className="text-xs text-blue-500 mb-1">
                Zawartość typu JSON
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
              : "Wprowadź zawartość kontekstu"}
            rows={8} 
            label={""}        
          />
        </div>
      )}

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