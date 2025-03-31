import React, { useState, useEffect } from "react";
import { Copy, Tag, Database } from "lucide-react";
import { ContextItem, ContextType } from "../types";
import { useAppStore } from "../../store";
import { renderContextContent } from "../utils";
import {
  CancelButton,
  DialogModal,
} from "@/components/studio";

interface ViewContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  contextItemId: string;
}

export const ViewContext: React.FC<ViewContextProps> = ({
  isOpen,
  setIsOpen,
  contextItemId,
}) => {
  const getContextItems = useAppStore((state) => state.getContextItems);
  const [contextItem, setContextItem] = useState<ContextItem | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Load context item data when component mounts or contextItemId changes
  useEffect(() => {
    if (isOpen && contextItemId) {
      const items = getContextItems();
      const item = items.find((item) => item.id === contextItemId);
      if (item) {
        setContextItem(item);
      }
    }
  }, [isOpen, contextItemId, getContextItems]);

  const handleClose = () => setIsOpen(false);

  const handleCopyContent = () => {
    if (!contextItem) return;
    navigator.clipboard.writeText(contextItem.content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const renderFooter = () => (
    <div className="flex justify-between w-full">
      <button
        onClick={handleCopyContent}
        className="text-sm text-muted-foreground hover:text-foreground flex items-center"
      >
        <Copy className="h-4 w-4 mr-1" />
        {copySuccess ? "Skopiowano!" : "Kopiuj zawartość"}
      </button>
      <CancelButton onClick={handleClose} />
    </div>
  );

  if (!contextItem) return null;

  // Pobierz nazwę scenariusza, jeśli kontekst jest do niego przypisany
  const getScenarioName = () => {
    if (!contextItem.scenarioId) return null;
    
    const state = useAppStore.getState();
    const workspace = state.items.find(w => w.id === state.selected.workspace);
    if (!workspace) return "Nieznany scenariusz";
    
    const scenario = workspace.children.find(s => s.id === contextItem.scenarioId);
    return scenario ? scenario.name : "Nieznany scenariusz";
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Podgląd elementu kontekstu"
      description="Szczegóły elementu kontekstu"
      footer={renderFooter()}
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-1">Nazwa (klucz)</h3>
          <p className="text-xl font-black">{contextItem.title}</p>
        </div>

        {/* Właściwości kontekstu */}
        <div className="flex flex-wrap gap-2">
          <div className="px-2 py-1 bg-muted rounded-md text-xs flex items-center">
            <span className="font-medium mr-1">Typ:</span> 
            <span>{contextItem.type}</span>
          </div>
          
          {contextItem.scenarioId && (
            <div className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-md text-xs flex items-center">
              <Tag className="h-3 w-3 mr-1" />
              <span>Scenariusz: {getScenarioName()}</span>
            </div>
          )}
          
          {contextItem.persistent && (
            <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-md text-xs">
              Trwały
            </div>
          )}
          
          {contextItem.type === ContextType.INDEXED_DB && (
            <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-md text-xs flex items-center">
              <Database className="h-3 w-3 mr-1" />
              <span>Kolekcja IndexedDB</span>
            </div>
          )}
        </div>

        {/* Zawartość kontekstu */}
        <div>
          <h3 className="text-sm font-medium mb-2">Zawartość</h3>
          
          <div className="px-3 py-2 border border-border rounded-md bg-muted/30 max-h-96 overflow-y-auto">
            {contextItem.content ? (
              renderContextContent(contextItem.type, contextItem.content)
            ) : (
              <span className="text-muted-foreground italic">(Brak zawartości)</span>
            )}
          </div>
        </div>

        {/* Metadane kontekstu (jeśli istnieją) */}
        {contextItem.metadata && Object.keys(contextItem.metadata).length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Metadane</h3>
            <div className="px-3 py-2 border border-border rounded-md bg-muted/30">
              <pre className="text-xs font-mono overflow-auto max-h-40">
                {JSON.stringify(contextItem.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Informacje o czasie utworzenia/modyfikacji */}
        <div className="text-xs text-muted-foreground">
          <p>Utworzono: {new Date(contextItem.createdAt).toLocaleString()}</p>
          <p>Ostatnia modyfikacja: {new Date(contextItem.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </DialogModal>
  );
};